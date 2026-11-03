import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

import defaultData, { namedData } from "./importingFilesData";

// tslint:disable-next-line: no-empty
Given(`I imported a file`, () => {});

Then(`I can access imported file data`, () => {
  expect(defaultData).to.equal(true);
  expect(namedData).to.equal(false);
});
