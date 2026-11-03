"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageConstructor = void 0;
const messageConstructor = (options) => {
    const { status, projectName = 'Cypress', branch, actor, commitUrl, pullRequestUrl, buildUrl, reportUrl, totalTests, totalPasses, totalFailures, totalSkipped, customText = '', artifactLinks = [], customBlocks = [] } = options;
    const title = status === 'build:failed'
        ? `${projectName} test build failed`
        : `${projectName} test run ${status === 'test:failed' ? 'failed' : 'passed'}`;
    const blocks = [
        {
            type: 'section',
            text: { type: 'mrkdwn', text: `*${title}*` }
        },
        {
            type: 'section',
            fields: [
                { type: 'mrkdwn', text: `*Total tests:*\n${totalTests}` },
                { type: 'mrkdwn', text: `*Passed:*\n${totalPasses}` },
                { type: 'mrkdwn', text: `*Failed:*\n${totalFailures}` },
                { type: 'mrkdwn', text: `*Skipped:*\n${totalSkipped}` }
            ]
        }
    ];
    const details = [
        branch ? `Branch: ${branch}` : undefined,
        actor && commitUrl
            ? `Triggered by <${commitUrl}|${actor}>`
            : commitUrl
                ? `Triggered by <${commitUrl}|commit>`
                : undefined,
        pullRequestUrl ? `<${pullRequestUrl}|Pull request>` : undefined,
        customText || undefined
    ].filter((line) => Boolean(line));
    if (details.length) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: details.join('\n') }
        });
    }
    const actions = [];
    if (reportUrl) {
        actions.push({
            type: 'button',
            text: { type: 'plain_text', text: 'Test Report' },
            url: reportUrl,
            style: status === 'test:failed' ? 'danger' : 'primary'
        });
    }
    if (buildUrl) {
        actions.push({
            type: 'button',
            text: { type: 'plain_text', text: 'Build Logs' },
            url: buildUrl
        });
    }
    if (actions.length)
        blocks.push({ type: 'actions', elements: actions });
    if (artifactLinks.length) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: artifactLinks.join('\n') }
        });
    }
    const allBlocks = [...blocks, ...customBlocks];
    if (allBlocks.length > 50) {
        throw new RangeError(`Slack messages support at most 50 blocks; received ${allBlocks.length}`);
    }
    return { text: title, blocks: allBlocks };
};
exports.messageConstructor = messageConstructor;
