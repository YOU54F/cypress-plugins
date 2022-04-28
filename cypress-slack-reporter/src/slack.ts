// SLACK_TOKEN
// Create App in Slack
// Get OAuth Tokens for Your Workspace
// add scope chat:write:bot
// https://api.slack.com/scopes/chat:write:bot
// Add SLACK_TOKEN env var
// provide channel name or id

// Webhooks require
// add scope incoming-webhook
// https://api.slack.com/scopes/incoming-webhook
// get webhook from Incoming Webhooks

export enum cypressRunStatus {
  'test:passed' = 'test:passed',
  'test:failed' = 'test:failed',
  'build:failed' = 'build:failed'
}
export interface CypressSlackReporterChatBotOpts {
  channel: string;
  headingText?: string;
  status: cypressRunStatus;
}
export interface CypressSlackReporterWebhookOpts {
  headingText?: string;
  status: cypressRunStatus;
}
