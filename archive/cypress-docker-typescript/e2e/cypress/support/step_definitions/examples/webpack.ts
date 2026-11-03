import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import myAssertion from "../../helpers/myAssertion";


// tslint:disable-next-line: no-empty
Given(`webpack is configured`, () => {});

Then(`this test should work just fine!`, () => {
  myAssertion();
});
