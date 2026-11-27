// Testes de API das Condições de Teste da US01 (ISO-29119-3)
// Pré-requisito: aplicação rodando em http://localhost:3000 (npm start)
const request = require('supertest');
const { expect } = require('chai');

const api = request(process.env.API_URL || 'http://localhost:3000/api');

// Cada execução cadastra um adotante novo, para não depender do estado dos dados de teste
async function criarAdotanteLogado() {
  const email = `adotante.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@teste.com`;
  await api
    .post('/auth/cadastro')
    .send({ nome: 'Adotante Teste', email, senha: '123456', cidade: 'São Paulo' })
    .expect(201);
  const res = await api.post('/auth/login').send({ email, senha: '123456' }).expect(200);
  return res.body.token;
}

describe('US01 – Condições de Teste (API)', () => {
  describe('RN01 – Seleção de animais exige login', () => {
    it('CT-01 – Listar animais sem estar autenticado', async () => {
      const res = await api.get('/animais');

      expect(res.status).to.equal(401);
      expect(res.body.erro).to.equal('É necessário estar logado (token ausente).');
    });
  });

  describe('RN02 – Fazer login exige cadastro prévio', () => {
    it('CT-02 – Tentar fazer login sem o e-mail estar cadastrado', async () => {
      const res = await api
        .post('/auth/login')
        .send({ email: `naoexiste.${Date.now()}@teste.com`, senha: '123456' });

      expect(res.status).to.equal(404);
      expect(res.body.erro).to.equal('Usuário não cadastrado. Faça seu cadastro antes de entrar.');
    });
  });

  describe('RN03 – Fazer um segundo pedido de adoção com outro pendente', () => {
    it('CT-03 – Fazer um segundo pedido de adoção tendo um outro pendente', async () => {
      const token = await criarAdotanteLogado();
      const auth = { Authorization: `Bearer ${token}` };

      const { body: animais } = await api.get('/animais').set(auth).expect(200);
      expect(animais.length, 'são necessários ao menos 2 animais disponíveis').to.be.at.least(2);

      const primeiro = await api.post('/pedidos').set(auth).send({ animalId: animais[0]._id });
      expect(primeiro.status).to.equal(201);
      expect(primeiro.body.status).to.equal('pendente');

      const segundo = await api.post('/pedidos').set(auth).send({ animalId: animais[1]._id });
      expect(segundo.status).to.equal(409);
      expect(segundo.body.erro).to.equal(
        'Você já possui um pedido de adoção pendente. Aguarde a resposta antes de enviar outro.'
      );
    });
  });
});
