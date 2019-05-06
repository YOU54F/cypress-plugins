"use strict";

import { logger } from "./logger";

const allResponses = new Map();

allResponses.set("incoming-webhooks", new Map());

export function set(
  type: string,
  opts: { url: string; statusCode: any; body: any; headers: any }
) {
  const typeResponses = allResponses.get(type);
  if (!opts.url) {
    opts.url = "any";
  }

  let urlResponses = typeResponses.get(opts.url);

  if (!urlResponses) {
    urlResponses = [];
    typeResponses.set(opts.url, urlResponses);
  }

  logger.debug(`added response for ${type}`, opts);

  urlResponses.push({
    statusCode: opts.statusCode || 200,
    body: opts.body || (type === "web" ? { ok: true } : "OK"),
    headers: opts.headers || {}
  });
}

export function get(type: string, url: string) {
  const defaultResponse = { statusCode: 200, body: "OK", headers: {} };
  let response = defaultResponse;

  let urlResponses = allResponses.get(type).get(url);
  if (!urlResponses) {
    urlResponses = allResponses.get(type).get("any");
  }

  if (urlResponses && urlResponses.length) {
    response = urlResponses.shift();
    logger.debug(`responding to ${type} with override`, response);
  }

  return [response.statusCode, response.body, response.headers];
}

export function reset(type: string) {
  logger.debug(`clearing responses for ${type}`);
  allResponses.get(type).clear();
}

export function resetAll() {
  for (const key of allResponses.keys()) {
    logger.debug(`clearing responses for ${key}`);
    allResponses.get(key).clear();
  }
}
