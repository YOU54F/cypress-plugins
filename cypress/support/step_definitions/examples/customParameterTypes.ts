import { defineParameterType, Given, Then, When } from "cypress-cucumber-preprocessor/steps";

const notes = ["A", "B", "C", "D", "E", "F", "G"];

defineParameterType({
  name: "note",
  regexp: new RegExp(notes.join("|"))
});

defineParameterType({
  name: "ordinal",
  regexp: /(\d+)(?:st|nd|rd|th)/,
  transformer(s: any) {
    return parseInt(s, 10);
  }
});

let keySound: string 

// tslint:disable-next-line: variable-name
When("I press the {ordinal} key of my piano", (number: number) => {
  keySound = notes[(number - 1) % 7];
});

Then("I should hear a(n) {note} sound", (note: string) => {
  expect(note).to.equal(keySound);
});
