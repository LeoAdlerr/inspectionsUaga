describe('Tela 5: Relatório da Inspeção', () => {
  // beforeEach principal: Faz o login e prepara os mocks ANTES de cada teste.
  beforeEach(() => {
    // O robô faz o login para ter acesso à página.
    cy.login();

    cy.intercept('GET', '**/inspections/123', { fixture: 'inspection-detail-approved.json' }).as('getInspection');
    cy.intercept('GET', '**/inspections/123/report/html', { fixture: 'report.html' }).as('getReportHtml');
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach((viewport) => {
    context(`Funcionalidades em ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
        // Visita a página já logado
        cy.visit('/inspections/123/report');
        cy.wait(['@getInspection', '@getReportHtml']);
      });

      it('deve carregar e exibir os dados do cabeçalho e o relatório no iframe', () => {
        // No fixture 'inspection-detail-approved.json', o nome é 'Inspetor Aprovado'. Ajustamos a asserção.
        cy.get('[data-testid="inspector-name"]').should('contain.text', 'Inspetor Aprovado');
        cy.get('[data-testid="driver-name"]').should('contain.text', 'Motorista Aprovado');
        cy.get('.v-chip').should('contain.text', 'Resultado: APROVADO');
        cy.get('[data-testid="report-iframe"]').should('be.visible');
      });

      it('deve chamar a API de download de PDF ao clicar em "Baixar PDF"', () => {
        cy.intercept('GET', '**/inspections/123/report/pdf', { body: 'fake-pdf-content' }).as('downloadPdf');
        cy.get('[data-testid="download-pdf-btn"]').click();
        cy.wait('@downloadPdf');
      });

      it('deve navegar de volta para a tela anterior ao clicar no botão "Voltar"', () => {
        // Para garantir um histórico de navegação, visitamos a home antes.
        cy.visit('/');
        cy.visit('/inspections/123/report');
        cy.wait(['@getInspection', '@getReportHtml']);

        cy.get('[data-testid="back-btn"]').click();
        cy.url().should('eq', `${Cypress.config().baseUrl}/`);
      });
    });
  });
});