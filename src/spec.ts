import * as CypressNpmApi from "cypress";
import { logger } from "./logger";

CypressNpmApi.run({
  spec: "./cypress/integration/examples/pageObjects/login/*.ts",
  reporter: "spec"
})
  .then((results: any) => {
    logger.info(JSON.stringify(results));
  })
  .catch((err: any) => {
    logger.warn(err);
  });
