// Em: cypress/support/e2e.d.ts

declare global {
  namespace Cypress {
    // Adiciona a propriedade 'vue' ao objeto global Cypress
    interface Cypress {
      vue?: any;
    }
  }
}

export {};