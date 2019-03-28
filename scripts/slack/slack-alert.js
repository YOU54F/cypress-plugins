const fs = require('fs');
const path = require('path');
const combine = require('../combine.js');
const {
    IncomingWebhook
} = require('@slack/client');
const {
    SLACK_API_CHANNEL,
    SLACK_WEBHOOK_URL
} = process.env;
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);
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
const VCS_ROOT = 'github' //change to bitbucket, if circleci project hosted on bitbucket
const VCS_BASEURL_GITHUB = 'https://github.com'
const VCS_BASEURL_BITBUCKET = 'https://bitbucket.org'
const CIRCLE_URL = 'https://circleci.com/api/v1.1/project'
const GIT_COMMIT_URL = `${VCS_BASEURL_GITHUB}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}`
const BITBUCKET_COMMIT_URL = `${VCS_BASEURL_BITBUCKET}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commits/${CIRCLE_SHA1}`
const REPORT_ARTEFACT_URL = `${CIRCLE_URL}/${VCS_ROOT}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0`
var pr_link = ''
var video_attachments_slack = ''
var screenshot_attachments_slack = ''
const reportStats = getTestReportStatus() // process the test report
const reportHTMLUrl = (REPORT_ARTEFACT_URL + reportHTML)

messageSelector(); // decide which message 

function getTestReportStatus() {
    const reportDir = path.join(__dirname, '..', '..', 'mochareports');
    const reportFile = combine.getFiles(reportDir, '.json', []);
    reportHTML = combine.getFiles(reportDir, '.html', []);
    const rawdata = fs.readFileSync(reportFile[0]);
    const parsedData = JSON.parse(rawdata);
    const reportStats = parsedData.stats
    totalSuites = reportStats.suites
    totalTests = reportStats.tests
    totalPasses = reportStats.passes
    totalFailures = reportStats.failures
    totalDuration = reportStats.duration
    return {
        totalSuites,
        totalTests,
        totalPasses,
        totalFailures,
        totalDuration,
        reportFile
    };
}

function messageSelector() {
    getVideoLinks(); // 
    getScreenshotLinks();
    prChecker();
    if (reportStats.totalTests === undefined || reportStats.totalTests === 0) {
        status = 'error'
        post = postDataBuildError()
    } else if (reportStats.totalFailures > 0 || reportStats.totalPasses === 0) {
        status = 'failed'
        post = postDataTestsFailure()
    } else if (reportStats.totalFailures === 0) {
        status = 'passed'
        post = postDataTestsPassed()
    }
    sendMessage(post)
}

function prChecker() {
    if (CIRCLE_PULL_REQUEST) {
        if (CIRCLE_PULL_REQUEST.indexOf('pull') > -1) {
            return pr_link = `<${CIRCLE_PULL_REQUEST}| - PR >`
        }
    }
}

function getVideoLinks() {
    const videosDir = path.join(__dirname, '../..', 'cypress', 'videos');
    const videos = combine.getFiles(videosDir, '.mp4', []);
    videos.forEach((videoObject) => {
        trimmed_video_filename = path.basename(videoObject)
        video_attachments_slack = `<${REPORT_ARTEFACT_URL}${videoObject}|Video:- ${trimmed_video_filename}>\n${video_attachments_slack}`
    });
}

function getScreenshotLinks() {
    const screenshotDir = path.join(__dirname, '../..', 'cypress', 'screenshots');
    const screenshots = combine.getFiles(screenshotDir, '.png', []);
    screenshots.forEach((screenshotObject) => {
        trimmed_screenshot_filename = path.basename(screenshotObject)
        screenshot_attachments_slack = `<${REPORT_ARTEFACT_URL}${screenshotObject}|Screenshot:- ${trimmed_screenshot_filename}>\n${screenshot_attachments_slack}`
    });
}

function postDataTestsPassed() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test run passed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
                color: '#36a64f',
                fallback: `Report available at ${reportHTMLUrl}`,
                text: `Branch: ${CIRCLE_BRANCH}\nTotal Passed:  ${reportStats.totalPasses} `,
                actions: [{
                        type: 'button',
                        text: 'Test Report',
                        url: `${reportHTMLUrl}`,
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: 'CircleCI Logs',
                        url: `${CIRCLE_BUILD_URL}`,
                        style: 'primary'
                    }
                ]
            },
            {
                text: `${video_attachments_slack}${screenshot_attachments_slack}`,
                color: '#36a64f'
            }
        ]
    };
    return slackMessage;
};

function postDataTestsFailure() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test run failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
                color: '#ff0000',
                fallback: `Report available at ${reportHTMLUrl}`,
                title: `Total Failed: ${reportStats.totalFailures}`,
                text: `Branch: ${CIRCLE_BRANCH}\nTotal Tests: ${reportStats.totalTests}\nTotal Passed:  ${reportStats.totalPasses} `,
                actions: [{
                        type: 'button',
                        text: 'Test Report',
                        url: `${reportHTMLUrl}`,
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: 'CircleCI Logs',
                        url: `${CIRCLE_BUILD_URL}`,
                        style: 'primary'
                    }
                ]
            },
            {
                text: `${video_attachments_slack}${screenshot_attachments_slack}`,
                color: '#ff0000'
            }
        ]
    };
    return slackMessage;
};

function postDataBuildError() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test build failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
            color: '#ff0000',
            fallback: `Build Log available at ${CIRCLE_BUILD_URL}`,
            text: `Branch: ${CIRCLE_BRANCH}\nTotal Passed:  ${reportStats.totalPasses} `,
            actions: [{
                type: 'button',
                text: 'CircleCI Logs',
                url: `${CIRCLE_BUILD_URL}`,
                style: 'danger'
            }]
        }]
    };
    return slackMessage;
};

function sendMessage(template) {
    webhook.send(template, function (err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('message sent: ', res);
        }
    });
}