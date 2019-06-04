// tslint:disable-next-line: no-reference
/// <reference path='../../node_modules/cypress/types/cypress-npm-api.d.ts'/>
import * as CypressNpmApi from "cypress";
import { logger } from "../logger";
import { slackRunner } from "../slack/slack-alert";
// tslint:disable: no-var-requires
const marge = require("mochawesome-report-generator");
const { merge } = require("mochawesome-merge");
// tslint:disable: no-var-requires

CypressNpmApi.run({
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mocha-junit-reporters, mochawesome",
    mochaJunitReportersReporterOptions: {
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
    const generatedReport = await Promise.resolve(
      generateReport({
        reportDir: "cypress/reports/mocha",
        inline: true,
        saveJson: true
      })
    );
    logger.info("Merged report available here:-", generatedReport);
    return generatedReport;
  })
  .then(generatedReport => {
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
    logger.info("Constructing Slack message with the following options", {
      ciProvider,
      vcsProvider,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      verbose
    });
    const slack = slackRunner(
      ciProvider,
      vcsProvider,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      verbose
    );
    logger.info("Finished slack upload");
  })
  .catch((err: any) => {
    logger.warn(err);
  });

function generateReport(options: any) {
  return merge(options).then((report: any) => marge.create(report, options));
}
