/// &amp;amp;amp;lt;reference path="node_modules/@slack/dist/types/index.d.ts"&amp;amp;amp;gt;
/// &amp;amp;amp;lt;reference path="node_modules/@slack/webhook/dist/IncomingWebhook.d.ts"&amp;amp;amp;gt;
import { MessageAttachment } from "@slack/types";
import {
  IncomingWebhook,
  IncomingWebhookDefaultArguments,
  IncomingWebhookSendArguments,
} from "@slack/webhook";
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
  CI_URL,
  CI_CIRCLE_JOB,
} = process.env;
const { CIRCLE_PROJECT_ID } = process.env;
const ENV_SUT = process.env.ENV_SUT;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;
let commitUrl: string = "";
let VCS_BASEURL: string;
let prLink: string = "";
let videoAttachmentsSlack: string;
let screenshotAttachmentsSlack: string;
let reportHTMLFilename: string = "";
let reportHTMLUrl: string;
let artefactUrl: string = "";
let attachments: MessageAttachment;
let totalSuites: number;
let totalTests: number;
let totalPasses: number;
let totalFailures: number;
let totalDuration: number;
let status: string;
const sendArgs: IncomingWebhookSendArguments = {};

export interface SlackRunnerOptions {
  ciProvider: string;
  vcsRoot: string;
  reportDir: string;
  videoDir: string;
  screenshotDir: string;
  customUrl?: string;
  onlyFailed?: boolean;
}
export function slackRunner({
  ciProvider,
  vcsRoot,
  reportDir,
  videoDir,
  screenshotDir,
  customUrl,
  onlyFailed,
}: SlackRunnerOptions) {
  resolveCIProvider(ciProvider);

  try {
    const messageResult = sendMessage({
      vcsRoot,
      reportDir,
      videoDir,
      screenshotDir,
      customUrl,
      ciProvider,
      onlyFailed,
    });
    return messageResult;
  } catch (e) {
    throw new Error(e);
  }
}

export function sendMessage({
  ciProvider: _ciProvider,
  vcsRoot: _vcsRoot,
  reportDir: _reportDir,
  videoDir: _videoDir,
  screenshotDir: _screenshotDir,
  customUrl = "",
  onlyFailed = false,
}: SlackRunnerOptions) {
  commitUrl = getCommitUrl(_vcsRoot) as string;
  artefactUrl = getArtefactUrl(_vcsRoot, _ciProvider, customUrl);
  reportHTMLUrl = buildHTMLReportURL(_reportDir, artefactUrl, _ciProvider);
  videoAttachmentsSlack = getVideoLinks(artefactUrl, _videoDir); //
  screenshotAttachmentsSlack = getScreenshotLinks(artefactUrl, _screenshotDir);
  prChecker(CI_PULL_REQUEST as string);
  const reportStatistics = getTestReportStatus(_reportDir); // process the test report
  if (onlyFailed && reportStatistics.status !== "failed") {
    return `onlyFailed flag set, test run status was ${reportStatistics.status}, so not sending message`;
  } else {
    return constructMessage(reportStatistics.status);
  }
}

