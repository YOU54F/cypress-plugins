import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let stepCounter = 0;
When("I do something", () => {
  stepCounter += 1;
});

Then("Something else", () => {
  stepCounter += 2;
});

When("I happily work", () => {
  expect(stepCounter).to.equal(3);
});
