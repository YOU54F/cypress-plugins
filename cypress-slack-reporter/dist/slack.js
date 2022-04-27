"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageConstructor = void 0;
const slack_block_builder_1 = require("slack-block-builder");
const webhook_1 = require("@slack/webhook");
const web_api_1 = require("@slack/web-api");
// SLACK_TOKEN
// Create App in Slack
// Get OAuth Tokens for Your Workspace
// add scope chat:write:bot
// https://api.slack.com/scopes/chat:write:bot
// Add SLACK_TOKEN env var
// provide channel name or id
const client = new web_api_1.WebClient(process.env.SLACK_TOKEN);
// Webhooks require
// add scope incoming-webhook
// https://api.slack.com/scopes/incoming-webhook
// get webhook from Incoming Webhooks
const messageConstructor = ({ channel, status, customBlocks }) => {
    const messageBuilder = (0, slack_block_builder_1.Message)({ channel, text: channel }).blocks(slack_block_builder_1.Blocks.Section({
        text: status
    }), slack_block_builder_1.Blocks.Divider(), slack_block_builder_1.Blocks.Actions().elements(slack_block_builder_1.Elements.Button({
        text: 'Test Report'
    }).danger(status === 'test:failed'), slack_block_builder_1.Elements.Button({
        text: 'Build Logs'
    }).danger(status === 'build:failed')));
    return customBlocks
        ? messageBuilder.blocks(...customBlocks).buildToObject()
        : messageBuilder.buildToObject();
};
exports.messageConstructor = messageConstructor;
const sendViaBot = () => __awaiter(void 0, void 0, void 0, function* () {
    client.chat
        .postMessage((0, exports.messageConstructor)({
        channel: 'github-test',
        status: 'test:failed'
    }))
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
});
const sendViaWebhook = () => __awaiter(void 0, void 0, void 0, function* () {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (typeof slackWebhookUrl === 'string') {
        const webhook = new webhook_1.IncomingWebhook(slackWebhookUrl);
        webhook
            .send((0, exports.messageConstructor)({
            // channel: 'github-test',
            status: 'build:failed',
        }))
            .then((text) => console.log('ok'))
            .catch((err) => console.error('!ok'));
    }
});
sendViaBot();
sendViaWebhook();
