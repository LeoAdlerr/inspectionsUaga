describe('Fluxo de Autenticação', () => {
  it('deve redirecionar um usuário não autenticado para /login ao tentar acessar a home', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.contains('h1', 'Plataforma de Inspeções').should('be.visible');
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach((viewport) => {
    context(`Testes em ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
      });

      it('deve exibir uma mensagem de erro ao tentar logar com credenciais inválidas', () => {
        cy.intercept('POST', '**/auth/login', {
          statusCode: 401,
          body: { message: 'Credenciais inválidas.' },
        }).as('loginRequest');

        cy.visit('/login');
        cy.get('[data-testid="login-input"] input').type('usuario.invalido');
        cy.get('[data-testid="password-input"] input').type('senhaerrada');
        cy.get('[data-testid="submit-btn"]').click();

        cy.wait('@loginRequest');
        cy.get('[data-testid="error-alert"]').should('be.visible').and('contain.text', 'Credenciais inválidas.');
      });

      it('deve autenticar com sucesso e redirecionar para a home com credenciais válidas', () => {
        const userPayload = {
          sub: 1,
          username: 'inspetore2e',
          roles: ['INSPECTOR'],
        };

        cy.task('generateJwt', userPayload).then((token) => {
          cy.intercept('POST', '**/auth/login', {
            statusCode: 201,
            body: { access_token: token },
          }).as('loginRequest');
        });

        cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
        
        cy.visit('/login');
        cy.get('[data-testid="login-input"] input').type('inspetore2e');
        cy.get('[data-testid="password-input"] input').type('PasswordE2E123!');
        cy.get('[data-testid="submit-btn"]').click();

        cy.wait('@loginRequest');
        
        cy.contains('Bem-vindo, Inspetor').should('be.visible');
      });
    });
  });
});