export function constructMessage(_status: string) {
  const webhookInitialArguments = webhookInitialArgs({}, _status);
  const reports = attachmentReports(attachments, _status);
  switch (_status) {
    case "error": {
      const slackWebhookErrorUrl = process.env.SLACK_WEBHOOK_ERROR_URL;
      const slackWebhookUrls = slackWebhookErrorUrl
        ? slackWebhookErrorUrl.split(",")
        : SLACK_WEBHOOK_URL.split(",");
      slackWebhookUrls.forEach((slackWebhookUrl) => {
        const webhook = new IncomingWebhook(
          slackWebhookUrl,
          webhookInitialArguments
        );
        const sendArguments = webhookSendArgs(sendArgs, [reports]);
        return webhook.send(sendArguments);
      });
      break;
    }
    case "failed": {
      const slackWebhookFailedUrl = process.env.SLACK_WEBHOOK_FAILED_URL;
      const slackWebhookUrls = slackWebhookFailedUrl
        ? slackWebhookFailedUrl.split(",")
        : SLACK_WEBHOOK_URL.split(",");
      slackWebhookUrls.forEach((slackWebhookUrl) => {
        const webhook = new IncomingWebhook(
          slackWebhookUrl,
          webhookInitialArguments
        );
        const artefacts = attachmentsVideoAndScreenshots(attachments, _status);
        const sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
        return webhook.send(sendArguments);
      });
      break;
    }
    case "passed": {
      const slackWebhookPassedUrl = process.env.SLACK_WEBHOOK_PASSED_URL;
      const slackWebhookUrls = slackWebhookPassedUrl
        ? slackWebhookPassedUrl.split(",")
        : SLACK_WEBHOOK_URL.split(",");
      slackWebhookUrls.forEach((slackWebhookUrl) => {
        const webhook = new IncomingWebhook(
          slackWebhookUrl,
          webhookInitialArguments
        );
        const artefacts = attachmentsVideoAndScreenshots(attachments, _status);
        const sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
        return webhook.send(sendArguments);
      });
      break;
    }
    default: {
      throw new Error("An error occured getting the status of the test run");
    }
  }
}

export function webhookInitialArgs(
  initialArgs: IncomingWebhookDefaultArguments,
  _status: string
) {
  let statusText: string;
  switch (_status) {
    case "passed": {
      statusText = "test run passed";
      break;
    }
    case "failed": {
      statusText = "test run failed";
      break;
    }
    case "error": {
      statusText = "test build failed";
      break;
    }
    default: {
      statusText = "test status unknown";
      break;
    }
  }
  let triggerText: string;
  if (!commitUrl) {
    triggerText = "";
  } else {
    if (!CI_USERNAME) {
      triggerText = `This run was triggered by <${commitUrl}|commit>`;
    } else {
      triggerText = `This run was triggered by <${commitUrl}|${CI_USERNAME}>`;
    }
  }
  let prText: string;
  if (!prLink) {
    prText = "";
  } else {
    prText = `${prLink}`;
  }
  let projectName: string;
  if (!CI_PROJECT_REPONAME) {
    projectName = "Cypress";
  } else {
    projectName = `${CI_PROJECT_REPONAME}`;
  }
  return (initialArgs = {
    text: `${projectName} ${statusText}\n${triggerText}${prText}`,
  });
}

export function webhookSendArgs(
  argsWebhookSend: IncomingWebhookSendArguments,
  messageAttachments: MessageAttachment[]
) {
  argsWebhookSend = {
    attachments: messageAttachments,
    unfurl_links: false,
    unfurl_media: false,
  };
  return argsWebhookSend;
}

