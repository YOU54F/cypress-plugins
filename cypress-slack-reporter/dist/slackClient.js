"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = exports.resolveWebhookUrls = void 0;
const web_api_1 = require("@slack/web-api");
const webhook_1 = require("@slack/webhook");
const resolveWebhookUrls = (status, env) => {
    var _a;
    const statusUrl = status === 'build:failed'
        ? env.SLACK_WEBHOOK_ERROR_URL
        : status === 'test:failed'
            ? env.SLACK_WEBHOOK_FAILED_URL
            : env.SLACK_WEBHOOK_PASSED_URL;
    return (_a = (statusUrl || env.SLACK_WEBHOOK_URL)) === null || _a === void 0 ? void 0 : _a.split(',').map((url) => url.trim()).filter(Boolean);
};
exports.resolveWebhookUrls = resolveWebhookUrls;
const sendSlackMessage = async (message, status, env = process.env) => {
    const webhookUrls = (0, exports.resolveWebhookUrls)(status, env);
    let sent = false;
    if (webhookUrls === null || webhookUrls === void 0 ? void 0 : webhookUrls.length) {
        await Promise.all(webhookUrls.map((url) => new webhook_1.IncomingWebhook(url).send(message)));
        sent = true;
    }
    if (env.SLACK_TOKEN) {
        if (!env.SLACK_CHANNEL) {
            throw new Error('SLACK_CHANNEL is required when using SLACK_TOKEN');
        }
        await new web_api_1.WebClient(env.SLACK_TOKEN).chat.postMessage({
            channel: env.SLACK_CHANNEL,
            text: message.text || '',
            blocks: message.blocks
        });
        sent = true;
    }
    if (!sent) {
        throw new Error('Set SLACK_WEBHOOK_URL or both SLACK_TOKEN and SLACK_CHANNEL to send a Slack message');
    }
};
exports.sendSlackMessage = sendSlackMessage;
