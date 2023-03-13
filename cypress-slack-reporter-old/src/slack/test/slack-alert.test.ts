// tslint:disable-next-line: no-reference
/// <reference path='../../../node_modules/@jest/types/build/index.d.ts'/>
import { MessageAttachment } from "@slack/types";
import "jest";
import * as path from "path";
import { env } from "process";
import { testables } from "../slack-alert";
const {
  buildHTMLReportURL,
  getScreenshotLinks,
  getVideoLinks,
  prChecker,
  webhookInitialArgs,
  attachmentReports,
  attachmentsVideoAndScreenshots,
  getTestReportStatus,
  getHTMLReportFilename,
} = testables;

const isWin = process.platform === "win32";
jest.setTimeout(10000);

const envVars = {
  CI_SHA1: "123",
  CI_BRANCH: "123",
  CI_USERNAME: "123",
  CI_BUILD_URL: "123",
  CI_BUILD_NUM: "123",
  CI_PULL_REQUEST: "123",
  CI_PROJECT_REPONAME: "Cypress",
  CI_PROJECT_USERNAME: "123",
  JOB_NAME: "123",
  CIRCLE_PROJECT_ID: "123",
  CIRCLE_WORKFLOW_JOB_ID: "123",
};
describe("webhookInitialArgs tester", () => {
  test("it returns the test status in the title", async () => {
    const s = await webhookInitialArgs({
      status: "passed",
      ciEnvVars: envVars,
    });
    expect(s).toMatchObject({ text: "Cypress test run passed\n" });
  });
  test("it returns the test status in the title", async () => {
    const s = await webhookInitialArgs({
      status: "failed",
      ciEnvVars: envVars,
    });
    expect(s).toMatchObject({ text: "Cypress test run failed\n" });
  });
  test("it returns the test status in the title", async () => {
    const s = await webhookInitialArgs({
      status: "error",
      ciEnvVars: envVars,
    });
    expect(s).toMatchObject({ text: "Cypress test build failed\n" });
  });
  test("it returns the test status in the title", async () => {
    const s = await webhookInitialArgs({
      status: "",
      ciEnvVars: envVars,
    });
    expect(s).toMatchObject({ text: "Cypress test status unknown\n" });
  });

  test("Returns a PR link if CIRCLE_PULL_REQUEST is is an empty string", async () => {
    const prLink = await prChecker({ ...envVars, CI_PULL_REQUEST: "" });
    const s = await webhookInitialArgs({
      status: "passed",
      ciEnvVars: envVars,
      prLink,
    });
    expect(s).toMatchObject({
      text: "Cypress test run passed\n",
    });
  });
  test("Returns a PR link if CIRCLE_PULL_REQUEST is defined", async () => {
    const CIRCLE_PULL_REQUEST = "http://sometesturl.com/pulls";
    const prLink = await prChecker({
      ...envVars,
      CI_PULL_REQUEST: CIRCLE_PULL_REQUEST,
    });
    const s = await webhookInitialArgs({
      status: "passed",
      ciEnvVars: envVars,
      prLink,
    });
    expect(s).toMatchObject({
      text: `Cypress test run passed\n<${CIRCLE_PULL_REQUEST}| - PR >`,
    });
  });
});

describe("Video Link Checker", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test("Returns video links, if REPORT_ARTEFACT_URL exists", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "videosDirPopulated");
    const s = await getVideoLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      videosDir: dir,
    });
    expect(s).toContain(
      `<http://sometesturl.com${dir}/small.mp4|Video:- small.mp4>`
    );
  });

  test("Returns blank string, if videos dir is empty", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "videosDirEmpty");
    const s = await getVideoLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      videosDir: dir,
    });
    expect(s).toEqual("");
  });
  test("Returns blank string, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    const dir: string = path.join(__dirname, "videosDirPopulated");
    const s = await getVideoLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      videosDir: dir,
    });
    expect(s).toEqual("");
  });
});

