/// &amp;amp;amp;lt;reference path="node_modules/@slack/dist/types/index.d.ts"&amp;amp;amp;gt;
/// &amp;amp;amp;lt;reference path="node_modules/@slack/webhook/dist/IncomingWebhook.d.ts"&amp;amp;amp;gt;
import { MessageAttachment } from "@slack/types";
import {
  IncomingWebhook,
  IncomingWebhookDefaultArguments,
  IncomingWebhookResult,
  IncomingWebhookSendArguments,
} from "@slack/webhook";
import * as fs from "fs";
import * as globby from "globby";
import * as path from "path";
import * as pino from "pino";
const log = pino({
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info",
});

const isWin = process.platform === "win32";
const buildUrl = (...urlComponents: Array<string | undefined>) => {
  return (
    urlComponents
      // Trim leading & trailing slashes
      .map((component) => String(component).replace(/^\/|\/$/g, ""))
      .join("/")
  );
};

export interface SlackRunnerOptions {
  ciProvider: string;
  vcsRoot: string;
  reportDir: string;
  videoDir: string;
  screenshotDir: string;
  customUrl?: string;
  onlyFailed?: boolean;
  verbose?: boolean;
  customText?: string;
  useOnlyCustomUrl?: boolean;
}

export interface CiEnvVars {
  CI_SHA1: string | undefined;
  CI_BRANCH: string | undefined;
  CI_USERNAME: string | undefined;
  CI_BUILD_URL: string | undefined;
  CI_BUILD_NUM: string | undefined;
  CI_PULL_REQUEST: string | undefined;
  CI_PROJECT_REPONAME: string | undefined;
  CI_PROJECT_USERNAME: string | undefined;
  JOB_NAME: string | undefined;
  CIRCLE_PROJECT_ID: string | undefined;
  CIRCLE_WORKFLOW_JOB_ID: string | undefined;
}

interface ReportStatistics {
  totalSuites: any;
  totalTests: any;
  totalPasses: any;
  totalFailures: any;
  totalDuration: any;
  reportFile: string[];
  status: string;
}

