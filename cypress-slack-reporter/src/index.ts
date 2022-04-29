#!/usr/bin/env node

import { program } from 'commander';
import { config } from 'dotenv';
import globby = require('globby');
import { cypressRunStatus } from './slack';
import * as SlackClient from './slackClient';
import path from 'path';
import { Blocks, Message, Elements } from 'slack-block-builder';

const getVideos = async () => {
  const paths = await globby(path.resolve(process.cwd(), 'cypress', 'videos'), {
    expandDirectories: {
      files: ['*'],
      extensions: ['mp4']
    }
  });
  return paths;
};
const getReports = async () => {
  const paths = await globby(
    path.resolve(process.cwd(), 'cypress', 'reports'),
    {
      expandDirectories: {
        files: ['*'],
        extensions: ['html', 'json']
      }
    }
  );

  return paths;
};
const getScreenshots = async () => {
  const paths = await globby(
    path.resolve(process.cwd(), 'cypress', 'screenshots'),
    {
      expandDirectories: {
        files: ['*'],
        extensions: ['png']
      }
    }
  );

  return paths;
};

const main = async () => {
  if (!process.env.CI) {
    config();
  }

  program
    .version(
      `git@github.com:YOU54F/cypress-slack-reporter.git@2.alpha`,
      '-v, --version'
    )
    .option(
      '--vcs-provider [type]',
      'VCS Provider [github|bitbucket|none]',
      'github'
    )
    .option(
      '--ci-provider [type]',
      'CI Provider [circleci|jenkins|bitbucket|none|custom]',
      'circleci'
    )
    .option(
      '--custom-url [type]',
      'On selected --ci-provider=custom this link will be set to Test Report',
      ''
    )
    .option(
      '--report-dir [type]',
      'mochawesome json & html test report directory, relative to your packageon',
      'mochareports'
    )
    .option(
      '--screenshot-dir [type]',
      'cypress screenshot directory, relative to your packageon',
      'cypress/screenshots'
    )
    .option(
      '--video-dir [type]',
      'cypress video directory, relative to your packageon',
      'cypress/videos'
    )
    .option('--verbose', 'show log output')
    .option('--only-failed', 'only send message for failed tests')
    .option(
      '--custom-text [type]',
      'add additional text to message, wrap message in quotes'
    )
    // .option("--s3", "upload artefacts to s3")
    .parse(process.argv);

  const options = program.opts();
  const ciProvider: string = options.ciProvider;
  const vcsProvider: string = options.vcsProvider;
  const reportDir: string = options.reportDir;
  const videoDir: string = options.videoDir;
  const customUrl: string = options.customUrl;
  const screenshotDir: string = options.screenshotDir;
  const onlyFailed: boolean = options.onlyFailed;
  const customText: string = options.customText;
  // const verbose: boolean = program.verbose;

  if (options.verbose) {
    // tslint:disable-next-line: no-console
    console.log(
      ' ciProvider:- ' + ciProvider + '\n',
      'customUrl:- ' + customUrl + '\n',
      'vcsProvider:- ' + vcsProvider + '\n',
      'reportDirectory:- ' + reportDir + '\n',
      'videoDirectory:- ' + videoDir + '\n',
      'screenshotDirectory:- ' + screenshotDir + '\n'
    );
  }

  const buildUrl = (...urlComponents: Array<string | undefined>) => {
    return (
      urlComponents
        // Trim leading & trailing slashes
        .map((component) => String(component).replace(/^\/|\/$/g, ''))
        .join('/')
    );
  };
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  const SLACK_TOKEN = process.env.SLACK_TOKEN;

  const videoPaths = await getVideos();
  const screenshotPaths = await getScreenshots();
  const artefactBasePath = 'http://screenshots.com';
  const buildArtefactLinks = (
    name: string,
    paths: string[],
    urlBase: string,
    directory: string
  ) =>
    paths.map((filePath: string) => {
      const fileName = path.basename(filePath);
      return Blocks.Section({
        text: `<${buildUrl(
          urlBase,
          directory,
          path.relative(directory, filePath)
        )}|${name}:- ${fileName}>`
      });
    });

  // console.log(JSON.stringify(screenshotLinks.join('')));
  const reports = await getReports();
  console.log('files and ting', videoPaths, screenshotPaths, reports);
  if (!SLACK_WEBHOOK_URL && !SLACK_TOKEN) {
    throw new Error(
      'Cant send message without one of, [SLACK_WEBHOOK_URL,SLACK_TOKEN]'
    );
  }

  if (SLACK_WEBHOOK_URL) {
    const client = SlackClient.getIncomingWebHookClient(SLACK_WEBHOOK_URL);
    SlackClient.sendViaWebhook(
      { status: 'test:failed' as cypressRunStatus },
      client,
      [
        videoPaths.length > 0 ? Blocks.Header({ text: 'Videos' }) : undefined,
        videoPaths.length > 0
          ? buildArtefactLinks('Videos', videoPaths, artefactBasePath, videoDir)
          : undefined,
        videoPaths.length > 0 ? Blocks.Divider() : undefined,
        screenshotPaths.length > 0
          ? Blocks.Header({ text: 'Screenshots' })
          : undefined,
        screenshotPaths.length > 0
          ? buildArtefactLinks(
              'Screenshots',
              screenshotPaths,
              artefactBasePath,
              screenshotDir
            )
          : undefined,
        screenshotPaths.length > 0 ? Blocks.Divider() : undefined
      ]
    )
      .then((res) => {
        if (res.text !== 'ok')
          console.log('webhook failure:', res.original.response.data);
        else console.log('webhook success:', res);
      })
      .catch((err) => console.log('webhook failure:', err));
  }

  if (SLACK_TOKEN) {
    const client = SlackClient.getChatBotClient(SLACK_TOKEN);
    SlackClient.sendViaBot(
      { status: 'test:failed' as cypressRunStatus, channel: 'github-test' },
      client,
      [
        Blocks.Section({
          text: '<http://sometesturl.com$/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>'
        })
      ]
    )
      .then((res) => {
        if (!res.ok)
          console.log(
            'web-bot failure:',
            res.response ? res.response.data.response : res
          );
        else console.log('web-bot success:', res);
      })
      .catch((err) => console.log('web-bot failure:', err));
  }
};

main();
