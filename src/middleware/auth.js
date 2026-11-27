const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-dev-adocao';
const JWT_EXPIRES_IN = '8h';

function gerarToken(usuario) {
  return jwt.sign({ sub: String(usuario._id), tipo: usuario.tipo }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

// Regra de negócio 1: rotas protegidas só são acessíveis por usuário logado.
async function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');
  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'É necessário estar logado (token ausente).' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findById(payload.sub);
    if (!usuario) return res.status(401).json({ erro: 'Usuário do token não existe mais.' });
    req.usuario = usuario;
    return next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function exigirTipo(tipo) {
  return (req, res, next) => {
    if (req.usuario.tipo !== tipo) {
      return res.status(403).json({ erro: `Ação permitida apenas para usuários do tipo "${tipo}".` });
    }
    return next();
  };
}

module.exports = { gerarToken, autenticar, exigirTipo };
