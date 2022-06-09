import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';
import {
  CypressSlackReporterChatBotOpts,
  CypressSlackReporterWebhookOpts
} from './slack';
import { BlockBuilder, SlackMessageDto } from 'slack-block-builder';
import { messageConstructor } from './messageConstructor';
import { Appendable } from 'slack-block-builder/dist/internal/index';

export const getChatBotClient = (token: string) => new WebClient(token);
export const getIncomingWebHookClient = (url: string) =>
  new IncomingWebhook(url);

export const sendViaWebhook = async (
  opts: CypressSlackReporterWebhookOpts,
  client: IncomingWebhook,
  customBlocks?: Appendable<BlockBuilder>
) => {
  const { status, headingText } = opts;
  return await client
    .send(
      messageConstructor({
        headingText,
        status,
        customBlocks
      })
    )
    .then((response) => response)
    .catch((err) => err);
};

export const sendViaBot = async (
  opts: CypressSlackReporterChatBotOpts,
  client: WebClient,
  customBlocks?: Appendable<BlockBuilder>
) => {
  const { status, headingText, channel } = opts;
  return await client.chat
    .postMessage(
      messageConstructor({
        channel,
        headingText,
        status,
        customBlocks
      }) as Readonly<SlackMessageDto>
    )
    .then((response) => response)
    .catch((err) => err);
};
