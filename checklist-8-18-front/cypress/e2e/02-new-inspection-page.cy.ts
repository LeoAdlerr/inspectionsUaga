describe('Tela 2: Página de Nova Inspeção', () => {
  // beforeEach principal: Prepara todos os mocks e faz o login ANTES de cada teste.
  beforeEach(() => {
    cy.log('--- Preparando o cenário para a Tela 2 ---');
    cy.intercept('GET', '**/lookups/modalities', { fixture: 'modalities.json' }).as('getModalities');
    cy.intercept('GET', '**/lookups/operation-types', { fixture: 'operation-types.json' }).as('getOperationTypes');
    cy.intercept('GET', '**/lookups/unit-types', { fixture: 'unit-types.json' }).as('getUnitTypes');
    cy.intercept('POST', '**/inspections', { statusCode: 201, body: { id: 100 } }).as('createInspection');
    cy.intercept('POST', '**/inspections/check-existing', { statusCode: 404, body: {} }).as('checkExisting');

    // O robô faz o login para ter acesso à página.
    cy.login();
  });

  context('Validação e Navegação', () => {
    beforeEach(() => {
      // Visita a página antes de cada teste neste contexto.
      cy.visit('/inspections/new');
    });

    it('deve exibir mensagens de erro ao tentar submeter o formulário vazio', () => {
      cy.get('[data-testid="submit-btn"]').click();
      cy.contains('.v-messages__message', 'Este campo é obrigatório.').should('be.visible');
      // Verificamos que a chamada de criação não foi feita.
      cy.get('@createInspection.all').should('have.length', 0);
    });

    it('deve retornar para a página inicial ao clicar no botão de voltar', () => {
      // Simulamos a jornada completa para criar um histórico de navegação.
      cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');

      // 1. Visita a home primeiro
      cy.visit('/');
      cy.wait('@getInspections');

      // 2. Navega para a página de nova inspeção
      cy.contains('button', /Iniciar Novo Checklist/i).click();
      cy.url().should('include', '/inspections/new');

      // 3. Agora sim, clica no botão "Voltar"
      cy.get('[data-testid="back-btn"]').click();

      // 4. E valida se voltou para a home
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach((viewport) => {
    context(`Preenchimento e Submissão em ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
        cy.visit('/inspections/new');
      });

      it('deve preencher o formulário, submeter e redirecionar com sucesso', () => {
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
        cy.url().should('include', '/inspections/100');
      });
    });
  });
});