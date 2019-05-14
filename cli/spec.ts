// tslint:disable-next-line: no-reference
/// <reference path='../types/cypress-npm-api.d.ts'/>
import * as CypressNpmApi from "cypress";
import { logger } from "../src/logger";
import { slackRunner } from "../src/slack/slack-alert";
// tslint:disable: no-var-requires
const marge = require("mochawesome-report-generator");
const { merge } = require("mochawesome-merge");
// tslint:disable: no-var-requires

CypressNpmApi.run({
  spec: "./cypress/integration/examples/pageObjects/login/*.ts",
  reporter: "mocha-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mocha-junit-reporter, mochawesome",
    mochaJunitReporterReporterOptions: {
      mochaFile: "cypress/reports/junit/test_results[hash].xml",
      toConsole: false
    },
    mochawesomeReporterOptions: {
      reportDir: "cypress/reports/mocha",
      quiet: true,
      overwrite: true,
      html: false,
      json: true
    }
  }
})
  .then(async results => {
    const generatedReport =  await Promise.resolve(generateReport({
      reportDir: "cypress/reports/mocha",
      inline: true,
      timeStamp: 'Date',
      saveJson: true
    }))
    logger.info("generatedReport",generatedReport);
    return generatedReport
  })
  .then(generatedReport => {
    logger.info("i shouldn't return first");
    const base = process.env.PWD || ".";
    const program: any = {
      ciProvider: "circleci",
      videoDir: `${base}/cypress/videos`,
      vcsProvider: "github",
      screenshotDir: `${base}/cypress/screenshots`,
      verbose: true,
      reportDir: `${base}/cypress/reports/mocha`
    };
    const ciProvider: string = program.ciProvider;
    const vcsProvider: string = program.vcsProvider;
    const reportDirectory: string = program.reportDir;
    const videoDirectory: string = program.videoDir;
    const screenshotDirectory: string = program.screenshotDir;
    const verbose: boolean = program.verbose;
    logger.info("starting slack upload", {
      ciProvider,
      vcsProvider,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      verbose
    });
    const slack = Promise.resolve(slackRunner(
      ciProvider,
      vcsProvider,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      verbose
    ));
    logger.info("finished slack upload", slack)

  })
  .catch((err: any) => {
    logger.warn(err);
  });

function generateReport(options: any) {
  return merge(options).then((report: any) => 
    marge.create(report, options)
  );
}
