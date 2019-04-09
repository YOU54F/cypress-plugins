import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

When("I run one successful step", () => {
  expect(true).to.equal(true);
});

When("I run another that's unsuccessful", () => {
  expect(true).to.equal(false);
});

Then("I don't run the last step", () => {
  throw new Error("this test should be skipped");
});
