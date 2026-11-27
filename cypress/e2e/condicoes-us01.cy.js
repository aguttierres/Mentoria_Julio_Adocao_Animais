// Testes web das Condições de Teste da US01 (ISO-29119-3)
// Pré-requisito: aplicação rodando em http://localhost:3000 (npm start)

describe('US01 – Condições de Teste (Web)', () => {
  context('RN01 – Seleção de animais exige login', () => {
    it('CT-01 – Listar animais sem estar autenticado', () => {
      cy.visit('/animais.html');

      cy.url().should('include', '/index.html');
      cy.get('#msg').should('be.visible').and('contain', 'Faça login para ver os animais disponíveis.');
      cy.get('#lista').should('not.exist');
    });
  });

  context('RN02 – Fazer login exige cadastro prévio', () => {
    it('CT-02 – Tentar fazer login sem o e-mail estar cadastrado', () => {
      cy.visit('/');
      cy.get('#email').type(`naoexiste.${Date.now()}@teste.com`);
      cy.get('#senha').type('123456');
      cy.contains('button', 'Entrar').click();

      cy.get('#msg')
        .should('be.visible')
        .and('contain', 'Usuário não cadastrado. Faça seu cadastro antes de entrar.');
      cy.url().should('not.include', '/animais.html');
    });
  });

  context('RN03 – Fazer um segundo pedido de adoção com outro pendente', () => {
    it('CT-03 – Fazer um segundo pedido de adoção tendo um outro pendente', () => {
      cy.criarAdotante().then((usuario) => {
        // Primeiro pedido: deve ser aceito
        cy.visitarLogado('/animais.html', usuario);
        cy.contains('#lista .animal', 'Thor').contains('button', 'Quero adotar').click();
        cy.get('#mensagem').type('Tenho quintal grande.');
        cy.contains('button', 'Enviar pedido de adoção').click();
        cy.get('#msg').should('contain', 'Pedido enviado!');

        // Segundo pedido: deve ser bloqueado
        cy.visit('/animais.html');
        cy.contains('#lista .animal', 'Rex').contains('button', 'Quero adotar').click();
        cy.contains('button', 'Enviar pedido de adoção').click();
        cy.get('#msg')
          .should('be.visible')
          .and('contain', 'Você já possui um pedido de adoção pendente. Aguarde a resposta antes de enviar outro.');
      });
    });
  });
});
