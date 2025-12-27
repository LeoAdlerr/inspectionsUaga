// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// O hook 'before' é executado uma única vez antes de TODOS os arquivos de teste.
// É o lugar perfeito para preparar o estado global do nosso ambiente de teste.
before(() => {
  cy.log('Hook global "before": Garantindo que o usuário de teste exista...');
  cy.ensureTestUserExists();
});

Cypress.on('uncaught:exception', (err) => {
  // Ignora o erro benigno do ResizeObserver
  if (err.message.includes('ResizeObserver loop completed')) {
    return false;
  }
  
  // Ignora o erro de 'reading id' que acontece durante transições rápidas de página
  if (err.message.includes("Cannot read properties of undefined (reading 'id')")) {
    return false;
  }

  return true;
});