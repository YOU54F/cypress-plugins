import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";


When("I assign a variable to 'this' object", function(this: any) {
   this.testVariable = "testValue";
});

Then("'this' object contains the given value", function(this: any) {
  expect(this.testVariable).to.equal("testValue");
});
