describe('Tela 4: Revisar e Finalizar Inspeção', () => {
  const setupInterceptors = () => {
    cy.intercept(
      { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
      { fixture: 'inspection-detail-approved.json' }
    ).as('getInspectionDetails');
    cy.intercept('GET', '**/lookups/*', { statusCode: 200, body: [] }).as('getLookups');
  };

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];

  viewports.forEach(viewport => {
    context(`Funcionalidades em ${viewport}`, () => {
      beforeEach(() => {
        setupInterceptors();
        cy.viewport(viewport);
        
        // NOVO: O robô faz login antes de visitar a página.
        cy.login();

        cy.visit('/inspections/123/finalize');
        cy.wait('@getInspectionDetails');
        
        // Mantemos o gatilho de sincronização para garantir que o formulário foi populado
        cy.get('[data-testid="inspector-name-input"] input').should('have.value', 'Inspetor Aprovado');
      });

      it('deve carregar a página e exibir os dados em modo somente leitura', () => {
        cy.contains('.v-card-title', 'Revisão Final').should('be.visible');
        cy.get('[data-testid="vehicle-plates-input"] input').should('have.value', 'APV-2025');
        cy.contains('.v-chip', 'Resultado: APROVADO').should('be.visible');
      });

      it('deve permitir a edição, salvar os dados e bloquear o formulário novamente', () => {
        cy.intercept('PATCH', '**/inspections/123', { statusCode: 200, body: { success: true } }).as('updateInspection');

        cy.get('[data-testid="edit-btn"]').click();
        cy.get('[data-testid="save-btn"]').should('be.visible');

        cy.get('[data-testid="vehicle-plates-input"] input').should('not.have.attr', 'readonly');
        cy.get('[data-testid="vehicle-plates-input"] input').clear().type('NEW-PLATE');

        cy.get('[data-testid="save-btn"]').click();
        cy.wait('@updateInspection');

        cy.get('[data-testid="vehicle-plates-input"] input').should('have.attr', 'readonly');
        cy.get('[data-testid="edit-btn"]').should('be.visible');
      });

      it('deve finalizar a inspeção e redirecionar para a página de relatório real', () => {
        cy.intercept('PATCH', '**/inspections/123/finalize', { statusCode: 200, body: {} }).as('finalizeInspection');
        cy.intercept('GET', '**/inspections/123', { fixture: 'inspection-detail-approved.json' }).as('getReportData');
        cy.intercept('GET', '**/inspections/123/report/html', { fixture: 'report.html' }).as('getReportHtml');

        cy.get('[data-testid="submit-finalize-btn"]').should('not.be.disabled').click();
        cy.wait('@finalizeInspection');
        cy.wait('@getReportData');
        
        cy.url().should('include', '/inspections/123/report');
        cy.get('[data-testid="report-card"]').should('be.visible');
      });

      it('deve exibir uma mensagem de erro se a finalização falhar', () => {
        cy.intercept('PATCH', '**/inspections/123/finalize', {
          statusCode: 400,
          body: { message: ['Checklist incompleto'] }
        }).as('finalizeFail');

        cy.on('window:alert', (text) => {
          expect(text).to.contains('Checklist incompleto');
        });

        cy.get('[data-testid="submit-finalize-btn"]').click();
        cy.wait('@finalizeFail');
      });
    });
  });
});