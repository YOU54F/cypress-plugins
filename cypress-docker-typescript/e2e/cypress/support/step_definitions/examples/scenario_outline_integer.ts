import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let sum = 0;

When("I add {int} and {int}", (a: number, b: number) => {
  sum = a + b;
});

When("I verify that the result is equal the {int}", (result: number) => {
  expect(sum).to.equal(result);
});