export const slackRunner = async ({
                                    ciProvider,
                                    vcsRoot,
                                    reportDir,
                                    videoDir,
                                    screenshotDir,
                                    customUrl = "",
                                    onlyFailed = false,
                                    customText = "",
                                    useOnlyCustomUrl = false,
                                  }: SlackRunnerOptions) => {
  try {
    const ciEnvVars = resolveCIProvider(ciProvider);
    const artefactUrl = getArtefactUrl({
      vcsRoot,
      ciEnvVars,
      ciProvider,
      customUrl,
    });
    const reportHTMLUrl = await buildHTMLReportURL({
      reportDir,
      artefactUrl,
      useOnlyCustomUrl,
    });
    const videoAttachmentsSlack = await getVideoLinks({
      artefactUrl,
      videosDir: videoDir,
    }); //
    const screenshotAttachmentsSlack = await getScreenshotLinks({
      artefactUrl,
      screenshotDir,
    });
    const prLink = prChecker(ciEnvVars);
    const reportStatistics = await getTestReportStatus(reportDir); // process the test report
    if (onlyFailed && reportStatistics.status !== "failed") {
      return `onlyFailed flag set, test run status was ${reportStatistics.status}, so not sending message`;
    } else {
      const commitUrl = await getCommitUrl({
        vcsRoot,
        ciEnvVars,
      });
      const webhookInitialArguments = await webhookInitialArgs({
        status: reportStatistics.status,
        ciEnvVars,
        commitUrl,
        prLink,
      });
      const reports = await attachmentReports({
        reportStatistics,
        reportHTMLUrl,
        ciEnvVars,
        customText,
      });
      const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

      if (!SLACK_WEBHOOK_URL) {
        throw new Error("no SLACK_WEBHOOK_URL env var set");
      }

      switch (reportStatistics.status) {
        case "failed": {
          const slackWebhookFailedUrl = process.env.SLACK_WEBHOOK_FAILED_URL;
          const slackWebhookUrls = slackWebhookFailedUrl
            ? slackWebhookFailedUrl.split(",")
            : SLACK_WEBHOOK_URL.split(",");
          return await Promise.all(
            slackWebhookUrls.map(async (slackWebhookUrl) => {
              const webhook = new IncomingWebhook(
                slackWebhookUrl,
                webhookInitialArguments
              );
              const artefacts = await attachmentsVideoAndScreenshots({
                status: reportStatistics.status,
                videoAttachmentsSlack,
                screenshotAttachmentsSlack,
              });
              const sendArguments = await webhookSendArgs({
                argsWebhookSend: {},
                messageAttachments: [reports, artefacts],
              });
              log.info({ data: sendArguments }, "failing run");
              try {
                const result = await webhook.send(sendArguments);
                log.info(
                  { result, testStatus: reportStatistics },
                  "Slack message sent successfully"
                );
                return result;
              } catch (e: any) {
                e.code
                  ? log.error(
                    {
                      code: e.code,
                      message: e.message,
                      data: e.original.config.data,
                    },
                    "Failed to send slack message"
                  )
                  : log.error(
                    { e },
                    "Unknown error occurred whilst sending slack message"
                  );
                throw new Error(
                  "An error occurred whilst sending slack message"
                );
              }
            })
          );
        }
        case "passed": {
          const slackWebhookPassedUrl = process.env.SLACK_WEBHOOK_PASSED_URL;
          const slackWebhookUrls = slackWebhookPassedUrl
            ? slackWebhookPassedUrl.split(",")
            : SLACK_WEBHOOK_URL.split(",");
          return await Promise.all(
            slackWebhookUrls.map(async (slackWebhookUrl) => {
              const webhook = new IncomingWebhook(
                slackWebhookUrl,
                webhookInitialArguments
              );

              const artefacts = await attachmentsVideoAndScreenshots({
                status: reportStatistics.status,
                videoAttachmentsSlack,
                screenshotAttachmentsSlack,
              });
              const sendArguments = await webhookSendArgs({
                argsWebhookSend: {},
                messageAttachments: [reports, artefacts],
              });

              log.info({ data: sendArguments }, "passing run");
              try {
                const result = await webhook.send(sendArguments);
                log.info(
                  { result, testStatus: reportStatistics },
                  "Slack message sent successfully"
                );
                return result;
              } catch (e: any) {
                e.code
                  ? log.error(
                    {
                      code: e.code,
                      message: e.message,
                      data: e.original.config.data,
                    },
                    "Failed to send slack message"
                  )
                  : log.error(
                    { e },
                    "Unknown error occurred whilst sending slack message"
                  );
                throw new Error(
                  "An error occurred whilst sending slack message"
                );
              }
            })
          );
        }
        default: {
          const slackWebhookErrorUrl = process.env.SLACK_WEBHOOK_ERROR_URL;
          const slackWebhookUrls = slackWebhookErrorUrl
            ? slackWebhookErrorUrl.split(",")
            : SLACK_WEBHOOK_URL.split(",");
          return await Promise.all(
            slackWebhookUrls.map(async (slackWebhookUrl) => {
              const webhook = new IncomingWebhook(
                slackWebhookUrl,
                webhookInitialArguments
              );
              const sendArguments = await webhookSendArgs({
                argsWebhookSend: {},
                messageAttachments: [reports],
              });
              log.debug({ data: sendArguments }, "erroring run");
              try {
                const result = await webhook.send(sendArguments);
                log.info(
                  { result, testStatus: reportStatistics },
                  "Slack message sent successfully"
                );

                return result;
              } catch (e: any) {
                e.code
                  ? log.error(
                    {
                      code: e.code,
                      message: e.message,
                      data: e.original.config.data,
                    },
                    "Failed to send slack message"
                  )
                  : log.error(
                    { e },
                    "Unknown error occurred whilst sending slack message"
                  );
                throw new Error(
                  "An error occurred whilst sending slack message"
                );
              }
            })
          );
        }
      }
    }
  } catch (e: any) {
    throw new Error(e);
  }
};

