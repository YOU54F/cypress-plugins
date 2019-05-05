import { MessageAttachment } from "@slack/types";
import { IncomingWebhookDefaultArguments } from "@slack/webhook";
import "jest";
import * as path from "path";
import * as slacker from "../slack-alert";

jest.setTimeout(10000);

describe("webhookInitialArgs tester", () => {
  const initialArgs: IncomingWebhookDefaultArguments = {};
  test("it returns the test status in the title", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.webhookInitialArgs(initialArgs, "passed");
    expect(s).toMatchObject({ text: "Cypress test run passed\n" });
  });
  test("it returns the test status in the title", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.webhookInitialArgs(initialArgs, "failed");
    expect(s).toMatchObject({ text: "Cypress test run failed\n" });
  });
  test("it returns the test status in the title", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.webhookInitialArgs(initialArgs, "error");
    expect(s).toMatchObject({ text: "Cypress test build failed\n" });
  });
  test("it returns the test status in the title", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.webhookInitialArgs(initialArgs, "");
    expect(s).toMatchObject({ text: "Cypress test status unknown\n" });
  });
  test("it returns the test status in the title", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.webhookInitialArgs(initialArgs, "");
    expect(s).toMatchObject({ text: "Cypress test status unknown\n" });
  });

  test("Returns a PR link if CIRCLE_PULL_REQUEST is is an empty string", async () => {
    const CIRCLE_PULL_REQUEST = "";
    await slacker.prChecker(CIRCLE_PULL_REQUEST);
    const s = await slacker.webhookInitialArgs(initialArgs, "");
    expect(s).toMatchObject({
      text: "Cypress test status unknown\n"
    });
  });
  test("Returns a PR link if CIRCLE_PULL_REQUEST is defined", async () => {
    const CIRCLE_PULL_REQUEST = "http://sometesturl.com/pulls";
    await slacker.prChecker(CIRCLE_PULL_REQUEST);
    const s = await slacker.webhookInitialArgs(initialArgs, "");
    expect(s).toMatchObject({
      text: "Cypress test status unknown\n<http://sometesturl.com/pulls| - PR >"
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
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toContain(
      `<http://sometesturl.com${dir}/small.mp4|Video:- small.mp4>`
    );
  });

  test("Returns blank string, if videos dir is empty", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "videosDirEmpty");
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toEqual("");
  });
  test("Returns blank string, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    const dir: string = path.join(__dirname, "videosDirPopulated");
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toEqual("");
  });
});

describe("Screenshot Link Checker", () => {
  test("Returns blank string if screenshot dir is empty and if REPORT_ARTEFACT_URL exists", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "screenshotDirEmpty");
    const s = await slacker.getScreenshotLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toEqual("");
  });
  test("Returns blank string, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.getScreenshotLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toEqual("");
  });
  test("Returns screenshots if REPORT_ARTEFACT_URL & screenshots exist", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.getScreenshotLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toContain(
      `<http://sometesturl.com${dir}/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>`
    );
  });
});

describe("Get Files Checker", () => {
  test("Returns only specified filetypes if they exist in a dir", async () => {
    const dir: string = path.join(__dirname, "reportSingle");
    const ext: string = ".html";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    const rootDir: string = path.dirname(__dirname);
    expect(s).toEqual([
      `${rootDir}/test/reportSingle/report-20190403-233436.html`
    ]);
  });
  test("Returns an empty array if no specified filetypes are found ", async () => {
    const dir: string = path.join(__dirname, "reportSingle");
    const ext: string = ".htm";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
  test("Returns an empty array if the directory is not found", async () => {
    const dir: string = path.join(__dirname, "nonexistentdir");
    const ext: string = ".html";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
  test("returns an empty list if the mochareports doesnt exist", async () => {
    const dir: string = path.join("mochareports");
    const ext: string = ".html";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });

  test("Can process nested folders", async () => {
    const dir: string = path.join(__dirname, "nestedfolder");
    const ext: string = ".png";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toHaveLength(2);
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
      status: "passed"
    };
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toMatchObject(reportResult);
  });
  test("Reads a passed status", async () => {
    const reportDir = path.join(__dirname, "jsonTestPass");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "passed");
  });
  test("Reads a failed status", async () => {
    const reportDir = path.join(__dirname, "jsonTestFail");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "failed");
  });
  test("Reads an error status", async () => {
    const reportDir = path.join(__dirname, "jsonBuildFail");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "error");
  });
  test("Returns an error when a test report directory cannot be found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "nonexistentdir");
      slacker.getTestReportStatus(reportDir);
    }
    expect(reportParser).toThrow();
  });
  test("Returns an error when multiple json reports are found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "reportMultiple");
      slacker.getTestReportStatus(reportDir);
    }
    expect(reportParser).toThrowError(
      new Error(
        "Multiple json reports found, please run mochawesome-merge to provide a single report"
      )
    );
  });
});

