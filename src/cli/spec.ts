#!/usr/bin/env node
// tslint:disable-next-line: no-reference
/// <reference path='../../node_modules/cypress/types/cypress-npm-api.d.ts'/>
import * as CypressNpmApi from "cypress";
// import { logger } from "../logger";
import { slackRunner } from "../slack/slack-alert";
// tslint:disable: no-var-requires
const marge = require("mochawesome-report-generator");
const { merge } = require("mochawesome-merge");
const del = require("del");
// tslint:disable: no-var-requires

CypressNpmApi.run({
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mocha-junit-reporter, mochawesome",
    mochaJunitReporterReporterOptions: {
      mochaFile: "cypress/reports/junit/test_results[hash].xml",
      toConsole: false
    },
    mochawesomeReporterOptions: {
      reportDir: "cypress/reports/mocha",
      quiet: true,
      overwrite: false,
      html: false,
      json: true
    }
  }
})
  .then(async results => {
    const generatedReport = await Promise.resolve(
      generateReport({
        files: ["cypress/reports/mocha/*.json"],
        inline: true,
        saveJson: true
      })
    );
    // tslint:disable-next-line: no-console
    console.log("Merged report available here:-", generatedReport);
    return generatedReport;
  })
  .then(async delFiles => {
    await del(["cypress/reports/mocha/mochawesome_*.json"]);
  })
  .then(generatedReport => {
    const program: any = {
      ciProvider: "circleci",
      videoDir: `cypress/videos`,
      vcsProvider: "github",
      screenshotDir: `cypress/screenshots`,
      verbose: true,
      reportDir: `mochawesome-report`
    };
    const ciProvider: string = program.ciProvider;
    const vcsProvider: string = program.vcsProvider;
    const reportDirectory: string = program.reportDir;
    const videoDirectory: string = program.videoDir;
    const screenshotDirectory: string = program.screenshotDir;
    const verbose: boolean = program.verbose;
    // tslint:disable-next-line: no-console
    console.log("Constructing Slack message with the following options", {
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
      "",
      verbose
    );
    // tslint:disable-next-line: no-console
    console.log("Finished slack upload");
  })
  .catch((err: any) => {
    // tslint:disable-next-line: no-console
    console.log(err);
  });

function generateReport(options: any) {
  return merge(options).then((report: any) => marge.create(report, options));
}
