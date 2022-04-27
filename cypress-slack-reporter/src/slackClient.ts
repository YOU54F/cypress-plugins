import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';
import {
  CypressSlackReporterChatBotOpts,
  CypressSlackReporterWebhookOpts
} from './slack';
import { SlackMessageDto } from 'slack-block-builder';
import { messageConstructor } from './messageConstructor';

export const getChatBotClient = (token: string) => new WebClient(token);
export const getIncomingWebHookClient = (url: string) =>
  new IncomingWebhook(url);

export const sendViaWebhook = async (
  opts: CypressSlackReporterWebhookOpts,
  client: IncomingWebhook
) => {
  const { status, headingText } = opts;
  return await client
    .send(
      messageConstructor({
        headingText,
        status
      })
    )
    .then((text) => {
      console.log('ok', text);
      return text;
    })
    .catch((err) => {
      console.error('!ok', err);
      return new Error(`Error+ ${err}`);
    });
};

export const sendViaBot = async (
  opts: CypressSlackReporterChatBotOpts,
  client: WebClient
) => {
  const { status, headingText, channel } = opts;
  return await client.chat
    .postMessage(
      messageConstructor({
        channel,
        headingText,
        status
      }) as Readonly<SlackMessageDto>
    )
    .then((response) => {
      console.log('ok', response);
      return response;
    })
    .catch((err) => {
      console.error('!ok', err);
      return new Error(`Error+ ${err}`);
    });
};
