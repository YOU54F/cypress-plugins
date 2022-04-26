import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let counter: number = 0;


Given("counter is incremented", () => {
  counter += 1;
});

Then("counter equals {int}", (value: number) => {
  expect(counter).to.equal(value);
});