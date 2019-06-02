// tslint:disable-next-line: no-reference
/// <reference path='../types/cypress-npm-api.d.ts'/>
import * as CypressNpmApi from "cypress";
import { logger } from "../src/logger";
import { slackRunner } from "../src/slack/slack-alert";
import {uploadMochaAwesome} from '../src/uploadS3/upload'
// tslint:disable: no-var-requires
const marge = require("mochawesome-report-generator");
const { merge } = require("mochawesome-merge");
// tslint:disable: no-var-requires

const base = process.env.PWD || ".";
const videoDir = `${base}/cypress/videos`;
const screenshotDir = `${base}/cypress/screenshots`;
const reportDir = `${base}/cypress/reports/mocha`;
function s3yolo(){
  // const s3 = uploadAll(videoDir,reportDir,screenshotDir)
  const s3 = uploadMochaAwesome(reportDir)
  console.log('s3',s3)

}
s3yolo()

// CypressNpmApi.run({
//   reporter: "mocha-multi-reporters",
//   reporterOptions: {
//     reporterEnabled: "mocha-junit-reporter, mochawesome",
//     mochaJunitReporterReporterOptions: {
//       mochaFile: "cypress/reports/junit/test_results[hash].xml",
//       toConsole: false
//     },
//     mochawesomeReporterOptions: {
//       reportDir: "cypress/reports/mocha",
//       quiet: true,
//       overwrite: true,
//       html: false,
//       json: true
//     }
//   }
// })
//   .then(async results => {
//     const generatedReport =  await Promise.resolve(generateReport({
//       reportDir: "cypress/reports/mocha",
//       inline: true,
//       saveJson: true,
//     }))
//     logger.info("Merged report available here:-",generatedReport);
//     return generatedReport
//   })
//   .then(async s3 => {
//     s3 = await uploadAll(videoDir,reportDir,screenshotDir)
//     console.log(s3)
//   })
//   .then(generatedReport => {
//     const program: any = {
//       ciProvider: "circleci",
//       vcsProvider: "github",
//       reportDir,
//       videoDir,
//       screenshotDir,
//       verbose: true,
//     };
//     const ciProvider: string = program.ciProvider;
//     const vcsProvider: string = program.vcsProvider;
//     const reportDirectory: string = program.reportDir;
//     const videoDirectory: string = program.videoDir;
//     const screenshotDirectory: string = program.screenshotDir;
//     const verbose: boolean = program.verbose;
//     logger.info("Constructing Slack message with the following options", {
//       ciProvider,
//       vcsProvider,
//       reportDirectory,
//       videoDirectory,
//       screenshotDirectory,
//       verbose
//     });
//     const slack = slackRunner(
//       ciProvider,
//       vcsProvider,
//       reportDirectory,
//       videoDirectory,
//       screenshotDirectory,
//       verbose
//     );
//     logger.info("Finished slack upload")

//   })
//   .catch((err: any) => {
//     logger.warn(err);
//   });

// function generateReport(options: any) {
//   return merge(options).then((report: any) => 
//     marge.create(report, options)
//   );
// }
