import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
let selectedFruit: string;

Given(/I choose (Apple|Banana)/, (selection: string) => {
  selectedFruit = selection;
});

Given("{word} is chosen", (selection: string) => {
  expect(selectedFruit).to.equal(selection);
});