const webhookInitialArgs = async ({
                                    status,
                                    ciEnvVars,
                                    commitUrl,
                                    prLink,
                                  }: {
  status: string;
  ciEnvVars: CiEnvVars;
  commitUrl?: string;
  prLink?: string;
}): Promise<IncomingWebhookDefaultArguments> => {
  let statusText: string;
  switch (status) {
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
    if (!ciEnvVars.CI_USERNAME) {
      triggerText = `This run was triggered by <${commitUrl}|commit>`;
    } else {
      triggerText = `This run was triggered by <${commitUrl}|${ciEnvVars.CI_USERNAME}>`;
    }
  }
  let prText: string;
  if (!prLink) {
    prText = "";
  } else {
    prText = `${prLink}`;
  }
  let projectName: string;
  if (!ciEnvVars.CI_PROJECT_REPONAME) {
    projectName = "Cypress";
  } else {
    projectName = `${ciEnvVars.CI_PROJECT_REPONAME}`;
  }
  return {
    text: `${projectName} ${statusText}\n${triggerText}${prText}`,
  };
};

const webhookSendArgs = async ({
                                 argsWebhookSend,
                                 messageAttachments,
                               }: {
  argsWebhookSend: IncomingWebhookSendArguments;
  messageAttachments: MessageAttachment[];
}) => {
  argsWebhookSend = {
    attachments: messageAttachments,
    unfurl_links: false,
    unfurl_media: false,
  };
  return argsWebhookSend;
};

const attachmentReports = async ({
                                   reportStatistics,
                                   reportHTMLUrl,
                                   ciEnvVars,
                                   customText,
                                 }: {
  reportStatistics: ReportStatistics;
  reportHTMLUrl: string;
  ciEnvVars: CiEnvVars;
  customText?: string;
}): Promise<MessageAttachment> => {
  let branchText: string;
  if (!ciEnvVars.CI_BRANCH) {
    branchText = "";
  } else {
    branchText = `Branch: ${ciEnvVars.CI_BRANCH}\n`;
  }
  let jobText;
  if (!ciEnvVars.JOB_NAME) {
    jobText = "";
  } else {
    jobText = `Job: ${ciEnvVars.JOB_NAME}\n`;
  }
  const ENV_SUT = process.env.ENV_SUT;
  let envSut: string;
  if (!ENV_SUT) {
    envSut = "";
  } else {
    envSut = `SUT: ${ENV_SUT}\n`;
  }
  if (!customText) {
    customText = "";
  } else {
    customText = `${customText}\n`;
  }
  switch (reportStatistics.status) {
    case "passed": {
      return {
        color: "#36a64f",
        fallback: `Report available at ${reportHTMLUrl}`,
        text: `${branchText}${jobText}${envSut}${customText}Total Passed:  ${reportStatistics.totalPasses}`,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary",
          },
          {
            type: "button",
            text: "Build Logs",
            url: `${ciEnvVars.CI_BUILD_URL}`,
            style: "primary",
          },
        ],
      };
    }
    case "failed": {
      return {
        color: "#ff0000",
        fallback: `Report available at ${reportHTMLUrl}`,
        title: `Total Failed: ${reportStatistics.totalFailures}`,
        text: `${branchText}${jobText}${envSut}${customText}Total Tests: ${reportStatistics.totalTests}\nTotal Passed:  ${reportStatistics.totalPasses} `,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary",
          },
          {
            type: "button",
            text: "Build Logs",
            url: `${ciEnvVars.CI_BUILD_URL}`,
            style: "primary",
          },
        ],
      };
    }
    case "error": {
      return {
        color: "#ff0000",
        fallback: `Build Log available at ${ciEnvVars.CI_BUILD_URL}`,
        text: `${branchText}${jobText}${envSut}${customText}Total Passed:  ${reportStatistics.totalPasses} `,
        actions: [
          {
            type: "button",
            text: "Build Logs",
            url: `${ciEnvVars.CI_BUILD_URL}`,
            style: "danger",
          },
        ],
      };
    }
    default: {
      return {};
    }
  }
};

