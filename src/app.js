const path = require('path');
const fs = require('fs');
const express = require('express');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const animaisRoutes = require('./routes/animais');
const pedidosRoutes = require('./routes/pedidos');

const app = express();
app.use(express.json());

// Documentação Swagger: arquivo YAML bruto + interface renderizada
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');
const swaggerDoc = YAML.parse(fs.readFileSync(swaggerPath, 'utf8'));
app.get('/api-docs/swagger.yaml', (req, res) => res.type('text/yaml').sendFile(swaggerPath));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { customSiteTitle: 'API Adoção de Animais' }));

// API
app.get('/api', (req, res) =>
  res.json({
    nome: 'API de Adoção de Animais',
    documentacao: '/api-docs',
    rotas: {
      'POST /api/auth/cadastro': 'Cadastra usuário',
      'POST /api/auth/login': 'Login (retorna token)',
      'GET /api/auth/me': 'Usuário logado (requer token)',
      'GET /api/animais': 'Lista animais com filtros porte, idadeMin, idadeMax, cidade (requer token)',
      'GET /api/animais/:id': 'Detalha um animal (requer token)',
      'POST /api/animais': 'Cadastra animal (ONG, requer token)',
      'POST /api/pedidos': 'Envia pedido de adoção (adotante, requer token)',
      'GET /api/pedidos': 'Lista pedidos (requer token)',
      'PATCH /api/pedidos/:id': 'ONG aprova ou recusa pedido (requer token)',
      'GET /api/health': 'Verificação de saúde'
    }
  })
);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/animais', animaisRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Site
app.use(express.static(path.join(__dirname, '..', 'public')));

// Tratamento de erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: Object.values(err.errors).map((e) => e.message) });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
