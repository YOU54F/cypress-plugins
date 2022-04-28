"use strict";
// SLACK_TOKEN
// Create App in Slack
// Get OAuth Tokens for Your Workspace
// add scope chat:write:bot
// https://api.slack.com/scopes/chat:write:bot
// Add SLACK_TOKEN env var
// provide channel name or id
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypressRunStatus = void 0;
// Webhooks require
// add scope incoming-webhook
// https://api.slack.com/scopes/incoming-webhook
// get webhook from Incoming Webhooks
var cypressRunStatus;
(function (cypressRunStatus) {
    cypressRunStatus["test:passed"] = "test:passed";
    cypressRunStatus["test:failed"] = "test:failed";
    cypressRunStatus["build:failed"] = "build:failed";
})(cypressRunStatus = exports.cypressRunStatus || (exports.cypressRunStatus = {}));
