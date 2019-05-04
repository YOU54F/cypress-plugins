import "jest";
import * as SlackMock from "slack-mocker";
import slackRunner from "./slack-alert";
const SLACK_WEBHOOK_URL: string = process.env.SLACK_WEBHOOK_URL || "";
const base = process.env.PWD || ".";
const vcsRoot: string = "github";
const ciProvider: string = "circleci";
const reportDirectory: string = base + "/src/slack/test/jsonTestPass";
const videoDirectory: string = base + "/src/slack/test/cd DirPopulated";
const screenshotDirectory: string =
  base + "/src/slack/test/screenshotDirPopulated";
const logger: boolean = false;
let mock: SlackMock.Instance;

describe("Slack Reporter", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
    mock = SlackMock({ disableRtm: true });
  });

  beforeEach(async () => {
    mock.incomingWebhooks.reset();
  });

  function returnSlackWebhookCall() {
    // This checks the slack mock call counter
    expect(mock.incomingWebhooks.calls).toHaveLength(1);
    // Load the response (parsed with qs from content-type application/x-www-form-urlencoded)
    const firstCall = mock.incomingWebhooks.calls[0];
    // check our webhook url called in ENV var SLACK_WEBHOOK_URL
    expect(firstCall.url).toEqual(SLACK_WEBHOOK_URL);
    const body = firstCall.params;
    // console.log(body);
    return body;
  }

  function checkStatus(body: string, status: string) {
    expect(body).not.toContain("undefined");
    switch (status) {
      case "passed": {
        expect(body).toContain("test run passed");
        break;
      }
      case "failed": {
        expect(body).toContain("test run failed");
        break;
      }
      case "build": {
        expect(body).toContain("build failed");
        break;
      }
      default: {
        expect(body).toContain("test run passed");
      }
    }
  }

  it("can call a mock slack instance vcs root github", async () => {
    await slackRunner(
      ciProvider,
      vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger,
      base
    );
    const body = returnSlackWebhookCall();
    checkStatus(body, "passed");
    expect(body).toContain("github");
  });
  it("can call a mock slack instance vcs root bitbucket", async () => {
    // tslint:disable-next-line: variable-name
    const _vcsRoot = "bitbucket";
    await slackRunner(
      ciProvider,
      _vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger,
      base
    );
    const body = returnSlackWebhookCall();
    checkStatus(body, "passed");
    expect(body).toContain("bitbucket");
  });
  it("can call a mock slack instance with no vcsroot foo", async () => {
    // https://circleci.com/api/v1.1/project/foo/YOU54F/cypressio-docker-typescript/140/artifacts/0/Users/you54f/dev/saftest/githubrepos/source_repos/cypress-slack-reporter/src/slack/test/screenshotDirPopulated/pnggrad16rgb.png
    // tslint:disable-next-line: variable-name
    const _vcsRoot = "foo";
    await slackRunner(
      ciProvider,
      _vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger,
      base
    );
    const body = returnSlackWebhookCall();
    // tslint:disable-next-line: no-console
    console.log(body);

    checkStatus(body, "passed");
    expect(body).toContain("bitbucket");
  });
});
