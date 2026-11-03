#!/usr/bin/env node

import { program } from 'commander';
import { Option } from 'commander';
import { config } from 'dotenv';
import globby = require('globby');
import fs from 'fs';
import path from 'path';
import { messageConstructor, SlackBlock } from './messageConstructor';
import { sendSlackMessage } from './slackClient';
import {
  CIProvider,
  resolveCIProvider,
  resolveCommitUrl,
  CIContext,
  RunStatus,
  VCSProvider
} from './slack';

interface MochawesomeStats {
  suites: number;
  tests: number;
  passes: number;
  failures: number;
  pending?: number;
  duration?: number;
}

export interface ReportStats {
  totalTests: number;
  totalPasses: number;
  totalFailures: number;
  totalSkipped: number;
  totalDuration: number;
  status: RunStatus;
}

export const parseMochawesomeStats = (report: unknown): ReportStats => {
  if (!report || typeof report !== 'object' || !('stats' in report)) {
    throw new Error('Mochawesome report does not contain a stats object');
  }
  const stats = (report as { stats: Partial<MochawesomeStats> }).stats;
  const requiredValues = [stats.tests, stats.passes, stats.failures];
  if (!requiredValues.every((value) => typeof value === 'number')) {
    throw new Error('Mochawesome report stats must include numeric tests, passes, and failures');
  }
  if (stats.pending !== undefined && typeof stats.pending !== 'number') {
    throw new Error('Mochawesome report pending count must be numeric');
  }

  const totalTests = stats.tests as number;
  const totalPasses = stats.passes as number;
  const totalFailures = stats.failures as number;
  const totalSkipped = stats.pending ?? 0;
  return {
    totalTests,
    totalPasses,
    totalFailures,
    totalSkipped,
    totalDuration: stats.duration ?? 0,
    status:
      totalTests === 0
        ? 'build:failed'
        : totalFailures > 0
          ? 'test:failed'
          : 'test:passed'
  };
};

export const expandCustomText = (
  text: string,
  env: Record<string, string | undefined> = process.env
) =>
  text
    .replace(/\\n/g, '\n')
    .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, bare) => {
      const value = env[braced || bare];
      return value === undefined ? match : value;
    });

