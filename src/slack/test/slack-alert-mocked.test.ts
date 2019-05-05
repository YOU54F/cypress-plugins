import "jest";
import * as SlackMock from "slack-mocker";
import * as slacker from "../slack-alert";

const base = process.env.PWD || ".";
const vcsRoot: string = "github";
const ciProvider: string = "circleci";
const reportDirectory: string = base + "/src/slack/test/jsonTestPass";
const videoDirectory: string = base + "/src/slack/test/videoDirPopulated";
const screenshotDirectory: string =
  base + "/src/slack/test/screenshotDirPopulated";
const logger: boolean = false;
let mock: SlackMock.Instance;

function setup() {
  beforeAll(async () => {
    jest.setTimeout(60000);
    mock = await SlackMock({ disableRtm: true });
    await mock.incomingWebhooks.reset();
  });

  beforeEach(async () => {
    jest.resetModules();
    await mock.incomingWebhooks.reset();
    expect(mock.incomingWebhooks.calls).toHaveLength(0);
  });
  afterEach(async () => {
    await mock.incomingWebhooks.reset();
  });
}

describe("tester", () => {
  setup();
  it("can provide a simple report with an unknown vcsroot provider", async () => {
    const _vcsRoot = "none";
    await slacker.slackRunner(
      ciProvider,
      _vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    expect(body).not.toContain("commits");
    expect(body).not.toContain("artefacts");
  });
});

describe("tester", () => {
  setup();

  it("can call a mock slack instance vcs root bitbucket", async () => {
    const _vcsRoot = "bitbucket";

    await slacker.slackRunner(
      ciProvider,
      _vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    expect(body).toContain("bitbucket");
    expect(body).not.toContain("undefined");
  });
});

describe("tester", () => {
  setup();
  it("can provide a simple report with an unknown ci provider", async () => {
    const _ciProvider = "csdscscsc";
    await slacker.slackRunner(
      _ciProvider,
      vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    expect(body).toContain(
      '"text":"CircleCI Logs","url":"https://circleci.com/gh/YOU54F/cypress-slack-reporter/126"'
    );
  });
});

describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github", async () => {
    await slacker.slackRunner(
      ciProvider,
      vcsRoot,
      reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    checkStatus(body, "passed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});

describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github with a failing test report", async () => {
    const _reportDirectory: string = base + "/src/slack/test/jsonTestFail";
    await slacker.slackRunner(
      ciProvider,
      vcsRoot,
      _reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    checkStatus(body, "failed");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});
describe("tester", () => {
  setup();
  it("can call a mock slack instance vcs root github with a failing build report", async () => {
    const _reportDirectory: string = base + "/src/slack/test/jsonBuildFail";
    await slacker.slackRunner(
      ciProvider,
      vcsRoot,
      _reportDirectory,
      videoDirectory,
      screenshotDirectory,
      logger
    );
    const body = await returnSlackWebhookCall();
    const messageBuiltUrl = await messageBuildURL(body);
    checkStatus(body, "build");
    expect(body).toContain("github");
    expect(body).not.toContain("undefined");
  });
});

describe("Slack Reporter throws error if we cant find the test report", () => {
  const _reportDirectory: string = "";
  it("throws error when slack isnt available", async () => {
    function mockRunner() {
      slacker.slackRunner(
        ciProvider,
        vcsRoot,
        _reportDirectory,
        videoDirectory,
        screenshotDirectory,
        logger
      );
    }
    expect(mockRunner).toThrowError("Error: Cannot find test report @ ");
  });
});

function returnSlackWebhookCall() {
  // This checks the slack mock call counter
  expect(mock.incomingWebhooks.calls).toHaveLength(1);
  // Load the response as json
  const firstCall = mock.incomingWebhooks.calls[0];
  // check our webhook url called in ENV var SLACK_WEBHOOK_URL
  expect(firstCall.url).toEqual(process.env.SLACK_WEBHOOK_URL);
  const body = firstCall.params;
  // tslint:disable-next-line: no-console
  console.log(body);
  return body;
}
function messageBuildURL(body: string) {
  // build a URL to check the message renders
  const mbTestUrlBase = "https://api.slack.com/docs/messages/builder?msg=";
  // encode our json message request into a URL encoded string
  const encodedBody = encodeURIComponent(body);
  const mbTestUrl = `${mbTestUrlBase}${encodedBody}`;
  // tslint:disable-next-line: no-console
  console.log(mbTestUrl);
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
