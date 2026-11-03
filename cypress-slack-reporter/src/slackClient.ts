import { WebClient } from '@slack/web-api';
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook';
import { RunStatus } from './slack';

export const resolveWebhookUrls = (
  status: RunStatus,
  env: Record<string, string | undefined>
) => {
  const statusUrl =
    status === 'build:failed'
      ? env.SLACK_WEBHOOK_ERROR_URL
      : status === 'test:failed'
        ? env.SLACK_WEBHOOK_FAILED_URL
        : env.SLACK_WEBHOOK_PASSED_URL;
  return (statusUrl || env.SLACK_WEBHOOK_URL)
    ?.split(',')
    .map((url) => url.trim())
    .filter(Boolean);
};

export const sendSlackMessage = async (
  message: IncomingWebhookSendArguments,
  status: RunStatus,
  env: Record<string, string | undefined> = process.env
) => {
  const webhookUrls = resolveWebhookUrls(status, env);
  let sent = false;

  if (webhookUrls?.length) {
    await Promise.all(
      webhookUrls.map((url) => new IncomingWebhook(url).send(message))
    );
    sent = true;
  }

  if (env.SLACK_TOKEN) {
    if (!env.SLACK_CHANNEL) {
      throw new Error('SLACK_CHANNEL is required when using SLACK_TOKEN');
    }
    await new WebClient(env.SLACK_TOKEN).chat.postMessage({
      channel: env.SLACK_CHANNEL,
      text: message.text || '',
      blocks: message.blocks
    });
    sent = true;
  }

  if (!sent) {
    throw new Error(
      'Set SLACK_WEBHOOK_URL or both SLACK_TOKEN and SLACK_CHANNEL to send a Slack message'
    );
  }
};