describe("Test Report URL Generator", () => {
  test("Reads a report a returns the results", async () => {
    const reportDir = path.join(__dirname, "reportSingle");
    const s = await slacker.getHTMLReportFilename(reportDir);
    expect(s).toEqual("report-20190403-233436.html");
  });
  test("Returns an error when a test report directory or file cannot be found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "nonexistentdir");
      slacker.getHTMLReportFilename(reportDir);
    }
    expect(reportParser).toThrow();
  });
  test("Returns an error when multiple html reports are found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "reportMultiple");
      slacker.getHTMLReportFilename(reportDir);
    }
    expect(reportParser).toThrowError(
      new Error("Multiple reports found, please provide only a single report")
    );
  });
});

describe("attachmentReports tester", () => {
  const attachments: MessageAttachment = {};
  test("it returns attachments based on test status", async () => {
    const s = await slacker.attachmentReports(attachments, "passed");
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "primary",
            "text": "Test Report",
            "type": "button",
            "url": "undefined",
          },
          Object {
            "style": "primary",
            "text": "CircleCI Logs",
            "type": "button",
            "url": "undefined",
          },
        ],
        "color": "#36a64f",
        "fallback": "Report available at undefined",
        "text": "Total Passed:  0",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await slacker.attachmentReports(attachments, "failed");
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "primary",
            "text": "Test Report",
            "type": "button",
            "url": "undefined",
          },
          Object {
            "style": "primary",
            "text": "CircleCI Logs",
            "type": "button",
            "url": "undefined",
          },
        ],
        "color": "#ff0000",
        "fallback": "Report available at undefined",
        "text": "Total Tests: 0
      Total Passed:  0 ",
        "title": "Total Failed: 0",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await slacker.attachmentReports(attachments, "error");
    expect(s).toMatchInlineSnapshot(`
      Object {
        "actions": Array [
          Object {
            "style": "danger",
            "text": "CircleCI Logs",
            "type": "button",
            "url": "undefined",
          },
        ],
        "color": "#ff0000",
        "fallback": "Build Log available at undefined",
        "text": "Total Passed:  0 ",
      }
    `);
  });
  test("it returns attachments based on test status", async () => {
    const s = await slacker.attachmentReports(attachments, "dfdfsfs");
    expect(s).toEqual({});
  });
});

describe("attachmentsVideoAndScreenshots tester", () => {
  const attachments: MessageAttachment = {};
  test("it returns attachments based on test status", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.attachmentsVideoAndScreenshots(
      attachments,
      "passed"
    );
    expect(s).toMatchObject({
      color: "#36a64f",
      text: `<http://sometesturl.com${dir}/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>\n`
    });
  });
  test("it returns attachments based on test status", async () => {
    const dir: string = path.join(__dirname, "screenshotDirPopulated");
    const s = await slacker.attachmentsVideoAndScreenshots(
      attachments,
      "failed"
    );
    expect(s).toMatchObject({
      color: "#ff0000",
      text: `<http://sometesturl.com${dir}/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>\n`
    });
  });
  test("it returns attachments based on test status", async () => {
    const s = await slacker.attachmentsVideoAndScreenshots(
      attachments,
      "dfdfsfs"
    );
    expect(s).toEqual({});
  });
});

describe("constructMessage tester", () => {
  test("it throws an error if we cant get the status of the test build", async () => {
    function mockRunner() {
      slacker.constructMessage("");
    }
    expect(mockRunner).toThrowError(
      "An error occured getting the status of the test run"
    );
  });
});
