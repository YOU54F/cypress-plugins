/// &amp;amp;amp;lt;reference path="node_modules/@slack/dist/types/index.d.ts"&amp;amp;amp;gt;
/// &amp;amp;amp;lt;reference path="node_modules/@slack/webhook/dist/IncomingWebhook.d.ts"&amp;amp;amp;gt;
import { MessageAttachment } from "@slack/types";
import {
  IncomingWebhook,
  IncomingWebhookDefaultArguments,
  IncomingWebhookSendArguments
} from "@slack/webhook";
import * as program from "commander";
import * as fs from "fs";
import * as path from "path";

let {
  CI_SHA1,
  CI_BRANCH,
  CI_USERNAME,
  CI_BUILD_URL,
  CI_BUILD_NUM,
  CI_PULL_REQUEST,
  CI_PROJECT_REPONAME,
  CI_PROJECT_USERNAME,
  CI_URL
} = process.env;

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;

export function runner(ciProvider: string, vcsRoot: string) {
  if (ciProvider === "circleci" || ciProvider === undefined) {
    const {
      CIRCLE_SHA1,
      CIRCLE_BRANCH,
      CIRCLE_USERNAME,
      CIRCLE_BUILD_URL,
      CIRCLE_BUILD_NUM,
      CIRCLE_PULL_REQUEST,
      CIRCLE_PROJECT_REPONAME,
      CIRCLE_PROJECT_USERNAME
    } = process.env;

    (CI_SHA1 = CIRCLE_SHA1),
      (CI_BRANCH = CIRCLE_BRANCH),
      (CI_USERNAME = CIRCLE_USERNAME),
      (CI_BUILD_URL = CIRCLE_BUILD_URL),
      (CI_BUILD_NUM = CIRCLE_BUILD_NUM),
      (CI_PULL_REQUEST = CIRCLE_PULL_REQUEST),
      (CI_PROJECT_REPONAME = CIRCLE_PROJECT_REPONAME),
      (CI_PROJECT_USERNAME = CIRCLE_PROJECT_USERNAME);
    CI_URL = "https://circleci.com/api/v1.1/project";
  }
  if (vcsRoot || vcsRoot === undefined) {
    if (vcsRoot === undefined){
      vcsRoot = 'github'
    }
    VCS_ROOT = vcsRoot;
  }
}

let VCS_ROOT: string;
const reportDir = path.join(__dirname, "..", "..", "mochareports");
let COMMIT_URL: string | undefined;
let VCS_BASEURL: string;
let prLink: string = "";
let videoAttachmentsSlack: string = "";
let screenshotAttachmentsSlack: string = "";
let reportHTMLFilename: string | undefined;
let reportHTMLUrl: string;
let artefactUrl: string;
let attachments: MessageAttachment;
let totalSuites: number;
let totalTests: number;
let totalPasses: number;
let totalFailures: number;
let totalDuration: number;
let status: string;
const artefactPath = "root/app/e2e";

runner("circleci", "github");
sendMessage();

export function sendMessage() {
  const sendArgs: IncomingWebhookSendArguments = {};
  COMMIT_URL = getCommitUrl(VCS_ROOT);
  buildHTMLReportURL();
  getVideoLinks(artefactUrl); //
  getScreenshotLinks(artefactUrl);
  prChecker(CI_PULL_REQUEST as string);
  const reportStatistics = getTestReportStatus(reportDir); // process the test report
  status = reportStatistics.status;
  switch (status) {
    case "error": {
      const webhookInitialArguments = webhookInitialArgs({}, status);
      const webhook = new IncomingWebhook(
        SLACK_WEBHOOK_URL,
        webhookInitialArguments
      );
      const reports = attachmentReports(attachments, status);
      const sendArguments = webhookSendArgs(sendArgs, [reports]);
      return webhook.send(sendArguments);
    }
    case "failed": {
      const webhookInitialArguments = webhookInitialArgs({}, status);
      const webhook = new IncomingWebhook(
        SLACK_WEBHOOK_URL,
        webhookInitialArguments
      );
      const reports = attachmentReports(attachments, status);
      const artefacts = attachementsVideoAndScreenshots(attachments, status);
      const sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
      return webhook.send(sendArguments);
    }
    case "passed": {
      const webhookInitialArguments = webhookInitialArgs({}, status);
      const webhook = new IncomingWebhook(
        SLACK_WEBHOOK_URL,
        webhookInitialArguments
      );
      const reports = attachmentReports(attachments, status);
      const artefacts = attachementsVideoAndScreenshots(attachments, status);
      const sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
      return webhook.send(sendArguments);
    }
    default: {
      throw new Error("An error occured getting the status of the test run");
    }
  }
}

