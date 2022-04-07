import { config } from "dotenv";
const CI_PROVIDER_TO_TEST = process.env.CI_PROVIDER_TO_TEST || "github";
if (!process.env.CI) {
  config({ path: "./config.env.test." + CI_PROVIDER_TO_TEST });
}
