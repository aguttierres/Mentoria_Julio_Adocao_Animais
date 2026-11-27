const express = require('express');
const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Animal = require('../models/Animal');
const { autenticar, exigirTipo } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(autenticar);

// Finalização do pedido de adoção
router.post(
  '/',
  exigirTipo('adotante'),
  asyncHandler(async (req, res) => {
    const { animalId, mensagem } = req.body || {};
    if (!animalId || !mongoose.isValidObjectId(animalId)) {
      return res.status(400).json({ erro: 'Informe um animalId válido.' });
    }

    // Regra de negócio 3: só pode enviar pedido se não houver outro pendente.
    const pendente = await Pedido.findOne({ usuario: req.usuario._id, status: 'pendente' });
    if (pendente) {
      return res.status(409).json({
        erro: 'Você já possui um pedido de adoção pendente. Aguarde a resposta antes de enviar outro.',
        pedidoPendenteId: pendente._id
      });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) return res.status(404).json({ erro: 'Animal não encontrado.' });
    if (animal.status !== 'disponivel') {
      return res.status(422).json({ erro: 'Este animal não está mais disponível para adoção.' });
    }

    const pedido = await Pedido.create({ usuario: req.usuario._id, animal: animal._id, mensagem });
    await pedido.populate('animal', 'nome especie porte idade cidade');
    return res.status(201).json(pedido);
  })
);

// Pedidos do usuário logado (adotante) ou recebidos pela ONG logada
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let filtro;
    if (req.usuario.tipo === 'ong') {
      const ids = await Animal.find({ ong: req.usuario._id }).distinct('_id');
      filtro = { animal: { $in: ids } };
    } else {
      filtro = { usuario: req.usuario._id };
    }
    const pedidos = await Pedido.find(filtro)
      .populate('animal', 'nome especie porte idade cidade status')
      .populate('usuario', 'nome email cidade telefone')
      .sort({ createdAt: -1 });
    return res.json(pedidos);
  })
);

// ONG responde a um pedido (aprova ou recusa), liberando o adotante para novos pedidos
router.patch(
  '/:id',
  exigirTipo('ong'),
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!['aprovado', 'recusado'].includes(status)) {
      return res.status(400).json({ erro: 'Status deve ser "aprovado" ou "recusado".' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: 'Id inválido.' });
    }
    const pedido = await Pedido.findById(req.params.id).populate('animal');
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    if (String(pedido.animal.ong) !== String(req.usuario._id)) {
      return res.status(403).json({ erro: 'Este pedido não pertence a um animal da sua ONG.' });
    }
    if (pedido.status !== 'pendente') {
      return res.status(422).json({ erro: 'Apenas pedidos pendentes podem ser respondidos.' });
    }

    pedido.status = status;
    await pedido.save();

    if (status === 'aprovado') {
      await Animal.updateOne({ _id: pedido.animal._id }, { status: 'adotado' });
      await Pedido.updateMany(
        { animal: pedido.animal._id, status: 'pendente', _id: { $ne: pedido._id } },
        { status: 'recusado' }
      );
    }
    return res.json(pedido);
  })
);

module.exports = router;