export function attachmentReports(
  attachmentsReports: MessageAttachment,
  _status: string
) {
  let branchText: string;
  if (!CI_BRANCH) {
    branchText = "";
  } else {
    branchText = `Branch: ${CI_BRANCH}\n`;
  }
  let jobText;
  if (!CI_CIRCLE_JOB) {
    jobText = "";
  } else {
    jobText = `Job: ${CI_CIRCLE_JOB}\n`;
  }
  let envSut;
  if (!ENV_SUT) {
    envSut = "";
  } else {
    envSut = `SUT: ${ENV_SUT}\n`;
  }
  switch (_status) {
    case "passed": {
      return (attachments = {
        color: "#36a64f",
        fallback: `Report available at ${reportHTMLUrl}`,
        text: `${branchText}${jobText}${envSut}Total Passed:  ${totalPasses}`,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary",
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "primary",
          },
        ],
      });
    }
    case "failed": {
      return (attachments = {
        color: "#ff0000",
        fallback: `Report available at ${reportHTMLUrl}`,
        title: `Total Failed: ${totalFailures}`,
        text: `${branchText}${jobText}${envSut}Total Tests: ${totalTests}\nTotal Passed:  ${totalPasses} `,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary",
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "primary",
          },
        ],
      });
    }
    case "error": {
      return (attachments = {
        color: "#ff0000",
        fallback: `Build Log available at ${CI_BUILD_URL}`,
        text: `${branchText}${jobText}${envSut}Total Passed:  ${totalPasses} `,
        actions: [
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CI_BUILD_URL}`,
            style: "danger",
          },
        ],
      });
    }
    default: {
      break;
    }
  }
  return attachmentsReports;
}

export function attachmentsVideoAndScreenshots(
  attachmentsVideosScreenshots: MessageAttachment,
  _status: string
) {
  switch (_status) {
    case "passed": {
      return (attachments = {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#36a64f",
      });
    }
    case "failed": {
      return (attachments = {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#ff0000",
      });
    }
    default: {
      break;
    }
  }
  return attachmentsVideosScreenshots;
}

export function getFiles(dir: string, ext: string, fileList: string[]) {
  if (!fs.existsSync(dir) && path.basename(dir) === "mochareports") {
    return fileList;
  } else if (!fs.existsSync(dir)) {
    return fileList;
  } else {
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
}

export function getHTMLReportFilename(reportDir: string) {
  const reportHTMLFullPath = getFiles(reportDir, ".html", []);
  if (reportHTMLFullPath.length === 0) {
    throw new Error(`Cannot find test report @ ${reportDir}`);
  } else if (reportHTMLFullPath.length >= 2) {
    throw new Error(
      "Multiple reports found, please provide only a single report"
    );
  } else {
    reportHTMLFilename = reportHTMLFullPath
      .toString()
      .split("/")
      .pop() as string;
    return reportHTMLFilename;
  }
}

export function getTestReportStatus(reportDir: string) {
  const reportFile = getFiles(reportDir, ".json", []);
  if (reportFile.length === 0) {
    throw new Error(`Cannot find json test report @ ${reportDir}`);
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
      status,
    };
  }
}

export function prChecker(_CI_PULL_REQUEST: string) {
  if (_CI_PULL_REQUEST && _CI_PULL_REQUEST.indexOf("pull") > -1) {
    return (prLink = `<${_CI_PULL_REQUEST}| - PR >`);
  }
}

export function getVideoLinks(_artefactUrl: string, _videosDir: string) {
  videoAttachmentsSlack = "";
  if (!_artefactUrl) {
    return (videoAttachmentsSlack = "");
  } else {
    const videosURL = `${_artefactUrl}`;
    const videos = getFiles(_videosDir, ".mp4", []);
    if (videos.length === 0) {
      return (videoAttachmentsSlack = "");
    } else {
      videos.forEach((videoObject) => {
        const trimmedVideoFilename = path.basename(videoObject);
        videoAttachmentsSlack = `<${videosURL}${videoObject}|Video:- ${trimmedVideoFilename}>\n${videoAttachmentsSlack}`;
      });
    }
  }
  return videoAttachmentsSlack;
}

export function getScreenshotLinks(
  _artefactUrl: string,
  _screenshotDir: string
) {
  screenshotAttachmentsSlack = "";
  if (!_artefactUrl) {
    return (screenshotAttachmentsSlack = "");
  } else {
    const screenshotURL = `${_artefactUrl}`;
    const screenshots = getFiles(_screenshotDir, ".png", []);
    if (screenshots.length === 0) {
      return (screenshotAttachmentsSlack = "");
    } else {
      screenshots.forEach((screenshotObject) => {
        const trimmedScreenshotFilename = path.basename(screenshotObject);
        return (screenshotAttachmentsSlack = `<${screenshotURL}${screenshotObject}|Screenshot:- ${trimmedScreenshotFilename}>\n${screenshotAttachmentsSlack}`);
      });
    }
  }
  return screenshotAttachmentsSlack;
}

export function buildHTMLReportURL(
  _reportDir: string,
  _artefactUrl: string,
  _ciProvider: string
) {
  reportHTMLFilename = getHTMLReportFilename(_reportDir);
  reportHTMLUrl = _artefactUrl + _reportDir + "/" + reportHTMLFilename;
  return reportHTMLUrl;
}

export function getArtefactUrl(
  _vcsRoot: string,
  ciProvider: string,
  customUrl: string
) {
  if (customUrl) {
    return (artefactUrl = customUrl);
  } else if (ciProvider === "circleci") {
    switch (_vcsRoot) {
      case "github":
        artefactUrl = `https://${CI_BUILD_NUM}-${CIRCLE_PROJECT_ID}-gh.circle-artifacts.com/0/`;
        break;
      case "bitbucket":
        artefactUrl = `https://${CI_BUILD_NUM}-${CIRCLE_PROJECT_ID}-bb.circle-artifacts.com/0/`;
        break;
      default: {
        artefactUrl = "";
      }
    }
    return artefactUrl;
  }

  return "";
}

