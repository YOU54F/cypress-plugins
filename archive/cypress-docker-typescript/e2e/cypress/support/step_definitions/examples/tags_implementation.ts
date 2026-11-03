import { shouldProceedCurrentStep } from "cypress-cucumber-preprocessor/lib/tagsHelper";
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let parsedTags: string;

Given(/my cypress environment variable TAGS is '(.+)'/, (envTagsString: string) => {
  parsedTags = envTagsString;
});

Then(/the cypress runner should not break/, () => {
  const shouldNeverThrow = () => {
    shouldProceedCurrentStep([{ name: "@test-tag" }], parsedTags);
  };
  expect(shouldNeverThrow).to.not.throw();
});

Then(
  /tests tagged '(.+)' should (not )?proceed/,
  (tags: string, shouldProceed: boolean = false) => {
    const tagsArray = tags.split(" ").map((tag: string) => ({ name: tag }));
    expect(shouldProceedCurrentStep(tagsArray, parsedTags)).to.equal(
      !shouldProceed
    );
  }
);
