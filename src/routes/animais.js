const express = require('express');
const mongoose = require('mongoose');
const Animal = require('../models/Animal');
const { autenticar, exigirTipo } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Regra de negócio 1: todas as rotas de animais exigem login.
router.use(autenticar);

// Seleção de animais com filtros por porte, idade e cidade
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { porte, idadeMin, idadeMax, cidade, especie } = req.query;
    const filtro = { status: 'disponivel' };

    if (porte) {
      if (!Animal.PORTES.includes(porte)) {
        return res.status(400).json({ erro: `Porte inválido. Use: ${Animal.PORTES.join(', ')}.` });
      }
      filtro.porte = porte;
    }
    if (especie) filtro.especie = especie;
    if (cidade) filtro.cidade = new RegExp(`^${escapeRegex(String(cidade).trim())}$`, 'i');

    if (idadeMin !== undefined || idadeMax !== undefined) {
      filtro.idade = {};
      if (idadeMin !== undefined && idadeMin !== '') {
        const n = Number(idadeMin);
        if (Number.isNaN(n)) return res.status(400).json({ erro: 'idadeMin deve ser numérico.' });
        filtro.idade.$gte = n;
      }
      if (idadeMax !== undefined && idadeMax !== '') {
        const n = Number(idadeMax);
        if (Number.isNaN(n)) return res.status(400).json({ erro: 'idadeMax deve ser numérico.' });
        filtro.idade.$lte = n;
      }
      if (Object.keys(filtro.idade).length === 0) delete filtro.idade;
    }

    const animais = await Animal.find(filtro).populate('ong', 'nome cidade telefone').sort({ nome: 1 });
    return res.json(animais);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: 'Id inválido.' });
    }
    const animal = await Animal.findById(req.params.id).populate('ong', 'nome cidade telefone');
    if (!animal) return res.status(404).json({ erro: 'Animal não encontrado.' });
    return res.json(animal);
  })
);

// ONGs cadastram animais
router.post(
  '/',
  exigirTipo('ong'),
  asyncHandler(async (req, res) => {
    const { nome, especie, porte, idade, cidade, descricao, fotoUrl } = req.body || {};
    if (!nome || !especie || !porte || idade === undefined || idade === '' || !cidade) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie, porte, idade e cidade.' });
    }
    const animal = await Animal.create({
      nome,
      especie,
      porte,
      idade: Number(idade),
      cidade,
      descricao,
      fotoUrl,
      ong: req.usuario._id
    });
    return res.status(201).json(animal);
  })
);

module.exports = router;