export function getCommitUrl(_vcsRoot: string) {
  if (_vcsRoot === "github") {
    VCS_BASEURL = "https://github.com";
    return (commitUrl = `${VCS_BASEURL}/${CI_PROJECT_USERNAME}/${CI_PROJECT_REPONAME}/commit/${CI_SHA1}`);
  } else if (_vcsRoot === "bitbucket") {
    VCS_BASEURL = "https://bitbucket.org";
    return (commitUrl = `${VCS_BASEURL}/${CI_PROJECT_USERNAME}/${CI_PROJECT_REPONAME}/commits/${CI_SHA1}`);
  } else {
    return (commitUrl = "");
  }
}

export function resolveCIProvider(ciProvider?: string) {
  if (!ciProvider && process.env.CIRCLE_SHA1) {
    ciProvider = "circleci";
  }
  if (!ciProvider && process.env.JENKINS_HOME) {
    ciProvider = "jenkins";
  }
  switch (ciProvider) {
    case "circleci":
      {
        const {
          CIRCLE_SHA1,
          CIRCLE_BRANCH,
          CIRCLE_USERNAME,
          CIRCLE_BUILD_URL,
          CIRCLE_BUILD_NUM,
          CIRCLE_PULL_REQUEST,
          CIRCLE_PROJECT_REPONAME,
          CIRCLE_PROJECT_USERNAME,
          CIRCLE_JOB,
        } = process.env;

        (CI_SHA1 = CIRCLE_SHA1),
          (CI_BRANCH = CIRCLE_BRANCH),
          (CI_USERNAME = CIRCLE_USERNAME),
          (CI_BUILD_URL = CIRCLE_BUILD_URL),
          (CI_BUILD_NUM = CIRCLE_BUILD_NUM),
          (CI_PULL_REQUEST = CIRCLE_PULL_REQUEST),
          (CI_PROJECT_REPONAME = CIRCLE_PROJECT_REPONAME),
          (CI_PROJECT_USERNAME = CIRCLE_PROJECT_USERNAME),
          (CI_CIRCLE_JOB = CIRCLE_JOB);
        CI_URL = "https://circleci.com/api/v1.1/project";
      }
      break;
    case "jenkins":
      {
        const {
          GIT_COMMIT,
          BRANCH_NAME,
          CHANGE_AUTHOR,
          BUILD_URL,
          BUILD_ID,
          CHANGE_ID,
          JOB_NAME,
        } = process.env;
        if (typeof process.env.GIT_URL === "undefined") {
          throw new Error("GIT_URL not defined!");
        }
        const urlParts = process.env.GIT_URL.replace(
          "https://github.com/",
          ""
        ).replace(".git", "");
        const arr = urlParts.split("/");
        const PROJECT_REPONAME = arr[1];
        const PROJECT_USERNAME = arr[0];
        (CI_SHA1 = GIT_COMMIT),
          (CI_BRANCH = BRANCH_NAME),
          (CI_USERNAME = CHANGE_AUTHOR),
          (CI_BUILD_URL = BUILD_URL),
          (CI_BUILD_NUM = BUILD_ID),
          (CI_PULL_REQUEST = CHANGE_ID),
          (CI_PROJECT_REPONAME = PROJECT_REPONAME),
          (CI_PROJECT_USERNAME = PROJECT_USERNAME),
          (CI_CIRCLE_JOB = JOB_NAME);
        CI_URL = process.env.JENKINS_URL;
      }
      break;
    default: {
      break;
    }
  }
  return;
}
