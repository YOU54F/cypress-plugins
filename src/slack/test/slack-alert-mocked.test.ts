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
  it("can provide a simple report with an unknown ci provider", async () => {
    await slacker.slackRunner({
      ciProvider: "csdscscsc",
      vcsRoot,
      reportDir,
      videoDir,
      screenshotDir,
    });
    const body = await returnSlackWebhookCall();

    const buildNum = process.env.CIRCLE_BUILD_NUM;
    expect(body).toContain(
      `"text":"CircleCI Logs","url":"https://circleci.com/gh/YOU54F/cypress-slack-reporter/${buildNum}"`
    );
  });
});

describe("tester", () => {
  setup();
  it("can set custom report link when ci-provider set to custom", async () => {
    const artifactUrl = "http://example.com/report-data.html";

    await slacker.slackRunner({
      ciProvider: "custom",
      vcsRoot,
      reportDir,
      videoDir,
      screenshotDir,
      customUrl: artifactUrl,
    });
    const body = await returnSlackWebhookCall();
    expect(body).toContain(`"url":"${artifactUrl}"`);
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
  it("throws error when slack isnt available", async () => {
    function mockRunner() {
      slacker.slackRunner({
        ciProvider,
        vcsRoot,
        reportDir: "",
        videoDir,
        screenshotDir,
      });
    }
    expect(mockRunner).toThrowError("Error: Cannot find test report @ ");
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

function returnSlackWebhookCall() {
  // This checks the slack mock call counter
  expect(mockedHooks.calls).toHaveLength(1);
  // Load the response as json
  const firstCall = mockedHooks.calls[0];
  // check our webhook url called in ENV var SLACK_WEBHOOK_URL
  expect(firstCall.url).toEqual(process.env.SLACK_WEBHOOK_URL);
  const body = firstCall.params;
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
