import "jest";
import * as path from "path";
import * as slacker from "./slack-alert";

jest.setTimeout(10000);

describe("Pull Request Checker", () => {
  test("Returns a PR link if CIRCLE_PULL_REQUEST is defined", async () => {
    const CIRCLE_PULL_REQUEST = "http://sometesturl.com/pulls";
    const s = await slacker.prChecker(CIRCLE_PULL_REQUEST);
    expect(s).toEqual(`<http://sometesturl.com/pulls| - PR >`);
  });
  test("Returns undefined if CIRCLE_PULL_REQUEST is an empty string", async () => {
    const CIRCLE_PULL_REQUEST = "";
    const s = await slacker.prChecker(CIRCLE_PULL_REQUEST);
    expect(s).toEqual(undefined);
  });
});

describe("Video Link Checker", () => {
  test("Returns video links, if REPORT_ARTEFACT_URL exists", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "test", "videosDirPopulated");
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    const rootDir: string = path.dirname(__dirname);
    expect(s).toContain(
      `<http://sometesturl.com${rootDir}/slack/test/videosDirPopulated/small.mp4|Video:- small.mp4>`
    );
  });
  test("Returns undefined, if videos dir is empty", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "test", "videosDirEmpty");
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toBe(undefined);
  });
  test("Returns error, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    try {
      const dir: string = path.join(__dirname, "test", "videosDirPopulated");
      const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe("Screenshot Link Checker", () => {
  test("Returns undefined if screenshot dir is empty and if REPORT_ARTEFACT_URL exists", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "test", "screenshotsDirPopulated");
    const s = await slacker.getScreenshotLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toEqual(undefined);
  });
  test("Returns undefined, if videos dir is empty", async () => {
    const REPORT_ARTEFACT_URL: string = "http://sometesturl.com";
    const dir: string = path.join(__dirname, "test", "screenshotsDirEmpty");
    const s = await slacker.getVideoLinks(REPORT_ARTEFACT_URL, dir);
    expect(s).toBe(undefined);
  });
  test("Returns error, if REPORT_ARTEFACT_URL doesnt exist", async () => {
    const REPORT_ARTEFACT_URL: string = "";
    const dir: string = path.join(__dirname, "test", "screenshotsDirPopulated");
    try {
      const s = await slacker.getScreenshotLinks(REPORT_ARTEFACT_URL, dir);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe("Get Files Checker", () => {
  test("Returns only specified filetypes if they exist in a dir", async () => {
    const dir: string = path.join(__dirname, "test", "reportSingle");
    const ext: string = ".html";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    const rootDir: string = path.dirname(__dirname);
    expect(s).toEqual([
      `${rootDir}/slack/test/reportSingle/report-20190403-233436.html`
    ]);
  });
  test("Returns an empty array if no specified filetypes are found ", async () => {
    const dir: string = path.join(__dirname, "test", "reportSingle");
    const ext: string = ".htm";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
  test("Returns an empty array if the directory is not found", async () => {
    const dir: string = path.join(__dirname, "test", "nonexistentdir");
    const ext: string = ".html";
    const fileList: string[] = [];
    const s = await slacker.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
});

describe("Test Report Parser", () => {
  test("Reads a report a returns the results", async () => {
    const reportDir = path.join(__dirname, "test", "reportSingle");
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
    const reportDir = path.join(__dirname, "test", "jsonTestPass");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "passed");
  });
  test("Reads a failed status", async () => {
    const reportDir = path.join(__dirname, "test", "jsonTestFail");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "failed");
  });
  test("Reads an error status", async () => {
    const reportDir = path.join(__dirname, "test", "jsonBuildFail");
    const s = await slacker.getTestReportStatus(reportDir);
    expect(s).toHaveProperty("status", "error");
  });
  test("Returns an error when a test report directory cannot be found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "test", "nonexistentdir");
      slacker.getTestReportStatus(reportDir);
    }
    expect(reportParser).toThrowError(new Error("Cannot find test report"));
  });
  test("Returns an error when multiple json reports are found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "test", "reportMultiple");
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
    const reportDir = path.join(__dirname, "test", "reportSingle");
    const s = await slacker.getHTMLReportFilename(reportDir);
    expect(s).toEqual("report-20190403-233436.html");
  });
  test("Returns an error when a test report directory or file cannot be found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "test", "nonexistentdir");
      slacker.getHTMLReportFilename(reportDir);
    }
    expect(reportParser).toThrowError(new Error("Cannot find test report"));
  });
  test("Returns an error when multiple html reports are found", async () => {
    function reportParser() {
      const reportDir = path.join(__dirname, "test", "reportMultiple");
      slacker.getHTMLReportFilename(reportDir);
    }
    expect(reportParser).toThrowError(
      new Error("Multiple reports found, please provide only a single report")
    );
  });
});