export function webhookInitialArgs(
  initialArgs: IncomingWebhookDefaultArguments,
// tslint:disable-next-line: no-shadowed-variable
  status: string
) {
  switch (status) {
    case "passed": {
      initialArgs = {
        text: `${CI_PROJECT_REPONAME} test run passed.\nThis run was triggered by <${COMMIT_URL}|${CI_USERNAME}>${prLink}`
      };
      break;
    }
    case "failed": {
      initialArgs = {
        text: `${CI_PROJECT_REPONAME} test run failed.\nThis run was triggered by <${COMMIT_URL}|${CI_USERNAME}>${prLink}`
      };
      break;
    }
    case "error": {
      initialArgs = {
        text: `${CI_PROJECT_REPONAME} test build failed.\nThis run was triggered by <${COMMIT_URL}|${CI_USERNAME}>${prLink}`
      };
      break;
    }
    default: {
      break;
    }
  }
  return initialArgs;
}

export function webhookSendArgs(
  argsWebhookSend: IncomingWebhookSendArguments,
  messageAttachments: MessageAttachment[]
) {
  argsWebhookSend = {
    attachments: messageAttachments,
    unfurl_links: false,
    unfurl_media: false
  };
  return argsWebhookSend;
}

export function attachmentReports(
  attachmentsReports: MessageAttachment,
// tslint:disable-next-line: no-shadowed-variable
  status: string
) {
  switch (status) {
    case "passed": {
      return (attachments = {
        color: "#36a64f",
        fallback: `Report available at ${reportHTMLUrl}`,
        text: `Branch: ${CI_BRANCH}\nTotal Passed:  ${totalPasses}`,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary"
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "primary"
          }
        ]
      });
    }
    case "failed": {
      return (attachments = {
        color: "#ff0000",
        fallback: `Report available at ${reportHTMLUrl}`,
        title: `Total Failed: ${totalFailures}`,
        text: `Branch: ${CI_BRANCH}\nTotal Tests: ${totalTests}\nTotal Passed:  ${totalPasses} `,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary"
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "primary"
          }
        ]
      });
    }
    case "error": {
      return (attachments = {
        color: "#ff0000",
        fallback: `Build Log available at ${CI_BUILD_URL}`,
        text: `Branch: ${CI_BRANCH}\nTotal Passed:  ${totalPasses} `,
        actions: [
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "danger"
          }
        ]
      });
    }
    default: {
      break;
    }
  }
  return attachmentsReports;
}

export function attachementsVideoAndScreenshots(
  attachmentsVideosScreenshots: MessageAttachment,
// tslint:disable-next-line: no-shadowed-variable
  status: string
) {
  switch (status) {
    case "passed": {
      return (attachments = {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#36a64f"
      });
    }
    case "failed": {
      return (attachments = {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#ff0000"
      });
    }
    default: {
      break;
    }
  }
  return attachmentsVideosScreenshots;
}

