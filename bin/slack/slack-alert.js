"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webhook_1 = require("@slack/webhook");
var fs = require("fs");
var path = require("path");
var _a = process.env, CI_SHA1 = _a.CI_SHA1, CI_BRANCH = _a.CI_BRANCH, CI_USERNAME = _a.CI_USERNAME, CI_BUILD_URL = _a.CI_BUILD_URL, CI_BUILD_NUM = _a.CI_BUILD_NUM, CI_PULL_REQUEST = _a.CI_PULL_REQUEST, CI_PROJECT_REPONAME = _a.CI_PROJECT_REPONAME, CI_PROJECT_USERNAME = _a.CI_PROJECT_USERNAME, CI_URL = _a.CI_URL, CI_CIRCLE_JOB = _a.CI_CIRCLE_JOB;
var SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
var commitUrl = "";
var VCS_BASEURL;
var prLink = "";
var videoAttachmentsSlack;
var screenshotAttachmentsSlack;
var reportHTMLFilename = "";
var reportHTMLUrl;
var artefactUrl = "";
var attachments;
var totalSuites;
var totalTests;
var totalPasses;
var totalFailures;
var totalDuration;
var status;
var sendArgs = {};
function slackRunner(ciProvider, vcsRoot, reportDir, videoDir, screenshotDir, logger) {
    resolveCIProvider(ciProvider);
    try {
        var messageResult = sendMessage(vcsRoot, reportDir, videoDir, screenshotDir, artefactUrl);
        return messageResult;
    }
    catch (e) {
        throw new Error(e);
    }
}
exports.slackRunner = slackRunner;
function sendMessage(_vcsRoot, _reportDir, _videoDir, _screenshotDir, _artefactUrl) {
    commitUrl = getCommitUrl(_vcsRoot);
    artefactUrl = getArtefactUrl(_vcsRoot, _artefactUrl);
    reportHTMLUrl = buildHTMLReportURL(_reportDir, artefactUrl);
    videoAttachmentsSlack = getVideoLinks(artefactUrl, _videoDir); //
    screenshotAttachmentsSlack = getScreenshotLinks(artefactUrl, _screenshotDir);
    prChecker(CI_PULL_REQUEST);
    var reportStatistics = getTestReportStatus(_reportDir); // process the test report
    constructMessage(reportStatistics.status);
}
exports.sendMessage = sendMessage;
function constructMessage(_status) {
    var webhookInitialArguments = webhookInitialArgs({}, _status);
    var webhook = new webhook_1.IncomingWebhook(SLACK_WEBHOOK_URL, webhookInitialArguments);
    var reports = attachmentReports(attachments, _status);
    switch (_status) {
        case "error": {
            var sendArguments = webhookSendArgs(sendArgs, [reports]);
            return webhook.send(sendArguments);
        }
        case "failed":
        case "passed": {
            var artefacts = attachmentsVideoAndScreenshots(attachments, _status);
            var sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
            return webhook.send(sendArguments);
        }
        default: {
            throw new Error("An error occured getting the status of the test run");
        }
    }
}
exports.constructMessage = constructMessage;
function webhookInitialArgs(initialArgs, _status) {
    var statusText;
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
    var triggerText;
    if (!commitUrl) {
        triggerText = "";
    }
    else {
        if (!CI_USERNAME) {
            triggerText = "This run was triggered by <" + commitUrl + "|commit>";
        }
        else {
            triggerText = "This run was triggered by <" + commitUrl + "|" + CI_USERNAME + ">";
        }
    }
    var prText;
    if (!prLink) {
        prText = "";
    }
    else {
        prText = "" + prLink;
    }
    var projectName;
    if (!CI_PROJECT_REPONAME) {
        projectName = "Cypress";
    }
    else {
        projectName = "" + CI_PROJECT_REPONAME;
    }
    return (initialArgs = {
        text: projectName + " " + statusText + "\n" + triggerText + prText
    });
}
exports.webhookInitialArgs = webhookInitialArgs;
function webhookSendArgs(argsWebhookSend, messageAttachments) {
    argsWebhookSend = {
        attachments: messageAttachments,
        unfurl_links: false,
        unfurl_media: false
    };
    return argsWebhookSend;
}
exports.webhookSendArgs = webhookSendArgs;
function attachmentReports(attachmentsReports, _status) {
    var branchText;
    if (!CI_BRANCH) {
        branchText = "";
    }
    else {
        branchText = "Branch: " + CI_BRANCH + "\n";
    }
    var jobText;
    if (!CI_CIRCLE_JOB) {
        jobText = "";
    }
    else {
        jobText = "Job: " + CI_CIRCLE_JOB + "\n";
    }
    switch (_status) {
        case "passed": {
            return (attachments = {
                color: "#36a64f",
                fallback: "Report available at " + reportHTMLUrl,
                text: "" + branchText + jobText + "Total Passed:  " + totalPasses,
                actions: [
                    {
                        type: "button",
                        text: "Test Report",
                        url: "" + reportHTMLUrl,
                        style: "primary"
                    },
                    {
                        type: "button",
                        text: "CircleCI Logs",
                        url: "" + CI_BUILD_URL,
                        style: "primary"
                    }
                ]
            });
        }
        case "failed": {
            return (attachments = {
                color: "#ff0000",
                fallback: "Report available at " + reportHTMLUrl,
                title: "Total Failed: " + totalFailures,
                text: "" + branchText + jobText + "Total Tests: " + totalTests + "\nTotal Passed:  " + totalPasses + " ",
                actions: [
                    {
                        type: "button",
                        text: "Test Report",
                        url: "" + reportHTMLUrl,
                        style: "primary"
                    },
                    {
                        type: "button",
                        text: "CircleCI Logs",
                        url: "" + CI_BUILD_URL,
                        style: "primary"
                    }
                ]
            });
        }
        case "error": {
            return (attachments = {
                color: "#ff0000",
                fallback: "Build Log available at " + CI_BUILD_URL,
                text: "" + branchText + jobText + "Total Passed:  " + totalPasses + " ",
                actions: [
                    {
                        type: "button",
                        text: "CircleCI Logs",
                        url: "" + CI_BUILD_URL,
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
exports.attachmentReports = attachmentReports;
function attachmentsVideoAndScreenshots(attachmentsVideosScreenshots, _status) {
    switch (_status) {
        case "passed": {
            return (attachments = {
                text: "" + videoAttachmentsSlack + screenshotAttachmentsSlack,
                color: "#36a64f"
            });
        }
        case "failed": {
            return (attachments = {
                text: "" + videoAttachmentsSlack + screenshotAttachmentsSlack,
                color: "#ff0000"
            });
        }
        default: {
            break;
        }
    }
    return attachmentsVideosScreenshots;
}
exports.attachmentsVideoAndScreenshots = attachmentsVideoAndScreenshots;
function getFiles(dir, ext, fileList) {
    if (!fs.existsSync(dir) && path.basename(dir) === "mochareports") {
        return fileList;
    }
    else if (!fs.existsSync(dir)) {
        return fileList;
    }
    else {
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var filePath = dir + "/" + file;
            if (fs.statSync(filePath).isDirectory()) {
                getFiles(filePath, ext, fileList);
            }
            else if (path.extname(file) === ext) {
                fileList.push(filePath);
            }
        });
        return fileList;
    }
}
exports.getFiles = getFiles;
function getHTMLReportFilename(reportDir) {
    var reportHTMLFullPath = getFiles(reportDir, ".html", []);
    if (reportHTMLFullPath.length === 0) {
        throw new Error("Cannot find test report @ " + reportDir);
    }
    else if (reportHTMLFullPath.length >= 2) {
        throw new Error("Multiple reports found, please provide only a single report");
    }
    else {
        reportHTMLFilename = reportHTMLFullPath
            .toString()
            .split("/")
            .pop();
        return reportHTMLFilename;
    }
}
exports.getHTMLReportFilename = getHTMLReportFilename;
function getTestReportStatus(reportDir) {
    var reportFile = getFiles(reportDir, ".json", []);
    if (reportFile.length === 0) {
        throw new Error("Cannot find json test report @ " + reportDir);
    }
    else if (reportFile.length >= 2) {
        throw new Error("Multiple json reports found, please run mochawesome-merge to provide a single report");
    }
    else {
        var rawdata = fs.readFileSync(reportFile[0]);
        var parsedData = JSON.parse(rawdata.toString());
        var reportStats = parsedData.stats;
        totalSuites = reportStats.suites;
        totalTests = reportStats.tests;
        totalPasses = reportStats.passes;
        totalFailures = reportStats.failures;
        totalDuration = reportStats.duration;
        if (totalTests === undefined || totalTests === 0) {
            status = "error";
        }
        else if (totalFailures > 0 || totalPasses === 0) {
            status = "failed";
        }
        else if (totalFailures === 0) {
            status = "passed";
        }
        return {
            totalSuites: totalSuites,
            totalTests: totalTests,
            totalPasses: totalPasses,
            totalFailures: totalFailures,
            totalDuration: totalDuration,
            reportFile: reportFile,
            status: status
        };
    }
}
exports.getTestReportStatus = getTestReportStatus;
function prChecker(_CI_PULL_REQUEST) {
    if (_CI_PULL_REQUEST && _CI_PULL_REQUEST.indexOf("pull") > -1) {
        return (prLink = "<" + _CI_PULL_REQUEST + "| - PR >");
    }
}
exports.prChecker = prChecker;
function getVideoLinks(_artefactUrl, _videosDir) {
    videoAttachmentsSlack = "";
    if (!_artefactUrl) {
        return (videoAttachmentsSlack = "");
    }
    else {
        var videosURL_1 = "" + _artefactUrl;
        var videos = getFiles(_videosDir, ".mp4", []);
        if (videos.length === 0) {
            return (videoAttachmentsSlack = "");
        }
        else {
            videos.forEach(function (videoObject) {
                var trimmedVideoFilename = path.basename(videoObject);
                videoAttachmentsSlack = "<" + videosURL_1 + videoObject + "|Video:- " + trimmedVideoFilename + ">\n" + videoAttachmentsSlack;
            });
        }
    }
    return videoAttachmentsSlack;
}
exports.getVideoLinks = getVideoLinks;
function getScreenshotLinks(_artefactUrl, _screenshotDir) {
    screenshotAttachmentsSlack = "";
    if (!_artefactUrl) {
        return (screenshotAttachmentsSlack = "");
    }
    else {
        var screenshotURL_1 = "" + _artefactUrl;
        var screenshots = getFiles(_screenshotDir, ".png", []);
        if (screenshots.length === 0) {
            return (screenshotAttachmentsSlack = "");
        }
        else {
            screenshots.forEach(function (screenshotObject) {
                var trimmedScreenshotFilename = path.basename(screenshotObject);
                return (screenshotAttachmentsSlack = "<" + screenshotURL_1 + screenshotObject + "|Screenshot:- " + trimmedScreenshotFilename + ">\n" + screenshotAttachmentsSlack);
            });
        }
    }
    return screenshotAttachmentsSlack;
}
exports.getScreenshotLinks = getScreenshotLinks;
function buildHTMLReportURL(_reportDir, _artefactUrl) {
    reportHTMLFilename = getHTMLReportFilename(_reportDir);
    reportHTMLUrl = _artefactUrl + _reportDir + "/" + reportHTMLFilename;
    return reportHTMLUrl;
}
exports.buildHTMLReportURL = buildHTMLReportURL;
function getArtefactUrl(_vcsRoot, _artefactUrl) {
    switch (_vcsRoot) {
        case "github":
        case "bitbucket":
            _artefactUrl = CI_URL + "/" + _vcsRoot + "/" + CI_PROJECT_USERNAME + "/" + CI_PROJECT_REPONAME + "/" + CI_BUILD_NUM + "/artifacts/0";
            break;
        default: {
            _artefactUrl = "";
        }
    }
    return _artefactUrl;
}
exports.getArtefactUrl = getArtefactUrl;
function getCommitUrl(_vcsRoot) {
    if (_vcsRoot === "github") {
        VCS_BASEURL = "https://github.com";
        return (commitUrl = VCS_BASEURL + "/" + CI_PROJECT_USERNAME + "/" + CI_PROJECT_REPONAME + "/commit/" + CI_SHA1);
    }
    else if (_vcsRoot === "bitbucket") {
        VCS_BASEURL = "https://bitbucket.org";
        return (commitUrl = VCS_BASEURL + "/" + CI_PROJECT_USERNAME + "/" + CI_PROJECT_REPONAME + "/commits/" + CI_SHA1);
    }
    else {
        return (commitUrl = "");
    }
}
exports.getCommitUrl = getCommitUrl;
function resolveCIProvider(ciProvider) {
    switch (ciProvider) {
        case "circleci":
            {
                var _a = process.env, CIRCLE_SHA1 = _a.CIRCLE_SHA1, CIRCLE_BRANCH = _a.CIRCLE_BRANCH, CIRCLE_USERNAME = _a.CIRCLE_USERNAME, CIRCLE_BUILD_URL = _a.CIRCLE_BUILD_URL, CIRCLE_BUILD_NUM = _a.CIRCLE_BUILD_NUM, CIRCLE_PULL_REQUEST = _a.CIRCLE_PULL_REQUEST, CIRCLE_PROJECT_REPONAME = _a.CIRCLE_PROJECT_REPONAME, CIRCLE_PROJECT_USERNAME = _a.CIRCLE_PROJECT_USERNAME, CIRCLE_JOB = _a.CIRCLE_JOB;
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
        default: {
            break;
        }
    }
    return;
}
exports.resolveCIProvider = resolveCIProvider;
