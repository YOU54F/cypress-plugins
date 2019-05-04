#!/usr/bin/env node

import * as program from "commander";
import * as fs from "fs";
import slackRunner from "./slack-alert";
let version;
try {
  const json = JSON.parse(
    fs.readFileSync(
      "./node_modules/cypress-slack-reporter/package.json",
      "utf8"
    )
  );
  version = json.version;
} catch (e) {
  version = "Cannot determine version";
}

const base = process.env.PWD || ".";

program
  .version(
    `git@github.com:YOU54F/cypress-slack-reporter.git@${version}`,
    "-v, --version"
  )
  .option("--vcs-provider [type]", "VCS Provider [github|bitbucket]", "github")
  .option("--ci-provider [type]", "CI Provider [circleci|none]", "circleci")
  .option(
    "--report-dir [type]",
    "mochawesome json & html test report directory, relative to your package.json",
    "/mochareports"
  )
  .option(
    "--screenshot-dir [type]",
    "cypress screenshot directory, relative to your package.json",
    "/cypress/screenshots"
  )
  .option(
    "--video-dir [type]",
    "cypress video directory, relative to your package.json",
    "/cypress/videos"
  )
  .option("--logger", "show log output")
  .parse(process.argv);

const ciProvider: string = program.ciProvider;
const vcsProvider: string = program.vcsProvider;
const reportDirectory: string = base + "/" + program.reportDir;
const videoDirectory: string = base + "/" + program.videoDir;
const screenshotDirectory: string = base + "/" + program.screenshotDir;
const logger: boolean = program.logger;

if (program.logger) {
  // tslint:disable-next-line: no-console
  console.log(
    " ciProvider:- " + ciProvider + "\n",
    "vcsProvider:- " + vcsProvider + "\n",
    "reportDirectory:- " + reportDirectory + "\n",
    "videoDirectory:- " + videoDirectory + "\n",
    "screenshotDirectory:- " + screenshotDirectory + "\n"
  );
}

slackRunner(
  ciProvider,
  vcsProvider,
  reportDirectory,
  videoDirectory,
  screenshotDirectory,
  logger,
  base
);
