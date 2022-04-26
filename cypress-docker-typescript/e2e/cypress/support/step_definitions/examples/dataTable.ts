import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

let sum = 0;

When("I add all following numbers:", (dataTable: any) => {
  sum = dataTable.rawTable
    .slice(1)
    .reduce(
      (rowA: any, rowB: any) =>
        rowA.reduce((a: any, b: any) => parseInt(a, 10) + parseInt(b, 10)) +
        rowB.reduce((a: any, b: any) => parseInt(a, 10) + parseInt(b, 10))
    );
});

Then("I verify the datatable result is equal to {int}", (result: number) => {
  expect(sum).to.equal(result);
});