const getDirectory = (directory: string, cwd: string) => {
  if (/^https?:\/\//i.test(directory)) {
    const url = new URL(directory);
    const artifactMarker = '/artifacts/file/';
    const markerIndex = url.pathname.indexOf(artifactMarker);
    const artifactPath =
      markerIndex >= 0
        ? decodeURIComponent(url.pathname.slice(markerIndex + artifactMarker.length))
        : path.basename(url.pathname);
    return {
      fileSystemPath: path.resolve(cwd, artifactPath),
      urlBase: directory.replace(/\/+$/, '')
    };
  }
  const localDirectory = directory.replace(/^artifacts\/file\//, '');
  return {
    fileSystemPath: path.resolve(cwd, localDirectory),
    relativeDirectory: path.relative(cwd, path.resolve(cwd, directory))
  };
};

const joinUrl = (base: string, relativePath: string) => {
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  const encodedPath = relativePath
    .split(/[\\/]/)
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodedPath}`;
  return url.toString();
};

const artifactDirectoryUrl = (
  directory: string,
  cwd: string,
  artifactBaseUrl?: string
) => {
  const resolved = getDirectory(directory, cwd);
  if (resolved.urlBase) return resolved.urlBase;
  if (!artifactBaseUrl) return undefined;
  const relativeDirectory =
    directory.startsWith('artifacts/file/')
      ? /\/artifacts\/file\/?$/.test(artifactBaseUrl)
        ? path.relative(cwd, resolved.fileSystemPath)
        : directory
      : path.relative(cwd, resolved.fileSystemPath);
  return joinUrl(artifactBaseUrl, relativeDirectory);
};

export const findArtifactLinks = async (
  directory: string,
  extension: string,
  label: string,
  cwd: string,
  artifactBaseUrl?: string
) => {
  const resolved = getDirectory(directory, cwd);
  const urlBase = artifactDirectoryUrl(directory, cwd, artifactBaseUrl);
  if (!urlBase) return [];

  const files = await globby(`**/*.${extension}`, {
    cwd: resolved.fileSystemPath,
    absolute: true,
    onlyFiles: true
  });
  return files.map((file) => {
    const relativePath = path.relative(resolved.fileSystemPath, file);
    const name = path.basename(file).replace(/[>|]/g, '');
    return `<${joinUrl(urlBase, relativePath)}|${label}: ${name}>`;
  });
};

const getReportFiles = async (directory: string, extension: string) => {
  const absoluteDirectory = path.resolve(process.cwd(), directory);
  return globby(`**/*.${extension}`, {
    cwd: absoluteDirectory,
    absolute: true,
    onlyFiles: true
  });
};

const readReport = async (reportDirectory: string) => {
  const reports = await getReportFiles(reportDirectory, 'json');
  if (!reports.length) {
    throw new Error(`No Mochawesome JSON report found in ${reportDirectory}`);
  }
  if (reports.length > 1) {
    console.warn(
      `Found ${reports.length} JSON reports in ${reportDirectory}; using ${path.basename(reports[0])}`
    );
  }
  const contents = fs.readFileSync(reports[0], 'utf8');
  return parseMochawesomeStats(JSON.parse(contents));
};

export interface ReporterOptions {
  ciProvider?: CIProvider;
  vcsProvider?: VCSProvider;
  reportDir?: string;
  screenshotDir?: string;
  videoDir?: string;
  customUrl?: string;
  customText?: string;
  onlyFailed?: boolean;
  useOnlyCustomUrl?: boolean;
  customBlocks?:
    | SlackBlock[]
    | ((stats: ReportStats, context: CIContext) => SlackBlock[]);
}

export const runReporter = async (
  options: ReporterOptions,
  env: Record<string, string | undefined> = process.env
) => {
  const {
    ciProvider = 'auto',
    vcsProvider = 'auto',
    reportDir = 'mochareports',
    screenshotDir = 'cypress/screenshots',
    videoDir = 'cypress/videos',
    customUrl = '',
    customText = '',
    onlyFailed = false,
    useOnlyCustomUrl = false
  } = options;
  const stats = await readReport(reportDir);
  if (onlyFailed && stats.status !== 'test:failed') {
    return { sent: false, reason: 'only-failed filter' };
  }

  const context = resolveCIProvider(ciProvider, env);
  const customBlocks =
    typeof options.customBlocks === 'function'
      ? options.customBlocks(stats, context)
      : options.customBlocks;
  const reportHtml = await getReportFiles(reportDir, 'html');
  const reportDirectoryUrl = artifactDirectoryUrl(
    reportDir,
    process.cwd(),
    context.artifactBaseUrl || customUrl
  );
  const reportUrl = useOnlyCustomUrl
    ? customUrl || undefined
    : reportHtml.length && reportDirectoryUrl
      ? joinUrl(reportDirectoryUrl, path.basename(reportHtml[0]))
      : customUrl || undefined;
  const [screenshots, videos] = await Promise.all([
    findArtifactLinks(
      screenshotDir,
      'png',
      'Screenshot',
      process.cwd(),
      context.artifactBaseUrl || customUrl
    ),
    findArtifactLinks(
      videoDir,
      'mp4',
      'Video',
      process.cwd(),
      context.artifactBaseUrl || customUrl
    )
  ]);
  const status = stats.status;
  const message = messageConstructor({
    status,
    projectName: context.projectName,
    branch: context.branch,
    actor: context.actor,
    commitUrl: resolveCommitUrl(vcsProvider, context, env),
    pullRequestUrl: context.pullRequestUrl,
    buildUrl: context.buildUrl || customUrl || undefined,
    reportUrl,
    totalTests: stats.totalTests,
    totalPasses: stats.totalPasses,
    totalFailures: stats.totalFailures,
    totalSkipped: stats.totalSkipped,
    customText: expandCustomText(customText, env),
    artifactLinks: [...screenshots, ...videos],
    customBlocks
  });

  await sendSlackMessage(message, status, env);
  return { sent: true, status };
};

export { messageConstructor } from './messageConstructor';
export type { MessageOptions, SlackBlock } from './messageConstructor';
export type { CIContext, CIProvider, RunStatus, VCSProvider } from './slack';

if (require.main === module) {
  if (!process.env.CI) config();
  const packageVersion = require('../package.json').version as string;
  interface CLIOptions {
    ciProvider: CIProvider;
    vcsProvider: VCSProvider;
    customUrl: string;
    reportDir: string;
    screenshotDir: string;
    videoDir: string;
    customText: string;
    onlyFailed?: boolean;
    useOnlyCustomUrl?: boolean;
    verbose?: boolean;
  }

  program
    .name('cypress-slack-reporter')
    .version(packageVersion)
    .addOption(
      new Option('--vcs-provider <provider>', 'VCS provider')
        .choices(['auto', 'github', 'gitlab', 'bitbucket', 'none'])
        .default('auto')
    )
    .addOption(
      new Option('--ci-provider <provider>', 'CI provider')
        .choices([
          'auto',
          'circleci',
          'github',
          'gitlab',
          'bitbucket',
          'jenkins',
          'custom',
          'none'
        ])
        .default('auto')
    )
    .option('--custom-url <url>', 'Fallback job or report URL', '')
    .option('--report-dir <path>', 'Mochawesome report directory', 'mochareports')
    .option('--screenshot-dir <path-or-url>', 'Cypress screenshot directory or artifact URL', 'cypress/screenshots')
    .option('--video-dir <path-or-url>', 'Cypress video directory or artifact URL', 'cypress/videos')
    .option('--custom-text <text>', 'Additional message text; supports \\n and $ENV_VAR expansion', '')
    .option('--only-failed', 'Send a message only when tests fail')
    .option('--use-only-custom-url, --useOnlyCustomUrl', 'Use --custom-url as the test report link')
    .option('--verbose', 'Print selected options')
    .parse(process.argv);

  const options = program.opts<CLIOptions>();
  if (options.verbose) {
    console.log('Reporter options:', {
      ciProvider: options.ciProvider,
      vcsProvider: options.vcsProvider,
      reportDir: options.reportDir,
      screenshotDir: options.screenshotDir,
      videoDir: options.videoDir,
      customUrl: options.customUrl
    });
  }

  runReporter(
    {
      ciProvider: options.ciProvider,
      vcsProvider: options.vcsProvider,
      reportDir: options.reportDir,
      screenshotDir: options.screenshotDir,
      videoDir: options.videoDir,
      customUrl: options.customUrl,
      customText: options.customText,
      onlyFailed: Boolean(options.onlyFailed),
      useOnlyCustomUrl: Boolean(options.useOnlyCustomUrl)
    },
    process.env
  ).catch((error: unknown) => {
    console.error(
      'cypress-slack-reporter failed:',
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  });
}
