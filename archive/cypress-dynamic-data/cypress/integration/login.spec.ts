import { login } from "../support/pageObjects/login.page";

// tslint:disable-next-line: no-var-requires
const testData = require("../fixtures/testData.json");
// const testData = require("../fixtures/testDataFromCSV.json");

describe("Dynamically Generated Tests", () => {
  testData.forEach((testDataRow: any) => {
    const data = {
      username: testDataRow.username,
      password: testDataRow.password
    };

    context(`Generating a test for ${data.username}`, () => {
      it("should fail to login for the specified details", () => {
        login.visit();
        login.username.type(data.username);
        login.password.type(`${data.password}{enter}`);
        login.errorMsg.contains("Your username is invalid!");
        login.logOutButton.should("not.exist");
      });
    });
  });
});
