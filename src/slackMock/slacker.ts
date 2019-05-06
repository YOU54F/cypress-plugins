"use strict";

export const incomingWebhooks = module.exports as IncomingWebhooks<[]>;
import * as nock from "nock";
import * as customResponses from "./custom-responses";
import { logger } from "./logger";
import parseParams from "./utils";
const baseUrl = "https://hooks.slack.com";

type IncomingWebhookUrl = string;
type IncomingWebhookHttpHeaders = nock.HttpHeaders;

// Slack accepts both GET and POST requests, will intercept API and OAuth calls

nock(baseUrl)
  .persist()
  .post(/.*/, () => true)
  .reply(reply);

incomingWebhooks.calls = [];

incomingWebhooks.reset = () => {
  logger.debug(`resetting incoming-webhooks`);

  customResponses.reset("incoming-webhooks");
  incomingWebhooks.calls.splice(0, incomingWebhooks.calls.length);
};

incomingWebhooks.addResponse = opts => {
  customResponses.set("incoming-webhooks", opts);
};

incomingWebhooks.shutdown = () => {
  logger.debug(`shutting down incoming-webhooks`);
  nock(baseUrl).done();
};

function reply(path: string, requestBody: string) {
  const url = `${baseUrl}${path}`;

  logger.debug(`intercepted incoming-webhooks request`);

  incomingWebhooks.calls.push({
    url,
    params: parseParams(path, requestBody) as [],
    headers: {}
  });

  return customResponses.get("incoming-webhooks", url) as Array<{}>;
}

interface IncomingWebhooks<T> {
  addResponse: (opts: IncomingWebhookOptions<T>) => void;
  reset: () => void;
  start: () => void;
  shutdown: () => void;
  calls: Array<IncomingWebhookCall<T>>;
}

interface IncomingWebhookOptions<T> {
  url: IncomingWebhookUrl;
  statusCode: number;
  body: T;
  headers: IncomingWebhookHttpHeaders;
}

interface IncomingWebhookCall<T> {
  url: IncomingWebhookUrl;
  params: T;
  headers: IncomingWebhookHttpHeaders;
}
