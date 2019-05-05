import { config } from "dotenv";

if (!process.env.CI) {
  config({ path: "./config.env.test" });
}
