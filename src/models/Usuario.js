const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, select: false },
    cidade: { type: String, required: true, trim: true },
    telefone: { type: String, trim: true },
    tipo: { type: String, enum: ['adotante', 'ong'], default: 'adotante' }
  },
  { timestamps: true }
);

usuarioSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    nome: this.nome,
    email: this.email,
    cidade: this.cidade,
    telefone: this.telefone,
    tipo: this.tipo
  };
};

module.exports = mongoose.model('Usuario', usuarioSchema);
