#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageConstructor = exports.runReporter = exports.findArtifactLinks = exports.expandCustomText = exports.parseMochawesomeStats = void 0;
const commander_1 = require("commander");
const commander_2 = require("commander");
const dotenv_1 = require("dotenv");
const globby = require("globby");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const messageConstructor_1 = require("./messageConstructor");
const slackClient_1 = require("./slackClient");
const slack_1 = require("./slack");
const parseMochawesomeStats = (report) => {
    var _a, _b;
    if (!report || typeof report !== 'object' || !('stats' in report)) {
        throw new Error('Mochawesome report does not contain a stats object');
    }
    const stats = report.stats;
    const requiredValues = [stats.tests, stats.passes, stats.failures];
    if (!requiredValues.every((value) => typeof value === 'number')) {
        throw new Error('Mochawesome report stats must include numeric tests, passes, and failures');
    }
    if (stats.pending !== undefined && typeof stats.pending !== 'number') {
        throw new Error('Mochawesome report pending count must be numeric');
    }
    const totalTests = stats.tests;
    const totalPasses = stats.passes;
    const totalFailures = stats.failures;
    const totalSkipped = (_a = stats.pending) !== null && _a !== void 0 ? _a : 0;
    return {
        totalTests,
        totalPasses,
        totalFailures,
        totalSkipped,
        totalDuration: (_b = stats.duration) !== null && _b !== void 0 ? _b : 0,
        status: totalTests === 0
            ? 'build:failed'
            : totalFailures > 0
                ? 'test:failed'
                : 'test:passed'
    };
};
exports.parseMochawesomeStats = parseMochawesomeStats;
const expandCustomText = (text, env = process.env) => text
    .replace(/\\n/g, '\n')
    .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, bare) => {
    const value = env[braced || bare];
    return value === undefined ? match : value;
});
exports.expandCustomText = expandCustomText;
const getDirectory = (directory, cwd) => {
    if (/^https?:\/\//i.test(directory)) {
        const url = new URL(directory);
        const artifactMarker = '/artifacts/file/';
        const markerIndex = url.pathname.indexOf(artifactMarker);
        const artifactPath = markerIndex >= 0
            ? decodeURIComponent(url.pathname.slice(markerIndex + artifactMarker.length))
            : path_1.default.basename(url.pathname);
        return {
            fileSystemPath: path_1.default.resolve(cwd, artifactPath),
            urlBase: directory.replace(/\/+$/, '')
        };
    }
    const localDirectory = directory.replace(/^artifacts\/file\//, '');
    return {
        fileSystemPath: path_1.default.resolve(cwd, localDirectory),
        relativeDirectory: path_1.default.relative(cwd, path_1.default.resolve(cwd, directory))
    };
};
const joinUrl = (base, relativePath) => {
    const url = new URL(base.endsWith('/') ? base : `${base}/`);
    const encodedPath = relativePath
        .split(/[\\/]/)
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodedPath}`;
    return url.toString();
};
const artifactDirectoryUrl = (directory, cwd, artifactBaseUrl) => {
    const resolved = getDirectory(directory, cwd);
    if (resolved.urlBase)
        return resolved.urlBase;
    if (!artifactBaseUrl)
        return undefined;
    const relativeDirectory = directory.startsWith('artifacts/file/')
        ? /\/artifacts\/file\/?$/.test(artifactBaseUrl)
            ? path_1.default.relative(cwd, resolved.fileSystemPath)
            : directory
        : path_1.default.relative(cwd, resolved.fileSystemPath);
    return joinUrl(artifactBaseUrl, relativeDirectory);
};
const findArtifactLinks = async (directory, extension, label, cwd, artifactBaseUrl) => {
    const resolved = getDirectory(directory, cwd);
    const urlBase = artifactDirectoryUrl(directory, cwd, artifactBaseUrl);
    if (!urlBase)
        return [];
    const files = await globby(`**/*.${extension}`, {
        cwd: resolved.fileSystemPath,
        absolute: true,
        onlyFiles: true
    });
    return files.map((file) => {
        const relativePath = path_1.default.relative(resolved.fileSystemPath, file);
        const name = path_1.default.basename(file).replace(/[>|]/g, '');
        return `<${joinUrl(urlBase, relativePath)}|${label}: ${name}>`;
    });
};
exports.findArtifactLinks = findArtifactLinks;
const getReportFiles = async (directory, extension) => {
    const absoluteDirectory = path_1.default.resolve(process.cwd(), directory);
    return globby(`**/*.${extension}`, {
        cwd: absoluteDirectory,
        absolute: true,
        onlyFiles: true
    });
};
const readReport = async (reportDirectory) => {
    const reports = await getReportFiles(reportDirectory, 'json');
    if (!reports.length) {
        throw new Error(`No Mochawesome JSON report found in ${reportDirectory}`);
    }
    if (reports.length > 1) {
        console.warn(`Found ${reports.length} JSON reports in ${reportDirectory}; using ${path_1.default.basename(reports[0])}`);
    }
    const contents = fs_1.default.readFileSync(reports[0], 'utf8');
    return (0, exports.parseMochawesomeStats)(JSON.parse(contents));
};
const runReporter = async (options, env = process.env) => {
    const { ciProvider = 'auto', vcsProvider = 'auto', reportDir = 'mochareports', screenshotDir = 'cypress/screenshots', videoDir = 'cypress/videos', customUrl = '', customText = '', onlyFailed = false, useOnlyCustomUrl = false } = options;
    const stats = await readReport(reportDir);
    if (onlyFailed && stats.status !== 'test:failed') {
        return { sent: false, reason: 'only-failed filter' };
    }
    const context = (0, slack_1.resolveCIProvider)(ciProvider, env);
    const customBlocks = typeof options.customBlocks === 'function'
        ? options.customBlocks(stats, context)
        : options.customBlocks;
    const reportHtml = await getReportFiles(reportDir, 'html');
    const reportDirectoryUrl = artifactDirectoryUrl(reportDir, process.cwd(), context.artifactBaseUrl || customUrl);
    const reportUrl = useOnlyCustomUrl
        ? customUrl || undefined
        : reportHtml.length && reportDirectoryUrl
            ? joinUrl(reportDirectoryUrl, path_1.default.basename(reportHtml[0]))
            : customUrl || undefined;
    const [screenshots, videos] = await Promise.all([
        (0, exports.findArtifactLinks)(screenshotDir, 'png', 'Screenshot', process.cwd(), context.artifactBaseUrl || customUrl),
        (0, exports.findArtifactLinks)(videoDir, 'mp4', 'Video', process.cwd(), context.artifactBaseUrl || customUrl)
    ]);
    const status = stats.status;
    const message = (0, messageConstructor_1.messageConstructor)({
        status,
        projectName: context.projectName,
        branch: context.branch,
        actor: context.actor,
        commitUrl: (0, slack_1.resolveCommitUrl)(vcsProvider, context, env),
        pullRequestUrl: context.pullRequestUrl,
        buildUrl: context.buildUrl || customUrl || undefined,
        reportUrl,
        totalTests: stats.totalTests,
        totalPasses: stats.totalPasses,
        totalFailures: stats.totalFailures,
        totalSkipped: stats.totalSkipped,
        customText: (0, exports.expandCustomText)(customText, env),
        artifactLinks: [...screenshots, ...videos],
        customBlocks
    });
    await (0, slackClient_1.sendSlackMessage)(message, status, env);
    return { sent: true, status };
};
exports.runReporter = runReporter;
var messageConstructor_2 = require("./messageConstructor");
Object.defineProperty(exports, "messageConstructor", { enumerable: true, get: function () { return messageConstructor_2.messageConstructor; } });
if (require.main === module) {
    if (!process.env.CI)
        (0, dotenv_1.config)();
    const packageVersion = require('../package.json').version;
    commander_1.program
        .name('cypress-slack-reporter')
        .version(packageVersion)
        .addOption(new commander_2.Option('--vcs-provider <provider>', 'VCS provider')
        .choices(['auto', 'github', 'gitlab', 'bitbucket', 'none'])
        .default('auto'))
        .addOption(new commander_2.Option('--ci-provider <provider>', 'CI provider')
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
        .default('auto'))
        .option('--custom-url <url>', 'Fallback job or report URL', '')
        .option('--report-dir <path>', 'Mochawesome report directory', 'mochareports')
        .option('--screenshot-dir <path-or-url>', 'Cypress screenshot directory or artifact URL', 'cypress/screenshots')
        .option('--video-dir <path-or-url>', 'Cypress video directory or artifact URL', 'cypress/videos')
        .option('--custom-text <text>', 'Additional message text; supports \\n and $ENV_VAR expansion', '')
        .option('--only-failed', 'Send a message only when tests fail')
        .option('--use-only-custom-url, --useOnlyCustomUrl', 'Use --custom-url as the test report link')
        .option('--verbose', 'Print selected options')
        .parse(process.argv);
    const options = commander_1.program.opts();
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
    (0, exports.runReporter)({
        ciProvider: options.ciProvider,
        vcsProvider: options.vcsProvider,
        reportDir: options.reportDir,
        screenshotDir: options.screenshotDir,
        videoDir: options.videoDir,
        customUrl: options.customUrl,
        customText: options.customText,
        onlyFailed: Boolean(options.onlyFailed),
        useOnlyCustomUrl: Boolean(options.useOnlyCustomUrl)
    }, process.env).catch((error) => {
        console.error('cypress-slack-reporter failed:', error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
