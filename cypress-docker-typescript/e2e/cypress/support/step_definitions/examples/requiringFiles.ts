import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";


let dataToBeLoaded: any;
Given("I require a file", () => {
  dataToBeLoaded = require("./requiringFilesData");
});

Then("I can access it's data", () => {
  expect(dataToBeLoaded.IAmImported).to.equal(true);
});
