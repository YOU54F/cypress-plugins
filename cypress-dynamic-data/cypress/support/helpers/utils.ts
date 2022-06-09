export const dataTestId = (selector: string) => `[data-test-id="${selector}"]`;

export const getRadioControl = (cy: Cypress.Chainable, fieldTestId: string) => {
  return cy.get(`${dataTestId(fieldTestId)} input[type="radio"]`);
};

export const checkRadioControl = (
  cy: Cypress.Chainable,
  fieldTestId: string,
  value: string
) => {
  // Bootstrap styling of radio controls triggers Cypress error, so need to force check action
  // https://on.cypress.io/element-cannot-be-interacted-with
  const checkOptions: Partial<Cypress.CheckOptions> = { force: true };
  getRadioControl(cy, fieldTestId).check(value, checkOptions);
};

export const selectButtonSelectOption = (
  cy: Cypress.Chainable,
  fieldTestId: string,
  value: string
) => {
  cy.get(dataTestId(fieldTestId))
    .contains(value)
    .click();
};

export const fillDateField = (
  cy: Cypress.Chainable,
  fieldTestId: string,
  dateString: string
) => {
  const [year, month, day] = dateString.split("-");
  cy.get(dataTestId(`${fieldTestId}_day`))
    .type(day)
    .get(dataTestId(`${fieldTestId}_month`))
    .type(month)
    .get(dataTestId(`${fieldTestId}_year`))
    .type(year);
};

export const absoluteUrl = (suffix = "") =>
  `${Cypress.config().baseUrl}/${suffix}`;

export const checkPath = (type: string, path: string) =>
  cy.location(`${type}`, { timeout: 30000 }).should("include", `${path}`);

type HTTPMethods =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "CONNECT"
  | "PATCH";

type URLTypes = RegExp | string;

export const stubRoute = (
  method: HTTPMethods,
  url: URLTypes,
  alias: string
) => {
  cy.server();
  cy.route({
    method,
    url
  }).as(alias);
};
