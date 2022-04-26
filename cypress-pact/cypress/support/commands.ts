// add new command to the existing Cypress interface
import {
  PactWeb,
  RequestOptions,
  ResponseOptions
} from "@pact-foundation/pact-web";
import "@testing-library/cypress/add-commands";

declare global {
  namespace Cypress {
    interface Chainable {
      startFakeServer: ({ consumer, provider, cors, port }: FakeServer) => void;

      /**
       * Add a pact interaction
       * @memberof Cypress.Chainable
       * @example
       * ```
       * cy.addInteraction({
       *   provider: string,
       *   state: string,
       *   uponReceiving: string,
       *   withRequest: PactRequest,
       *   willRespondWith: PactResponse,
       * })
       * ```
       *
       */
      addInteraction: ({
        provider,
        state,
        uponReceiving,
        withRequest,
        willRespondWith
      }: PactInteraction) => Chainable<Cypress>;

      /**
       * verifyAndResetAllFakeServers
       * @memberof Cypress.Chainable
       * @example
       * ```
       * cy.verifyAndResetAllFakeServers()
       * ```
       *
       */
      verifyAndResetAllFakeServers: () => void;

      /**
       * writePactsAndStopAllFakeServers
       * @memberof Cypress.Chainable
       * @example
       * ```
       * cy.writePactsAndStopAllFakeServers()
       * ```
       *
       */
      writePactsAndStopAllFakeServers: () => void;
    }
  }
}

interface FakeServer {
  consumer: string;
  provider: string;
  cors: boolean;
  port?: number;
}

interface PactRequest {
  method: string;
  path: string;
  body?: PactRequestBody;
}

interface PactRequestBody {
  event: string;
  page: string;
  user: string;
}

interface PactResponse {
  status: number;
}

interface PactInteraction {
  provider: string;
  state: string;
  uponReceiving: string;
  withRequest: RequestOptions;
  willRespondWith: ResponseOptions;
}

// tslint:disable-next-line: prefer-const
let pactServer: PactWeb;
let pactFakeServer: any;
export function startFakeServer({
  consumer,
  provider,
  cors,
  port
}: FakeServer): any {
  pactFakeServer = cy.task("createFakeServer", {
    consumer,
    provider,
    cors,
    port
  });
  return pactFakeServer;
}

export function addInteraction({
  provider,
  state,
  uponReceiving,
  withRequest,
  willRespondWith
}: PactInteraction): any {
  const options = { state, uponReceiving, withRequest, willRespondWith };
  return cy.task("addInteraction", options);
}

export function verifyAndResetAllFakeServers() {
  cy.task("verifyPacts");
}

export function writePactsAndStopAllFakeServers() {
  cy.task("stopFakeServer");
}

Cypress.Commands.add("startFakeServer", startFakeServer);
Cypress.Commands.add("addInteraction", addInteraction);
Cypress.Commands.add(
  "verifyAndResetAllFakeServers",
  verifyAndResetAllFakeServers
);
Cypress.Commands.add(
  "writePactsAndStopAllFakeServers",
  writePactsAndStopAllFakeServers
);
