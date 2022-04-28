import { WebClient } from '@slack/web-api';
import { cypressRunStatus } from './slack';
import {
  getChatBotClient,
  getIncomingWebHookClient,
  sendViaBot,
  sendViaWebhook
} from './slackClient';


jest.mock('@slack/web-api', () => {
  const mSlack = {
    chat: {
      postMessage: jest.fn().mockResolvedValue({ text: 'ok' }),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});


describe('sends a slack message', () => {
  let slack: WebClient;
  beforeAll(() => {
    slack = new WebClient();
  });
  describe('with valid auth credentials ', () => {
    it('should send a message via an IncomingWebHook', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const incomingWebHookClient = getIncomingWebHookClient(
        process.env.SLACK_WEBHOOK_URL ?? ''
      );

      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual({ text: 'ok' });
    });
    it('should mock a ChatBot', async () => {
      // arrange
      const testChatBotMessage = {
        channel: 'CESHQPXJ6',
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

   

      // act
      const res = await sendViaBot(testChatBotMessage, slack);

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
    });
  });

  describe('with invalid auth credentials ', () => {
    it('should fail when a blank webhook is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient('');

      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new TypeError("Cannot read properties of null (reading 'replace')")
      );
    });
    it('should fail when a bad url is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient('http://foo');

      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('A request error occurred: getaddrinfo ENOTFOUND foo')
      );
    });
    it('should fail when hooks url is missing the token', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/TEA926DBJ/B03DFKG8QEM/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 403')
      );
    });
    it('should fail when hooks url is missing the workspace', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/foo/B03DFKG8QEM/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 404')
      );
    });
    it('should fail when hooks url is missing the channel', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/TEA926DBJ/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 301')
      );
    });
    it('should send a message via a ChatBot', async () => {
      // arrange
      const testChatBotMessage = {
        channel: 'CESHQPXJ6',
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const chatBotClient = getChatBotClient('fgdgf');

      // act
      const res = await sendViaBot(testChatBotMessage, chatBotClient);

      expect(res).toEqual(new Error('An API error occurred: invalid_auth'));
    });
  });
});
