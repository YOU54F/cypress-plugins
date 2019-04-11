import "jest";
import * as path from "path";
import * as SlackMock from "slack-mock";
// // import {
// //   getFiles,
// //   getHTMLReportFilename,
// //   getScreenshotLinks,
// //   getTestReportStatus
// //   getVideoLinks,
// //   prChecker,
// // } from "./slack-alert";
import slackRunner from "./slack-alert";
jest.setTimeout(10000);

const vcsProvider: string = "github";
const ciProvider: string = "circleci";
let reportDirectory: string = "scripts/slack/test/jsonTestPass";
const videoDirectory: string = "scripts/slack/test/screenshotDirPopulated";
const screenshotDirectory: string = "scripts/slack/test/screenshotDirPopulated";
const logger: boolean = false;
const base = process.env.PWD || ".";

describe("Slack Reporter", () => {
  it("shamone", async () => {
    // const payload = '{"color":"#36a64f","fallback":"Report available at https://circleci.com/api/v1.1/project/undefined/YOU54F/cypressio-docker-typescript/140/artifacts/0scripts/slack/test/jsonTestPass/sampleReport.html","text":"Branch: CIRCLE_BRANCH\nTotal Passed:  18","actions":[{"type":"button","text":"Test Report","url":"https://circleci.com/api/v1.1/project/undefined/YOU54F/cypressio-docker-typescript/140/artifacts/0scripts/slack/test/jsonTestPass/sampleReport.html","style":"primary"},{"type":"button","text":"CircleCI Logs","url":"CIRCLE_BUILD_URL","style":"primary"}]} {"text":"<https://circleci.com/api/v1.1/project/undefined/YOU54F/cypressio-docker-typescript/140/artifacts/0scripts/slack/test/screenshotDirPopulated/pnggrad16rgb.png|Screenshot:- pnggrad16rgb.png>\n","color":"#36a64f"}'
    const mock = SlackMock();
    const firstCall = mock.incomingWebhooks.calls[0];
    expect(firstCall.params.text).toEqual("hello world");
    // mock.outgoingWebhooks.send('http://localhost:9000/outgoing', payload)
    // .then(() => {
    //     expect(mock.outgoingWebhooks.calls).toHaveLength(1)
    //     const firstCall = mock.outgoingWebhooks.calls[0]
    //     expect(firstCall.params.text).toEqual('GO CUBS')
    //   })
  });
  it("throws error when test report directory isnt found", async () => {
    function mockRunner() {
      // tslint:disable-next-line: no-shadowed-variable
      reportDirectory = "non/existent/dir";
      slackRunner(
        ciProvider,
        vcsProvider,
        reportDirectory,
        videoDirectory,
        screenshotDirectory,
        logger,
        base
      );
    }
    expect(mockRunner).toThrow();
    expect(mockRunner).toThrowErrorMatchingInlineSnapshot(
      `"Error: Cannot find test report @ non/existent/dir"`
    );
  });

  it("throws error when test report directory isnt found", async () => {
    const slacker = await slackRunner(
      ciProvider,
      vcsProvider,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger,
      base
    );
    expect(slacker).toMatchObject({ text: "OK" });
  });
});
