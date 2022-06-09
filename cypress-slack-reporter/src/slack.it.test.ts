import {
  cypressRunStatus,
  CypressSlackReporterChatBotOpts,
  CypressSlackReporterWebhookOpts
} from './slack';
import {
  sendViaBot,
  sendViaWebhook
} from './slackClient';

const setupMockWebhookClient = (result?: any) =>
  jest.doMock('@slack/webhook', () => {
    const mSlack = {
      send: result ?? jest.fn().mockResolvedValue({ text: 'ok' })
    };
    return { IncomingWebhook: jest.fn(() => mSlack) };
  });

const testSendViaWebhook = async (
  opts: CypressSlackReporterWebhookOpts,
  webhookUrl: string
) => {
  return import('@slack/webhook').then(async (module) => {
    return await sendViaWebhook(opts, new module.IncomingWebhook(webhookUrl));
  });
};

const setupMockWebApiClient = (result?: any) =>
  jest.doMock('@slack/web-api', () => {
    const mSlack = {
      chat: {
        postMessage: result ?? jest.fn().mockResolvedValue({ ok: true })
      }
    };
    return { WebClient: jest.fn(() => mSlack) };
  });

const testSendViaWebApi = async (opts: CypressSlackReporterChatBotOpts) => {
  return import('@slack/web-api').then(async (module) => {
    return await sendViaBot(opts, new module.WebClient());
  });
};

describe('sends a slack message via a webhook', () => {
  describe('with valid auth credentials ', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    it('should send a message via an IncomingWebHook', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const webhookUrl =
        'https://hooks.slack.com/services/realworkspace/realchannel/realtoken';

      setupMockWebhookClient();

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual({ text: 'ok' });
      });
    });
  });

  describe('with invalid auth credentials ', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    it('should fail when a blank webhook is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const webhookUrl = '';

      setupMockWebhookClient(
        jest
          .fn()
          .mockRejectedValue(
            new TypeError("Cannot read properties of null (reading 'replace')")
          )
      );

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual(
          new TypeError("Cannot read properties of null (reading 'replace')")
        );
      });
    });
    it('should fail when a bad url is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const webhookUrl = 'http://foo';
      setupMockWebhookClient(
        jest
          .fn()
          .mockRejectedValue(
            new Error('A request error occurred: getaddrinfo ENOTFOUND foo')
          )
      );

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual(
          new Error('A request error occurred: getaddrinfo ENOTFOUND foo')
        );
      });
    });
    it('should fail when hooks url is missing the token', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const webhookUrl =
        'https://hooks.slack.com/services/TEA926DBJ/B03DFKG8QEM/';
      setupMockWebhookClient(
        jest
          .fn()
          .mockRejectedValue(
            new Error('An HTTP protocol error occurred: statusCode = 403')
          )
      );

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual(
          new Error('An HTTP protocol error occurred: statusCode = 403')
        );
      });
    });
    it('should fail when hooks url is missing the workspace', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const webhookUrl = 'https://hooks.slack.com/services/foo/B03DFKG8QEM/';
      setupMockWebhookClient(
        jest
          .fn()
          .mockRejectedValue(
            new Error('An HTTP protocol error occurred: statusCode = 404')
          )
      );

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual(
          new Error('An HTTP protocol error occurred: statusCode = 404')
        );
      });
    });
    it('should fail when hooks url is missing the channel', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const webhookUrl = 'https://hooks.slack.com/services/TEA926DBJ/';
      setupMockWebhookClient(
        jest
          .fn()
          .mockRejectedValue(
            new Error('An HTTP protocol error occurred: statusCode = 301')
          )
      );

      // act
      await testSendViaWebhook(testWebhookMessage, webhookUrl).then((res) => {
        // assert
        expect(res).toEqual(
          new Error('An HTTP protocol error occurred: statusCode = 301')
        );
      });
    });
  });
});

describe('sends a slack message via the web-api', () => {
  describe('with valid auth credentials ', () => {
    it('should send a message via the web-api', async () => {
      // arrange

      const testChatBotMessage = {
        channel: 'CESHQPXJ6',
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      setupMockWebApiClient();

      // act
      await testSendViaWebApi(testChatBotMessage).then((res) => {
        // assert
        expect(res).toEqual({ ok: true });
      });
    });
  });
});
