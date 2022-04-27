import {
  BlockCollection,
  AttachmentCollection,
  Blocks,
  Message,
  Elements,
  SlackMessageDto
} from 'slack-block-builder';
import {
  IncomingWebhook,
  IncomingWebhookDefaultArguments,
  IncomingWebhookResult,
  IncomingWebhookSendArguments
} from '@slack/webhook';
import { WebClient } from '@slack/web-api';

// SLACK_TOKEN
// Create App in Slack
// Get OAuth Tokens for Your Workspace
// add scope chat:write:bot
// https://api.slack.com/scopes/chat:write:bot
// Add SLACK_TOKEN env var
// provide channel name or id
const client = new WebClient(process.env.SLACK_TOKEN);

// Webhooks require
// add scope incoming-webhook
// https://api.slack.com/scopes/incoming-webhook
// get webhook from Incoming Webhooks

export const messageConstructor = ({
  channel,
  dangerLevel,
  isWebHook
}: {
  channel: string;
  dangerLevel: number;
  isWebHook?: boolean;
}) => {
  const message = Message({ channel, text: channel })
    .blocks(
      Blocks.Section({
        text: `One does not simply ${channel} into Slack and click a button.'`
      }),
      Blocks.Section({
        text: "At least that's what my friend Slackomir said :crossed_swords:"
      }),
      Blocks.Divider(),
      Blocks.Actions().elements(
        Elements.Button({
          text: 'Sure One Does',
          actionId: 'gotClicked'
        }).danger(dangerLevel > 42), // Optional argument, defaults to 'true'
        Elements.Button({
          text: 'One Does Not',
          actionId: 'scaredyCat'
        }).primary()
      )
    )
    // .asUser();

  return isWebHook ? message.buildToObject() : message.buildToJSON();
};
const dangerLevel = 59;

const sendViaBot = async () => {
  client.chat
    .postMessage(
      messageConstructor({
        channel: 'github-test',
        dangerLevel,
        isWebHook: true
      }) as Readonly<SlackMessageDto>
    )
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};
const sendViaWebhook = async () => {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (typeof slackWebhookUrl === 'string') {
    const webhook = new IncomingWebhook(slackWebhookUrl);
    webhook
      .send(
        messageConstructor({
          channel: 'github-test',
          dangerLevel,
          isWebHook: true
        })
      )
      .then((text) => console.log('ok'))
      .catch((err) => console.error('!ok'));
  }
};

sendViaBot();
sendViaWebhook();
