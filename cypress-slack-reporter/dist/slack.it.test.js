"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const slack_1 = require("./slack");
const slackClient_1 = require("./slackClient");
const setupMockWebhookClient = (result) => jest.doMock('@slack/webhook', () => {
    const mSlack = {
        send: result !== null && result !== void 0 ? result : jest.fn().mockResolvedValue({ text: 'ok' })
    };
    return { IncomingWebhook: jest.fn(() => mSlack) };
});
const testSendViaWebhook = (opts, webhookUrl) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve().then(() => __importStar(require('@slack/webhook'))).then((module) => __awaiter(void 0, void 0, void 0, function* () {
        return yield (0, slackClient_1.sendViaWebhook)(opts, new module.IncomingWebhook(webhookUrl));
    }));
});
const setupMockWebApiClient = (result) => jest.doMock('@slack/web-api', () => {
    const mSlack = {
        chat: {
            postMessage: result !== null && result !== void 0 ? result : jest.fn().mockResolvedValue({ ok: true })
        }
    };
    return { WebClient: jest.fn(() => mSlack) };
});
const testSendViaWebApi = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve().then(() => __importStar(require('@slack/web-api'))).then((module) => __awaiter(void 0, void 0, void 0, function* () {
        return yield (0, slackClient_1.sendViaBot)(opts, new module.WebClient());
    }));
});
describe('sends a slack message via a webhook', () => {
    describe('with valid auth credentials ', () => {
        beforeEach(() => {
            jest.resetModules();
        });
        it('should send a message via an IncomingWebHook', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = 'https://hooks.slack.com/services/realworkspace/realchannel/realtoken';
            setupMockWebhookClient();
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual({ text: 'ok' });
            });
        }));
    });
    describe('with invalid auth credentials ', () => {
        beforeEach(() => {
            jest.resetModules();
        });
        it('should fail when a blank webhook is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = '';
            setupMockWebhookClient(jest
                .fn()
                .mockRejectedValue(new TypeError("Cannot read properties of null (reading 'replace')")));
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual(new TypeError("Cannot read properties of null (reading 'replace')"));
            });
        }));
        it('should fail when a bad url is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = 'http://foo';
            setupMockWebhookClient(jest
                .fn()
                .mockRejectedValue(new Error('A request error occurred: getaddrinfo ENOTFOUND foo')));
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual(new Error('A request error occurred: getaddrinfo ENOTFOUND foo'));
            });
        }));
        it('should fail when hooks url is missing the token', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = 'https://hooks.slack.com/services/TEA926DBJ/B03DFKG8QEM/';
            setupMockWebhookClient(jest
                .fn()
                .mockRejectedValue(new Error('An HTTP protocol error occurred: statusCode = 403')));
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 403'));
            });
        }));
        it('should fail when hooks url is missing the workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = 'https://hooks.slack.com/services/foo/B03DFKG8QEM/';
            setupMockWebhookClient(jest
                .fn()
                .mockRejectedValue(new Error('An HTTP protocol error occurred: statusCode = 404')));
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 404'));
            });
        }));
        it('should fail when hooks url is missing the channel', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const webhookUrl = 'https://hooks.slack.com/services/TEA926DBJ/';
            setupMockWebhookClient(jest
                .fn()
                .mockRejectedValue(new Error('An HTTP protocol error occurred: statusCode = 301')));
            // act
            yield testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
                // assert
                expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 301'));
            });
        }));
    });
});
describe('sends a slack message via the web-api', () => {
    describe('with valid auth credentials ', () => {
        it('should send a message via the web-api', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testChatBotMessage = {
                channel: 'CESHQPXJ6',
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            setupMockWebApiClient();
            // act
            yield testSendViaWebApi(testChatBotMessage).then((res) => {
                // assert
                expect(res).toEqual({ ok: true });
            });
        }));
    });
});
