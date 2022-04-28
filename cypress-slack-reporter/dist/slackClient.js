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
exports.sendViaBot = exports.sendViaWebhook = exports.getIncomingWebHookClient = exports.getChatBotClient = void 0;
const webhook_1 = require("@slack/webhook");
const web_api_1 = require("@slack/web-api");
const messageConstructor_1 = require("./messageConstructor");
const getChatBotClient = (token) => new web_api_1.WebClient(token);
exports.getChatBotClient = getChatBotClient;
const getIncomingWebHookClient = (url) => new webhook_1.IncomingWebhook(url);
exports.getIncomingWebHookClient = getIncomingWebHookClient;
const sendViaWebhook = (opts, client) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, headingText } = opts;
    return yield client
        .send((0, messageConstructor_1.messageConstructor)({
        headingText,
        status
    }))
        .then((response) => response)
        .catch((err) => err);
});
exports.sendViaWebhook = sendViaWebhook;
const sendViaBot = (opts, client) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, headingText, channel } = opts;
    return yield client.chat
        .postMessage((0, messageConstructor_1.messageConstructor)({
        channel,
        headingText,
        status
    }))
        .then((response) => response)
        .catch((err) => err);
});
exports.sendViaBot = sendViaBot;
