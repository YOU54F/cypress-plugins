import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let code = "";
const variableToVerify = ""; // we are assigning this through eval

When("I use DocString for code like this:", (dataString: string) => {
  code = dataString;
});

When("I ran it and verify that it executes it", () => {
// tslint:disable-next-line: no-eval
  eval(code);
  expect(variableToVerify).to.equal("hello world");
});