describe("Screenshot Link Checker", () => {
  test("Returns blank string if screenshot dir is empty and if REPORT_ARTEFACT_URL exists", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "screenshotDirEmpty");
    const s = await getScreenshotLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      screenshotDir: dir,
    });
    expect(s).toEqual("");
  });
  test("Returns blank string, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await getScreenshotLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      screenshotDir: dir,
    });
    expect(s).toEqual("");
  });
  test("Returns screenshots if REPORT_ARTEFACT_URL & screenshots exist", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await getScreenshotLinks({
      artefactUrl: REPORT_ARTEFACT_URL,
      screenshotDir: dir,
    });
    expect(s).toContain(
      `<http://sometesturl.com${dir}/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>`
    );
  });
});

describe("HTML report link checker", () => {
  test("Returns correct url if artefactUrl has no trailing slash", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "reportSingle");
    const s = await buildHTMLReportURL({
      reportDir: dir,
      artefactUrl: REPORT_ARTEFACT_URL,
      useOnlyCustomUrl: false,
    });
    expect(s).toEqual(
      `http://sometesturl.com${dir}/report-20190403-233436.html`
    );
  });
  test("Returns correct url if artefactUrl has trailing slash", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com/";
    const dir: string = path.join(__dirname, "reportSingle");
    const s = await buildHTMLReportURL({
      reportDir: dir,
      artefactUrl: REPORT_ARTEFACT_URL,
      useOnlyCustomUrl: false,
    });
    expect(s).toEqual(
      `http://sometesturl.com${dir}/report-20190403-233436.html`
    );
  });
  test("Returns correct url if reportDir is a relative path", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = "reportSingle";
    const s = await buildHTMLReportURL({
      reportDir: dir,
      artefactUrl: REPORT_ARTEFACT_URL,
      useOnlyCustomUrl: false,
    });
    expect(s).toContain(`http://sometesturl.com/${dir}`);
  });
});

describe("Test Report Parser", () => {
  test("Reads a report a returns the results", async () => {
    const reportDir = path.join(__dirname, "reportSingle");
    const reportResult = {
      totalDuration: 94597,
      totalFailures: 0,
      totalPasses: 18,
      totalSuites: 4,
      totalTests: 18,
      status: "passed",
    };
    const s = await getTestReportStatus(reportDir);
    expect(s).toMatchObject(reportResult);
  });
  test("Reads a passed status", async () => {
    const reportDir = path.join(__dirname, "jsonTestPass");
    const s = await getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "passed");
  });
  test("Reads a failed status", async () => {
    const reportDir = path.join(__dirname, "jsonTestFail");
    const s = await getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "failed");
  });
  test("Reads an error status", async () => {
    const reportDir = path.join(__dirname, "jsonBuildFail");
    const s = await getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "error");
  });
  test("Returns an error when a test report directory cannot be found", async () => {
    const reportDir = path.join(__dirname, "nonexistentdir");
    const s = await getTestReportStatus(reportDir);

    expect(s).toHaveProperty("status", "error");
  });
  test("Reads the first report and logs a warning when multiple json reports are found", async () => {
    const reportDir = path.join(__dirname, "reportMultiple");
    const s = await getTestReportStatus(reportDir);

    expect(s).toHaveProperty("status", "passed");
  });
});

describe("Test Report URL Generator", () => {
  test("Reads a report a returns the results", async () => {
    const reportDir = path.join(__dirname, "reportSingle");
    const s = await getHTMLReportFilename(reportDir);
    expect(s).toEqual("report-20190403-233436.html");
  });
  test("Return undefined when a html report directory or file cannot be found", async () => {
    const reportDir = path.join(__dirname, "nonexistentdir");
    const s = await getHTMLReportFilename(reportDir);
    expect(s).toEqual(undefined);
  });
  test("Returns an error when multiple html reports are found", async () => {
    const reportDir = path.join(__dirname, "reportMultiple");
    const s = await getHTMLReportFilename(reportDir);
    expect(s).toEqual("");
  });
});