const attachmentsVideoAndScreenshots = async ({
                                                status,
                                                videoAttachmentsSlack,
                                                screenshotAttachmentsSlack,
                                              }: {
  status: string;
  videoAttachmentsSlack: string;
  screenshotAttachmentsSlack: string;
}) => {
  switch (status) {
    case "passed": {
      return {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#36a64f",
      };
    }
    case "failed": {
      return {
        text: `${videoAttachmentsSlack}${screenshotAttachmentsSlack}`,
        color: "#ff0000",
      };
    }
    default: {
      return {};
    }
  }
};

const getHTMLReportFilename = async (reportDir: string) => {
  const reportHTMLFullPath = await globby(
    isWin
      ? path.resolve(reportDir).replace(/\\/g, "/")
      : path.resolve(reportDir),
    {
      expandDirectories: {
        files: ["*"],
        extensions: ["html"],
      },
    }
  );
  if (reportHTMLFullPath.length === 0) {
    log.warn(
      "No html report(s) found & cannot determine filename, omitting html report from message"
    );
  } else if (reportHTMLFullPath.length >= 2) {
    log.warn(
      "Multiple html reports found & cannot determine filename, omitting html report from message"
    );
    const reportHTMLFilename = "";
    return reportHTMLFilename;
  } else {
    const reportHTMLFilename = reportHTMLFullPath
      .toString()
      .split("/")
      .pop() as string;
    return reportHTMLFilename;
  }
};

const getTestReportStatus = async (reportDir: string) => {
  const reportFile = await globby(
    isWin
      ? path.resolve(reportDir).replace(/\\/g, "/")
      : path.resolve(reportDir),
    {
      expandDirectories: {
        files: ["*"],
        extensions: ["json"],
      },
    }
  );
  if (reportFile.length === 0) {
    log.warn("Cannot find test report, so sending build fail message");
    return {
      totalSuites: 0,
      totalTests: 0,
      totalPasses: 0,
      totalFailures: 0,
      totalDuration: 0,
      reportFile: [],
      status: "error",
    };
  }

  if (reportFile.length >= 2) {
    log.warn(
      "Multiple json reports found, please run mochawesome-merge to provide a single report, using first report for test status"
    );
  }

  const rawdata = fs.readFileSync(reportFile[0]);
  const parsedData = JSON.parse(rawdata.toString());
  const reportStats = parsedData.stats;
  const totalSuites = reportStats.suites;
  const totalTests = reportStats.tests;
  const totalPasses = reportStats.passes;
  const totalFailures = reportStats.failures;
  const totalDuration = reportStats.duration;
  if (totalTests === undefined || totalTests === 0) {
    reportStats.status = "error";
  } else if (totalFailures > 0 || totalPasses === 0) {
    reportStats.status = "failed";
  } else if (totalFailures === 0) {
    reportStats.status = "passed";
  }

  return {
    totalSuites,
    totalTests,
    totalPasses,
    totalFailures,
    totalDuration,
    reportFile,
    status: reportStats.status,
  };
};

const prChecker = (ciEnvVars: CiEnvVars) => {
  if (
    ciEnvVars.CI_PULL_REQUEST &&
    ciEnvVars.CI_PULL_REQUEST.indexOf("pull") > -1
  ) {
    return `<${ciEnvVars.CI_PULL_REQUEST}| - PR >`;
  }
};

const getVideoLinks = async ({
                               artefactUrl,
                               videosDir,
                             }: {
  artefactUrl: string;
  videosDir: string;
}) => {
  if (!artefactUrl) {
    return "";
  } else {
    log.debug({ artefactUrl, videosDir }, "getVideoLinks");
    const videosURL = `${artefactUrl}`;
    const videos = await globby(
      isWin
        ? path.resolve(process.cwd(), videosDir).replace(/\\/g, "/")
        : path.resolve(process.cwd(), videosDir),
      {
        expandDirectories: {
          files: ["*"],
          extensions: ["mp4"],
        },
      }
    );

    if (videos.length === 0) {
      return "";
    } else {
      const videoLinks = await Promise.all(
        videos.map((videoObject) => {
          const trimmedVideoFilename = path.basename(videoObject);

          return `<${buildUrl(
            videosURL,
            videosDir,
            path.relative(videosDir, videoObject)
          )}|Video:- ${trimmedVideoFilename}>\n`;
        })
      );
      return videoLinks.join("");
    }
  }
};

