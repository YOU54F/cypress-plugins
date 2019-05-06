"use strict";

import qs = require("qs");
import { logger } from "./logger";

export default function parseParams(path: string, requestBody: string) {
  let body: {} = requestBody;
  let queryString: {} = {};
  const pathParts = path.split("?");

  if (pathParts[1]) {
    if (typeof requestBody === "string") {
      // parses content-type application/x-www-form-urlencoded
      logger.debug(
        `parsing application/x-www-form-urlencoded body: ${requestBody}`
      );
      body = qs.parse(requestBody);
    }
    // query params from a GET request
    logger.debug(`parsing query parameters: ${pathParts[1]}`);
    queryString = qs.parse(`${pathParts[1]}`);
    typedKeys(queryString).forEach(key => {
      body[key] = queryString[key];
    });
  } else if (typeof requestBody === "string") {
    // parses content-type application/x-www-form-urlencoded
    logger.debug(`rendering recieved body: ${requestBody}`);
    body = requestBody;

    const mbTestUrlBase = "https://api.slack.com/docs/messages/builder?msg=";
    const encodedBody = encodeURIComponent(requestBody);
    logger.debug(`Slack URL: ${mbTestUrlBase}${encodedBody}`);
  }

  function typedKeys<T>(o: T): Array<keyof T> {
    // type cast should be safe because that's what really Object.keys() does
    return Object.keys(o) as Array<keyof T>;
  }

  return body;
}
