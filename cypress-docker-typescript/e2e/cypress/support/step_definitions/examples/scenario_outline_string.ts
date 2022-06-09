import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

const fruitToJuice = {
  apple: "apple juice",
  pineapple: "pineapple juice",
  strawberry: "strawberry juice"
} as any;

let juice = "";

Given("I put {string} in a juicer", (fruit: string) => {
  juice = fruitToJuice[fruit];
  expect(typeof juice).to.equal("string");
});

When("I switch it on", () => {
  expect(true).to.equal(true);
});

Then("I should get {string}", (resultJuice: string) => {
  expect(resultJuice).to.equal(juice);
});
