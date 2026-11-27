const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { gerarToken, autenticar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Cadastro
router.post(
  '/cadastro',
  asyncHandler(async (req, res) => {
    const { nome, email, senha, cidade, telefone, tipo } = req.body || {};
    if (!nome || !email || !senha || !cidade) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha e cidade.' });
    }
    if (String(senha).length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    if (tipo && !['adotante', 'ong'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo deve ser "adotante" ou "ong".' });
    }
    const existente = await Usuario.findOne({ email: String(email).toLowerCase().trim() });
    if (existente) {
      return res.status(409).json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
    }
    const usuario = await Usuario.create({
      nome,
      email,
      senha: await bcrypt.hash(String(senha), 10),
      cidade,
      telefone,
      tipo: tipo || 'adotante'
    });
    return res.status(201).json(usuario.toPublic());
  })
);

// Login — Regra de negócio 2: só faz login quem já possui cadastro.
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe email e senha.' });
    }
    const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select('+senha');
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não cadastrado. Faça seu cadastro antes de entrar.' });
    }
    const ok = await bcrypt.compare(String(senha), usuario.senha);
    if (!ok) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }
    return res.json({ token: gerarToken(usuario), usuario: usuario.toPublic() });
  })
);

router.get('/me', autenticar, (req, res) => res.json(req.usuario.toPublic()));

module.exports = router;
