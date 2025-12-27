/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
/// <reference types="cypress" />

declare global {
  interface CypressTestUtils {
    requestStatusChange: (statusId: number) => void;
    confirmStatusChange: () => void;
    getState: () => {
      selectedPoint: any;
      isStatusConfirmOpen: boolean;
      pendingStatusChange: number | null;
    };
  }

  interface Window {
    Cypress?: Cypress.Cypress & {
      vue?: CypressTestUtils;
    };
  }
}

export {};