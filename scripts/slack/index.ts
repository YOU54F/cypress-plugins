/// &amp;amp;amp;lt;reference path="node_modules/@slack/dist/types/index.d.ts"&amp;amp;amp;gt;
/// &amp;amp;amp;lt;reference path="node_modules/@slack/webhook/dist/IncomingWebhook.d.ts"&amp;amp;amp;gt;

import * as program from "commander";
import * as slacker from "./slack-alert"

program
  .version('you54f/cypress-slack-reporter@0.0.1', '-v, --version')
  .option("--send", "Send the slack alert")
  .option('--vcs-provider [type]', 'VCS Provider [github|bitbucket]', 'github')
  .option('--ci-provider [type]', 'CI Provider [circleci|none]', 'circleci')
  .option("--results-dir", "mochawesome test results directory, relative to your package.json", './mochareports')
  .option("--report-dir", "mochawesome html test report directory, relative to your package.json", './mochareports')
  .option("--screenshot-dir", "cypress screenshot directory, relative to your package.json", './cypress/screenshots/**/*.png')
  .option("--videos-dir", "cypress video directory, relative to your package.json", './cypress/videos/**/*.png')
  .option("--report-filename", "html test report filename, will read ",'*.html')
  .parse(process.argv);

  slacker.runner(program.ciProvider, program.vcsProvider)