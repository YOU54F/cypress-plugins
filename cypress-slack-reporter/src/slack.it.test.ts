import { cypressRunStatus } from './slack';
import {
  getChatBotClient,
  getIncomingWebHookClient,
  sendViaBot,
  sendViaWebhook
} from './slackClient';

describe('sends a slack message', () => {
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
    const res = await sendViaWebhook(testWebhookMessage, incomingWebHookClient);

    // assert
    expect(res).toEqual({"text": "ok"});
  });
  it('should send a message via a ChatBot', async () => {
    // arrange
    const testChatBotMessage = {
      channel: 'CESHQPXJ6',
      headingText: 'sent via webhook',
      status: cypressRunStatus['build:failed']
    };

    const chatBotClient = getChatBotClient(process.env.SLACK_TOKEN ?? '');

    // act
    const res = await sendViaBot(testChatBotMessage, chatBotClient);

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
            block_id:  expect.any(String),
            type: 'divider'
          },
          {
            block_id:  expect.any(String),
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
