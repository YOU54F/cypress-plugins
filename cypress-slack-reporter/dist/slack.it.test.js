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
const slack_1 = require("./slack");
const slackClient_1 = require("./slackClient");
describe('sends a slack message', () => {
    describe('with valid auth credentials ', () => {
        it('should send a message via an IncomingWebHook', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)((_a = process.env.SLACK_WEBHOOK_URL) !== null && _a !== void 0 ? _a : '');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual({ text: 'ok' });
        }));
        it('should send a message via a ChatBot', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testChatBotMessage = {
                channel: 'CESHQPXJ6',
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const chatBotClientMock = jest.mock('@slack/web-api', () => {
                let WebClient = jest.requireActual('@slack/web-api');
                WebClient.mockImplementation(() => {
                    return {
                        chat: {
                            postMessage: jest.fn(() => {
                                return Promise.resolve({ text: 'foo' });
                            })
                        },
                    };
                });
            });
            // const chatBotClient = jest.fn();
            // act
            const res = yield (0, slackClient_1.sendViaBot)(testChatBotMessage, chatBotClientMock);
            expect(res).toEqual({
                ok: true,
                channel: 'CESHQPXJ6',
                ts: expect.any(String),
                message: {
                    type: 'message',
                    subtype: 'bot_message',
                    text: testChatBotMessage.headingText,
                    ts: expect.any(String),
                    username: 'Cypress.io Test Reporter',
                    bot_id: 'BEATVCAQZ',
                    app_id: 'AEATV8VUZ',
                    blocks: [
                        {
                            block_id: expect.any(String),
                            text: {
                                text: 'sent via webhook',
                                type: 'mrkdwn',
                                verbatim: false
                            },
                            type: 'section'
                        },
                        {
                            block_id: expect.any(String),
                            type: 'divider'
                        },
                        {
                            block_id: expect.any(String),
                            elements: [
                                {
                                    action_id: expect.any(String),
                                    style: 'danger',
                                    text: {
                                        emoji: true,
                                        text: 'Build Logs',
                                        type: 'plain_text'
                                    },
                                    type: 'button'
                                }
                            ],
                            type: 'actions'
                        }
                    ]
                },
                response_metadata: {
                    scopes: ['identify', 'incoming-webhook', 'chat:write:bot'],
                    acceptedScopes: ['chat:write:bot']
                }
            });
        }));
    });
    describe('with invalid auth credentials ', () => {
        it('should fail when a blank webhook is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)('');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual(new TypeError("Cannot read properties of null (reading 'replace')"));
        }));
        it('should fail when a bad url is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)('http://foo');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual(new Error('A request error occurred: getaddrinfo ENOTFOUND foo'));
        }));
        it('should fail when hooks url is missing the token', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)('https://hooks.slack.com/services/TEA926DBJ/B03DFKG8QEM/');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 403'));
        }));
        it('should fail when hooks url is missing the workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)('https://hooks.slack.com/services/foo/B03DFKG8QEM/');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 404'));
        }));
        it('should fail when hooks url is missing the channel', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testWebhookMessage = {
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const incomingWebHookClient = (0, slackClient_1.getIncomingWebHookClient)('https://hooks.slack.com/services/TEA926DBJ/');
            // act
            const res = yield (0, slackClient_1.sendViaWebhook)(testWebhookMessage, incomingWebHookClient);
            // assert
            expect(res).toEqual(new Error('An HTTP protocol error occurred: statusCode = 301'));
        }));
        it('should send a message via a ChatBot', () => __awaiter(void 0, void 0, void 0, function* () {
            // arrange
            const testChatBotMessage = {
                channel: 'CESHQPXJ6',
                headingText: 'sent via webhook',
                status: slack_1.cypressRunStatus['build:failed']
            };
            const chatBotClient = (0, slackClient_1.getChatBotClient)('fgdgf');
            // act
            const res = yield (0, slackClient_1.sendViaBot)(testChatBotMessage, chatBotClient);
            expect(res).toEqual(new Error('An API error occurred: invalid_auth'));
        }));
    });
});
