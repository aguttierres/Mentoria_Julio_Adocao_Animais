const mongoose = require('mongoose');

const PORTES = ['pequeno', 'medio', 'grande'];
const ESPECIES = ['cachorro', 'gato', 'outro'];
const STATUS = ['disponivel', 'adotado'];

const animalSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    especie: { type: String, enum: ESPECIES, required: true },
    porte: { type: String, enum: PORTES, required: true },
    idade: { type: Number, required: true, min: 0 },
    cidade: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    fotoUrl: { type: String, trim: true },
    status: { type: String, enum: STATUS, default: 'disponivel' },
    ong: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);
module.exports.PORTES = PORTES;
module.exports.ESPECIES = ESPECIES;