const getScreenshotLinks = async ({
                                    artefactUrl,
                                    screenshotDir,
                                  }: {
  artefactUrl: string;
  screenshotDir: string;
}) => {
  if (!artefactUrl) {
    return "";
  } else {
    const screenshotURL = `${artefactUrl}`;
    const screenshots = await globby(
      isWin
        ? path.resolve(process.cwd(), screenshotDir).replace(/\\/g, "/")
        : path.resolve(process.cwd(), screenshotDir),
      {
        expandDirectories: {
          files: ["*"],
          extensions: ["png"],
        },
      }
    );

    if (screenshots.length === 0) {
      return "";
    } else {
      const screenshotLinks = await Promise.all(
        screenshots.map((screenshotObject) => {
          const trimmedScreenshotFilename = path.basename(screenshotObject);

          return `<${buildUrl(
            screenshotURL,
            screenshotDir,
            path.relative(screenshotDir, screenshotObject)
          )}|Screenshot:- ${trimmedScreenshotFilename}>\n`;
        })
      );

      return screenshotLinks.join("");
    }
  }
};

const buildHTMLReportURL = async ({
                                    reportDir,
                                    artefactUrl,
                                    useOnlyCustomUrl,
                                  }: {
  reportDir: string;
  artefactUrl: string;
  useOnlyCustomUrl: boolean;
}) => {
  if (!useOnlyCustomUrl) {
    const reportHTMLFilename = await getHTMLReportFilename(reportDir);
    return buildUrl(artefactUrl, reportDir, reportHTMLFilename);
  } else {
    return buildUrl(artefactUrl)
  }
};
const getArtefactUrl = ({
                          vcsRoot,
                          ciEnvVars,
                          ciProvider,
                          customUrl,
                        }: {
  vcsRoot: string;
  ciEnvVars: CiEnvVars;
  ciProvider: string;
  customUrl: string;
}) => {
  if (customUrl) {
    return customUrl;
  } else if (ciProvider === "circleci") {
    return `https://output.circle-artifacts.com/output/job/${ciEnvVars.CIRCLE_WORKFLOW_JOB_ID}/artifacts/0/`;
  }
  return "";
};

const getCommitUrl = async ({
                              vcsRoot,
                              ciEnvVars,
                            }: {
  vcsRoot: string;
  ciEnvVars: CiEnvVars;
}) => {
  if (vcsRoot === "github") {
    return `https://github.com/${ciEnvVars.CI_PROJECT_REPONAME}/commit/${ciEnvVars.CI_SHA1}`;
  } else if (vcsRoot === "bitbucket") {
    return `https://bitbucket.org/${ciEnvVars.CI_PROJECT_USERNAME}/${ciEnvVars.CI_PROJECT_REPONAME}/commits/${ciEnvVars.CI_SHA1}`;
  } else {
    return "";
  }
};

