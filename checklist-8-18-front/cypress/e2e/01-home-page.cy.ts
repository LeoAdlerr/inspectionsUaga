describe('Tela 1: Página Inicial', () => {
  beforeEach(() => {
    cy.log('--- Preparando o cenário para a Tela 1 ---');
    cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
    
    // Ajustamos o intercept do DELETE para esperar pela deleção da inspeção correta (ID 3),
    // que é a que o nosso teste de "apagar" realmente tenta deletar.
    cy.intercept('DELETE', '**/inspections/3', { statusCode: 200, body: {} }).as('deleteInspection');

    cy.login();
    cy.visit('/');
    cy.wait('@getInspections');
  });

  context('Navegação Principal', () => {
    it('deve navegar para a página de nova inspeção ao clicar em "Iniciar Novo Checklist"', () => {
      cy.contains('button', /Iniciar Novo Checklist/i).click();
      cy.url().should('include', '/inspections/new');
    });
  });

  context('Visualização em Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('deve exibir o título correto e a tabela de inspeções', () => {
      cy.contains('h2', 'Inspeções Salvas').should('be.visible');
      cy.get('tbody tr').should('have.length', 2);
    });

    it('deve navegar para a página do checklist ao clicar em "Continuar"', () => {
      // O fixture inspections.json tem o item 2 como APROVADO, então usamos ele aqui
      cy.contains('tbody tr', 'APROVADO').within(() => cy.contains('button', 'Continuar').click());
      cy.url().should('include', '/inspections/2');
    });

    it('deve navegar para a página de revisão ao clicar em "Revisar"', () => {
      cy.contains('tbody tr', 'APROVADO').within(() => cy.contains('button', 'Revisar').click());
      cy.url().should('include', '/inspections/2/finalize');
    });

    it('deve apagar uma inspeção ao clicar em "Apagar" e confirmar', () => {
      cy.intercept('GET', '**/inspections', { fixture: 'inspection-deletable.json' }).as('getDeletableInspections');
      cy.visit('/');
      cy.wait('@getDeletableInspections');
      
      cy.intercept('GET', '**/inspections', { fixture: 'inspections-after-delete.json' }).as('getInspectionsAfterDelete');

      cy.on('window:confirm', () => true); // Auto-confirma o popup

      cy.contains('tbody tr', 'EM_INSPECAO').within(() => {
        cy.contains('button', 'Apagar').click();
      });
      
      cy.wait('@deleteInspection');
      cy.wait('@getInspectionsAfterDelete');
      
      cy.contains('tbody tr', 'EM_INSPECAO').should('not.exist');
    });
  });

  context('Visualização em Smartphone', () => {
    beforeEach(() => {
      cy.viewport('iphone-xr');
    });
    
    it('deve exibir o título correto e os cartões de inspeção', () => {
      cy.contains('h2', 'Inspeções Salvas').should('be.visible');
      cy.get('[data-testid="inspection-card-2"]').should('be.visible');
    });

    it('deve navegar corretamente ao clicar nos botões de ação do cartão', () => {
      cy.get('[data-testid="inspection-card-2"]').within(() => cy.contains('button', 'Continuar').click());
      cy.url().should('include', '/inspections/2');
      cy.go('back');
      cy.get('[data-testid="inspection-card-2"]').within(() => cy.contains('button', 'Revisar').click());
      cy.url().should('include', '/inspections/2/finalize');
    });

    it('deve apagar uma inspeção ao clicar no botão "Apagar" do cartão', () => {
      cy.intercept('GET', '**/inspections', { fixture: 'inspection-deletable.json' }).as('getDeletableInspections');
      cy.visit('/');
      cy.wait('@getDeletableInspections');
      
      cy.intercept('GET', '**/inspections', { fixture: 'inspections-after-delete.json' }).as('getInspectionsAfterDelete');
      
      cy.on('window:confirm', () => true);

      cy.get('[data-testid="inspection-card-3"]').within(() => {
        cy.contains('button', 'Apagar').click();
      });
      
      cy.wait('@deleteInspection');
      cy.wait('@getInspectionsAfterDelete');
      
      cy.get('[data-testid="inspection-card-3"]').should('not.exist');
    });
  });
});