// Cadastra um adotante novo pela API e devolve as credenciais
Cypress.Commands.add('criarAdotante', () => {
  const email = `cy.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@teste.com`;
  const senha = '123456';
  return cy
    .request('POST', '/api/auth/cadastro', { nome: 'Adotante Cypress', email, senha, cidade: 'São Paulo' })
    .then(() => ({ email, senha }));
});

// Faz login pela API e abre a página já logado (mais rápido que preencher o formulário)
Cypress.Commands.add('visitarLogado', (caminho, { email, senha }) => {
  cy.request('POST', '/api/auth/login', { email, senha }).then(({ body }) => {
    cy.visit(caminho, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', body.token);
        win.localStorage.setItem('usuario', JSON.stringify(body.usuario));
      }
    });
  });
});