const resolveCIProvider = (ciProvider?: string): CiEnvVars => {
  let {
    CI_SHA1,
    CI_BRANCH,
    CI_USERNAME,
    CI_BUILD_URL,
    CI_BUILD_NUM,
    CI_PULL_REQUEST,
    CI_PROJECT_REPONAME,
    CI_PROJECT_USERNAME,
    JOB_NAME,
    CIRCLE_PROJECT_ID,
    CIRCLE_WORKFLOW_JOB_ID,
  } = process.env;

  if (!ciProvider && process.env.CIRCLE_SHA1) {
    ciProvider = "circleci";
  }
  if (!ciProvider && process.env.JENKINS_HOME) {
    ciProvider = "jenkins";
  }

  switch (ciProvider) {
    case "circleci":
    {
      (CI_SHA1 = process.env.CIRCLE_SHA1),
        (CI_BRANCH = process.env.CIRCLE_BRANCH),
        (CI_USERNAME = process.env.CIRCLE_USERNAME),
        (CI_BUILD_URL = process.env.CIRCLE_BUILD_URL),
        (CI_BUILD_NUM = process.env.CIRCLE_BUILD_NUM),
        (CI_PULL_REQUEST = process.env.CIRCLE_PULL_REQUEST),
        (CI_PROJECT_REPONAME = process.env.CIRCLE_PROJECT_REPONAME),
        (CI_PROJECT_USERNAME = process.env.CIRCLE_PROJECT_USERNAME),
        (JOB_NAME = process.env.CIRCLE_JOB);
      CIRCLE_PROJECT_ID = process.env.CIRCLE_PROJECT_ID;
      CIRCLE_WORKFLOW_JOB_ID = process.env.CIRCLE_WORKFLOW_JOB_ID;
    }
      break;
    case "github":
    {
      (CI_SHA1 = process.env.GITHUB_SHA),
        (CI_BRANCH =
          process.env.GITHUB_BASE_REF || process.env.GITHUB_HEAD_REF),
        (CI_USERNAME = process.env.GITHUB_ACTOR),
        (CI_BUILD_URL = process.env.CIRCLE_BUILD_URL || "CI_BUILD_URL"),
        (CI_BUILD_NUM = process.env.CIRCLE_BUILD_NUM || "CIRCLE_BUILD_NUM"),
        (CI_PULL_REQUEST =
          process.env.CIRCLE_PULL_REQUEST || "CIRCLE_PULL_REQUEST"),
        (CI_PROJECT_REPONAME = process.env.GITHUB_REPOSITORY), // The owner and repository name. For example, octocat/Hello-World.
        (CI_PROJECT_USERNAME = process.env.GITHUB_REPOSITORY_OWNER),
        (JOB_NAME = process.env.GITHUB_ACTION);
      CIRCLE_PROJECT_ID =
        process.env.CIRCLE_PROJECT_ID || "CIRCLE_PROJECT_ID";
    }
      break;
    case "jenkins":
    {
      if (typeof process.env.GIT_URL === "undefined") {
        throw new Error("GIT_URL not defined!");
      }
      const urlParts = process.env.GIT_URL.replace(
        "https://github.com/",
        ""
      ).replace(".git", "");
      const arr = urlParts.split("/");

      (CI_SHA1 = process.env.GIT_COMMIT),
        (CI_BRANCH = process.env.BRANCH_NAME),
        (CI_USERNAME = process.env.CHANGE_AUTHOR),
        (CI_BUILD_URL = process.env.BUILD_URL),
        (CI_BUILD_NUM = process.env.BUILD_ID),
        (CI_PULL_REQUEST = process.env.CHANGE_ID),
        (CI_PROJECT_REPONAME = arr[1]),
        (CI_PROJECT_USERNAME = arr[0]);
    }
      break;
    case "bitbucket": {
      (CI_SHA1 = process.env.BITBUCKET_COMMIT),
        (CI_BUILD_NUM = process.env.BITBUCKET_BUILD_NUMBER),
        (CI_PROJECT_REPONAME = process.env.BITBUCKET_REPO_SLUG),
        (CI_PROJECT_USERNAME = process.env.BITBUCKET_WORKSPACE);

      break;
    }
    default: {
      break;
    }
  }
  return {
    CI_SHA1,
    CI_BRANCH,
    CI_USERNAME,
    CI_BUILD_URL,
    CI_BUILD_NUM,
    CI_PULL_REQUEST,
    CI_PROJECT_REPONAME,
    CI_PROJECT_USERNAME,
    JOB_NAME,
    CIRCLE_PROJECT_ID,
    CIRCLE_WORKFLOW_JOB_ID,
  };
};

export const testables = {
  resolveCIProvider,
  getCommitUrl,
  getArtefactUrl,
  buildHTMLReportURL,
  getScreenshotLinks,
  getVideoLinks,
  prChecker,
  webhookInitialArgs,
  webhookSendArgs,
  attachmentReports,
  attachmentsVideoAndScreenshots,
  getTestReportStatus,
  getHTMLReportFilename,
};
