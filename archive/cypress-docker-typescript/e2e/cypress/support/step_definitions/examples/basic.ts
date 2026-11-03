import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

Given("a feature and a matching step definition file", () => {
  expect(true).to.equal(true);
});

When("I run cypress tests", () => {
  expect(true).to.equal(true);
});

Then("they run properly", () => {
  expect(true).to.equal(true);
});