export function getFiles(dir: string, ext: string, fileList: string[]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const files = fs.readdirSync(dir);
  files.forEach((file: string) => {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, ext, fileList);
    } else if (path.extname(file) === ext) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// tslint:disable-next-line: no-shadowed-variable
export function getHTMLReportFilename(reportDir: string) {
  const reportHTMLFullPath = getFiles(reportDir, ".html", []);
  if (reportHTMLFullPath.length === 0) {
    throw new Error("Cannot find test report");
  } else if (reportHTMLFullPath.length >= 2) {
    throw new Error(
      "Multiple reports found, please provide only a single report"
    );
  } else {
    reportHTMLFilename = reportHTMLFullPath
      .toString()
      .split("/")
      .pop();
    return reportHTMLFilename;
  }
}

// tslint:disable-next-line: no-shadowed-variable
export function getTestReportStatus(reportDir: string) {
  const reportFile = getFiles(reportDir, ".json", []);
  if (reportFile.length === 0) {
    throw new Error("Cannot find test report");
  } else if (reportFile.length >= 2) {
    throw new Error(
      "Multiple json reports found, please run mochawesome-merge to provide a single report"
    );
  } else {
    const rawdata = fs.readFileSync(reportFile[0]);
    const parsedData = JSON.parse(rawdata.toString());
    const reportStats = parsedData.stats;
    totalSuites = reportStats.suites;
    totalTests = reportStats.tests;
    totalPasses = reportStats.passes;
    totalFailures = reportStats.failures;
    totalDuration = reportStats.duration;
    if (totalTests === undefined || totalTests === 0) {
      status = "error";
    } else if (totalFailures > 0 || totalPasses === 0) {
      status = "failed";
    } else if (totalFailures === 0) {
      status = "passed";
    }
    return {
      totalSuites,
      totalTests,
      totalPasses,
      totalFailures,
      totalDuration,
      reportFile,
      status
    };
  }
}

// tslint:disable-next-line: no-shadowed-variable
export function prChecker(CI_PULL_REQUEST: string) {
  if (CI_PULL_REQUEST && CI_PULL_REQUEST.indexOf("pull") > -1) {
    return (prLink = `<${CI_PULL_REQUEST}| - PR >`);
  }
}

// tslint:disable-next-line: no-shadowed-variable
export function getVideoLinks(artefactUrl: string) {
  if (!artefactUrl) {
    throw new Error("artefactUrl env var does not exist");
  } else {
    const videosURL = `${artefactUrl}`;
    const videosDir = path.join(__dirname, "../..", "cypress", "videos");
    const videos = getFiles(videosDir, ".mp4", []);
    if (videos.length === 0) {
      return;
    } else {
      videos.forEach(videoObject => {
        const trimmedVideoFilename = path.basename(videoObject);
        videoAttachmentsSlack = `<${videosURL}${videoObject}|Video:- ${trimmedVideoFilename}>\n${videoAttachmentsSlack}`;
      });
    }
  }
  return videoAttachmentsSlack;
}

// tslint:disable-next-line: no-shadowed-variable
export function getScreenshotLinks(artefactUrl: string) {
  if (!artefactUrl) {
    throw new Error("artefactUrl env var does not exist");
  } else {
    const screenshotURL = `${artefactUrl}`;
    const screenshotDir = path.join(
      __dirname,
      "../..",
      "cypress",
      "screenshots"
    );
    const screenshots = getFiles(screenshotDir, ".png", []);
    if (screenshots.length === 0) {
      return;
    } else {
      screenshots.forEach(screenshotObject => {
        const trimmedScreenshotFilename = path.basename(screenshotObject);
        screenshotAttachmentsSlack = `<${screenshotURL}${screenshotObject}|Screenshot:- ${trimmedScreenshotFilename}>\n${screenshotAttachmentsSlack}`;
      });
    }
  }
  return screenshotAttachmentsSlack;
}

// tslint:disable-next-line: no-shadowed-variable
export function buildHTMLReportURL() {
  const reportPath = "mochareports";
  artefactUrl = `${CI_URL}/${VCS_ROOT}/${CI_PROJECT_USERNAME}/${CI_PROJECT_REPONAME}/${CI_BUILD_NUM}/artifacts/0`;
  reportHTMLFilename = getHTMLReportFilename(reportDir);
  reportHTMLUrl =
    artefactUrl + "/" +  artefactPath + "/" + reportPath + "/" + reportHTMLFilename;
  return reportHTMLUrl + artefactUrl;
}

// tslint:disable-next-line: no-shadowed-variable
function getCommitUrl(VCS_ROOT: string) {
  if (VCS_ROOT === "github") {
    VCS_BASEURL = "https://github.com";
    return (COMMIT_URL = `${VCS_BASEURL}/${CI_PROJECT_USERNAME}/${CI_PROJECT_REPONAME}/commit/${CI_SHA1}`);
  } else if (VCS_ROOT === "bitbucket") {
    VCS_BASEURL = "https://bitbucket.org";
    return (COMMIT_URL = `${VCS_BASEURL}/${CI_PROJECT_USERNAME}/${CI_PROJECT_REPONAME}/commits/${CI_SHA1}`);
  }
}
