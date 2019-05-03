import "jest";
import * as SlackMock from "slack-mocker";
import slackRunner from "./slack-alert";

const SLACK_WEBHOOK_URL: string = process.env.SLACK_WEBHOOK_URL || "";
const vcsRoot: string = "github";
const ciProvider: string = "circleci";
const reportDirectory: string = "scripts/slack/test/jsonTestPass";
const videoDirectory: string = "scripts/slack/test/screenshotDirPopulated";
const screenshotDirectory: string = "scripts/slack/test/screenshotDirPopulated";
const logger: boolean = false;
const base = process.env.PWD || ".";

let mock: SlackMock.Instance;

describe("Slack Reporter", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
    mock = SlackMock({ disableRtm: true });
    mock.incomingWebhooks.reset();
  });

  it("can call a mock slack instance", async () => {
    const slacker = await slackRunner(
      ciProvider,
      vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger,
      base
    );
    // This checks our program successfully called slack
    expect(slacker).toMatchObject({ text: "OK" });
    // This checks the slack mock call counter
    expect(mock.incomingWebhooks.calls).toHaveLength(1);
    // Load the response (parsed with qs from content-type application/x-www-form-urlencoded)
    const firstCall = mock.incomingWebhooks.calls[0];
    // check our webhook url called in ENV var SLACK_WEBHOOK_URL
    expect(firstCall.url).toEqual(SLACK_WEBHOOK_URL);
    const body = firstCall.params;
    expect(body).toContain("test run passed");
    expect(body).not.toContain("undefined");
  });
  it("throws error when test report directory isnt found", async () => {
    function mockRunner() {
      // tslint:disable-next-line: variable-name
      const _reportDirectory = "non/existent/dir";
      slackRunner(
        ciProvider,
        vcsRoot,
        _reportDirectory,
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
});