describe("attachmentReports tester", () => {
  test("it returns attachments based on test status", async () => {
    const s = await attachmentReports({
      reportHTMLUrl: "test",
      reportStatistics: {
        totalSuites: 1,
        totalTests: 1,
        totalPasses: 1,
        totalFailures: 0,
        totalDuration: 0,
        reportFile: [],
        status: "passed",
      },
      ciEnvVars: envVars,
    });
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "primary",
            "text": "Test Report",
            "type": "button",
            "url": "test",
          },
          Object {
            "style": "primary",
            "text": "Build Logs",
            "type": "button",
            "url": "123",
          },
        ],
        "color": "#36a64f",
        "fallback": "Report available at test",
        "text": "Branch: 123
      Job: 123
      SUT: envsut
      Total Passed:  1",
        "title": "Total Tests: 1",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await attachmentReports({
      reportHTMLUrl: "test",
      reportStatistics: {
        totalSuites: 1,
        totalTests: 1,
        totalPasses: 0,
        totalFailures: 1,
        totalDuration: 0,
        reportFile: [],
        status: "failed",
      },
      ciEnvVars: envVars,
    });
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "primary",
            "text": "Test Report",
            "type": "button",
            "url": "test",
          },
          Object {
            "style": "primary",
            "text": "Build Logs",
            "type": "button",
            "url": "123",
          },
        ],
        "color": "#ff0000",
        "fallback": "Report available at test",
        "text": "Branch: 123
      Job: 123
      SUT: envsut
      Total Tests: 1
      Total Passed:  0 ",
        "title": "Total Failed: 1",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await attachmentReports({
      reportHTMLUrl: "test",
      reportStatistics: {
        totalSuites: 0,
        totalTests: 0,
        totalPasses: 0,
        totalFailures: 0,
        totalDuration: 0,
        reportFile: [],
        status: "error",
      },
      ciEnvVars: envVars,
    });
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "danger",
            "text": "Build Logs",
            "type": "button",
            "url": "123",
          },
        ],
        "color": "#ff0000",
        "fallback": "Build Log available at 123",
        "text": "Branch: 123
      Job: 123
      SUT: envsut
      Total Passed:  0 ",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await attachmentReports({
      reportHTMLUrl: "test",
      reportStatistics: {
        totalSuites: 1,
        totalTests: 1,
        totalPasses: 1,
        totalFailures: 0,
        totalDuration: 0,
        reportFile: [],
        status: "passedsdsd",
      },
      ciEnvVars: envVars,
    });

    expect(s).toEqual({});
  });
});

describe("attachmentsVideoAndScreenshots tester", () => {
  const attachments: MessageAttachment = {};
  test("it returns attachments based on test status", async () => {
    const s = await attachmentsVideoAndScreenshots({
      videoAttachmentsSlack: "",
      screenshotAttachmentsSlack:
        "<http://sometesturl.com/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>",
      status: "passed",
    });
    expect(s).toMatchObject({
      color: "#36a64f",
      text: `<http://sometesturl.com/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>`,
    });
  });
  test("it returns attachments based on test status", async () => {
    const s = await attachmentsVideoAndScreenshots({
      videoAttachmentsSlack:
        "<http://sometesturl.com$/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>",
      screenshotAttachmentsSlack: "",
      status: "failed",
    });

    expect(s).toMatchObject({
      color: "#ff0000",
      text: `<http://sometesturl.com$/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>`,
    });
  });
  test("it returns attachments based on test status", async () => {
    const s = await attachmentsVideoAndScreenshots({
      videoAttachmentsSlack: "dfsf",
      screenshotAttachmentsSlack: "sfd",
      status: "failed",
    });

    expect(s).toEqual({ color: "#ff0000", text: "dfsfsfd" });
  });
});

// describe("constructAndSend tester", () => {
//   test("it sends an error message if we cant get the status of the test build", async () => {
//     const s = await constructAndSend({
//       totalSuites: undefined,
//       totalTests: undefined,
//       totalPasses: undefined,
//       totalFailures: undefined,
//       totalDuration: undefined,
//       reportFile: [],
//       status: "dsds",
//     });
//     expect(s).toEqual([{ text: "ok" }]);
//   });
// });
