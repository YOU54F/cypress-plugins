import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let isPresentInTagsEnv: boolean;
const cypressEnvTags = Cypress.env("TAGS");

Given(/'(.+)' is in current TAGS environmental variable/, (envTagsString: string) => {
  isPresentInTagsEnv = RegExp(envTagsString).test(cypressEnvTags);
});

Given(/this should (not )?run/, (shouldNotRun: boolean) => {
  if (typeof cypressEnvTags !== "undefined") {
    expect(!shouldNotRun).to.equal(isPresentInTagsEnv);
  }
});
