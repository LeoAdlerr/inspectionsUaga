/// <reference types="cypress" />

// credenciais padrão correspondem ao usuário
// que o comando 'ensureTestUserExists' cria.
Cypress.Commands.add('login', (
  loginIdentifier = 'inspetor_e2e',
  password = 'PasswordE2E123!' // <-- AJUSTE AQUI TAMBÉM
) => {
  cy.log('--- Realizando login programático via API ---');
  cy.session([loginIdentifier, password], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('VITE_API_BASE_URL')}/auth/login`,
      body: { loginIdentifier, password },
    }).then(({ body }) => {
      window.localStorage.setItem('authToken', body.access_token);
    });
  });
});

Cypress.Commands.add('createAndGoToChecklist', () => {
  cy.log('--- COMANDO CUSTOMIZADO: Criando inspeção e navegando para o checklist ---');
  cy.login();
  cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
  cy.intercept('GET', '**/lookups/modalities', { fixture: 'modalities.json' }).as('getModalities');
  cy.intercept('GET', '**/lookups/operation-types', { fixture: 'operation-types.json' }).as('getOperationTypes');
  cy.intercept('GET', '**/lookups/unit-types', { fixture: 'unit-types.json' }).as('getUnitTypes');
  cy.intercept('POST', '**/inspections', { statusCode: 201, body: { id: 123 } }).as('createInspection');
  cy.intercept('POST', '**/inspections/check-existing', { statusCode: 404, body: {} }).as('checkExisting');

  cy.visit('/');
  cy.wait('@getInspections');
  cy.contains('button', /Iniciar Novo Checklist/i).click();
  cy.get('[data-testid="inspector-name-input"]').type('Inspetor E2E');
  cy.get('[data-testid="driver-name-input"]').type('Motorista E2E');
  cy.get('[data-testid="modality-select"]').click();
  cy.get('.v-list-item').contains('RODOVIARIO').click();
  cy.get('[data-testid="operation-type-select"]').click();
  cy.get('.v-list-item').contains('VERDE').click();
  cy.get('[data-testid="unit-type-select"]').click();
  cy.get('.v-list-item').contains('CONTAINER').click();
  cy.get('[data-testid="submit-btn"]').click();
  cy.wait(['@checkExisting', '@createInspection']);
  cy.url().should('include', '/inspections/123');
});

Cypress.Commands.add('ensureTestUserExists', () => {
  cy.log('--- Garantindo a existência do usuário de teste ---');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('VITE_API_BASE_URL')}/users`,
    body: {
      fullName: 'Inspetor de Testes E2E',
      username: 'inspetore2e',
      email: 'e2e@uaga.com.br',
      password: 'PasswordE2E123!',
      roleIds: [3],
    },
    failOnStatusCode: false,
  }).then((response) => {
    // Adicionamos o status 400 à lista de sucessos.
    // Agora o comando passa se o usuário for criado (201) OU se ele já existir (400, 409, 422).
    expect(response.status).to.be.oneOf([201, 422, 409, 400]);
  });
});

Cypress.Commands.add('login', (
  loginIdentifier = 'inspetore2e',
  password = 'PasswordE2E123!'
) => {
  cy.log('--- Realizando login programático via API ---');
  cy.session([loginIdentifier, password], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('VITE_API_BASE_URL')}/auth/login`,
      body: { loginIdentifier, password },
    }).then(({ body }) => {
      window.localStorage.setItem('authToken', body.access_token);
    });
  });
});

// Bloco de declaração de tipos ÚNICO e limpo.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Realiza o login programático via API e salva o token no localStorage.
       */
      login(loginIdentifier?: string, password?: string): Chainable<void>;

      /**
       * Comando customizado para criar uma inspeção via UI e navegar para a página de checklist.
       */
      createAndGoToChecklist(): Chainable<void>;

      /**
       * Garante que o usuário de teste padrão exista no banco de dados.
       */
      ensureTestUserExists(): Chainable<void>;
    }
  }
}

export { };