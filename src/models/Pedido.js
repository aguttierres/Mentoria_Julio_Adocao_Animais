const mongoose = require('mongoose');

const STATUS = ['pendente', 'aprovado', 'recusado'];

const pedidoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    mensagem: { type: String, trim: true },
    status: { type: String, enum: STATUS, default: 'pendente' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
module.exports.STATUS = STATUS;
