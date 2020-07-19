// tslint:disable-next-line: no-reference
/// <reference path='../../../node_modules/@jest/types/build/index.d.ts'/>
import "jest";
import * as SlackMock from "slack-mock-typed";
import * as slacker from "../slack-alert";

const base = process.env.PWD || ".";
const vcsRoot: string = "github";
const ciProvider: string = "circleci";
const reportDir: string = base + "/src/slack/test/jsonTestPass";
const videoDir: string = base + "/src/slack/test/videosDirPopulated";
const screenshotDir: string = base + "/src/slack/test/screenshotDirPopulated";
const mock: SlackMock.Instance = SlackMock.SlackMocker({ logLevel: "debug" });
const mockedHooks = mock.incomingWebhooks;

function setup() {
  beforeAll(async () => {
    jest.setTimeout(60000);
    await mockedHooks.start();
    await mockedHooks.reset();
  });

  beforeEach(async () => {
    jest.resetModules();
    await mockedHooks.reset();
    expect(mockedHooks.calls).toHaveLength(0);
  });
  afterEach(async () => {
    await mockedHooks.reset();
  });
}

describe("tester", () => {
  setup();

  it("can call a mock slack instance vcs root bitbucket", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot: "bitbucket",
      reportDir,
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    expect(body).toContain("bitbucket");
    expect(body).not.toContain("undefined");
  });
});

describe("tester", () => {
  setup();
  it("skips build logs with an unknown ci provider", async () => {
    await slacker.slackRunner({
      ciProvider: "csdscscsc",
      vcsRoot,
      reportDir,
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    const buildNum = process.env.CI_BUILD_NUM;
    expect(body).toContain(`"text":"Build Logs","url":"undefined"`);
  });
});

describe("tester", () => {
  setup();
  it("can set custom report link when a custom url is provided", async () => {
    const artifactUrl = "http://example.com";
    // /report-data.html
    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestFail",
      videoDir,
      screenshotDir,
      customUrl: artifactUrl,
    });
    const body = await returnSlackWebhookCall();
    expect(body).toContain(`"url":"${artifactUrl}`);
  });
});

describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir,
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();
    checkStatus(body, "passed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});

describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github with a failing test report", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestFail",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    checkStatus(body, "failed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});

describe("test custom webhooks per test status", () => {
  setup();
  const errorUrl = "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/error";
  const failedUrl =
    "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/failed";
  const passedUrl =
    "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/passed";
  const errorUrlMultiple =
    "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/error1,https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/error2";
  const failedUrlMultiple =
    "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/failed1,https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/failed2";
  const passedUrlMultiple =
    "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/passed1,https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/passed2";

  it("calls a mock slack instance with specific webhook for failed test runs", async () => {
    process.env.SLACK_WEBHOOK_FAILED_URL = failedUrl;

    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestFail",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall(failedUrl);

    checkStatus(body, "failed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
    process.env.SLACK_WEBHOOK_FAILED_URL = "";
  });

  it("calls a mock slack instance with specific webhook for passed test runs", async () => {
    process.env.SLACK_WEBHOOK_PASSED_URL = passedUrl;

    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestPass",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall(passedUrl);
    checkStatus(body, "passed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
    expect(mockedHooks.calls).toHaveLength(1);
    process.env.SLACK_WEBHOOK_PASSED_URL = "";
  });

  it("calls a mock slack instance with specific webhook for erroring test runs", async () => {
    process.env.SLACK_WEBHOOK_ERROR_URL = errorUrl;

    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonBuildFail",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall(errorUrl);
    checkStatus(body, "build");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
    expect(mockedHooks.calls).toHaveLength(1);
    process.env.SLACK_WEBHOOK_ERROR_URL = "";
  });

  it("calls a mock slack instance multiple times if more than one webhook is provided", async () => {
    process.env.SLACK_WEBHOOK_PASSED_URL = passedUrlMultiple;

    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestPass",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall(passedUrlMultiple, 2);
    checkStatus(body, "passed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
    expect(mockedHooks.calls).toHaveLength(2);
    process.env.SLACK_WEBHOOK_PASSED_URL = "";
  });
});

describe("test onlyFailed flag", () => {
  setup();
  it("calls a mock slack instance with failing test report and onlyFailed flag set", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestFail",
      videoDir,
      screenshotDir,
      onlyFailed: true,
    });
    const body = await returnSlackWebhookCall();

    checkStatus(body, "failed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });

  it("does not call a mock slack instance with passing test report and onlyFailed flag set", async () => {
    const result = await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonTestPass",
      videoDir,
      screenshotDir,
      onlyFailed: true,
    });
    expect(mockedHooks.calls).toHaveLength(0);

    expect(result).toContain(
      "onlyFailed flag set, test run status was passed, so not sending message"
    );
  });
});
describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github with a failing build report", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: base + "/src/slack/test/jsonBuildFail",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    checkStatus(body, "build");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});

describe("Slack Reporter throws error if we cant find the test report", () => {
  it("Slack Reporter logs a warning and send an error slack message if we cant find the test report", async () => {
    process.env.SLACK_WEBHOOK_ERROR_URL =
      "https://hooks.slack.com/services/TEA926DBJ/BEBB8FPCL/error";

    await slacker.slackRunner({
      ciProvider,
      vcsRoot,
      reportDir: "/test",
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall(
      process.env.SLACK_WEBHOOK_ERROR_URL
    );
    checkStatus(body, "build");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
    expect(mockedHooks.calls).toHaveLength(1);
    process.env.SLACK_WEBHOOK_ERROR_URL = "";
  });
});

describe("tester", () => {
  setup();
  it("can provide a simple report with an unknown vcsroot provider", async () => {
    await slacker.slackRunner({
      ciProvider,
      vcsRoot: "none",
      reportDir,
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    expect(body).not.toContain("commits");
    expect(body).not.toContain("artefacts");
  });
});

function returnSlackWebhookCall(webhookUrl?: string, noOfCalls?: number) {
  // This checks the slack mock call counter
  expect(mockedHooks.calls).toHaveLength(noOfCalls ? noOfCalls : 1);
  // Load the response as json

  if (!webhookUrl) {
    webhookUrl = process.env.SLACK_WEBHOOK_URL;
  }
  if (webhookUrl) {
    let i = 0;
    webhookUrl.split(",").forEach((eachWebhookUrl) => {
      const firstCall = mockedHooks.calls[i];
      // check our webhook url called in ENV var SLACK_WEBHOOK_URL
      expect(firstCall.url).toEqual(eachWebhookUrl);
      i++;
    });
  }
  const body = mockedHooks.calls[0].params;

  return body;
}
function messageBuildURL(body: string) {
  // build a URL to check the message renders
  const mbTestUrlBase = "https://api.slack.com/docs/messages/builder?msg=";
  // encode our json message request into a URL encoded string
  const encodedBody = encodeURIComponent(body);
  const mbTestUrl = `${mbTestUrlBase}${encodedBody}`;
  return mbTestUrl;
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
