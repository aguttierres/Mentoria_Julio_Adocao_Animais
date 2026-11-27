const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');
const Animal = require('./models/Animal');
const Pedido = require('./models/Pedido');

const SENHA_PADRAO = '123456';

async function seed() {
  const hash = await bcrypt.hash(SENHA_PADRAO, 10);

  const [ong, maria, joao] = await Usuario.create([
    {
      nome: 'ONG Patas Amigas',
      email: 'ong@patasamigas.org',
      senha: hash,
      cidade: 'São Paulo',
      telefone: '(11) 4000-1000',
      tipo: 'ong'
    },
    {
      nome: 'Maria Silva',
      email: 'maria@email.com',
      senha: hash,
      cidade: 'São Paulo',
      telefone: '(11) 98888-1111',
      tipo: 'adotante'
    },
    {
      nome: 'João Souza',
      email: 'joao@email.com',
      senha: hash,
      cidade: 'Rio de Janeiro',
      telefone: '(21) 97777-2222',
      tipo: 'adotante'
    }
  ]);

  const [, mia] = await Animal.create([
    {
      nome: 'Rex',
      fotoUrl: '/img/rex.svg',
      especie: 'cachorro',
      porte: 'grande',
      idade: 5,
      cidade: 'São Paulo',
      descricao: 'Labrador dócil, vacinado e castrado. Adora brincar com crianças.',
      ong: ong._id
    },
    {
      nome: 'Mia',
      fotoUrl: '/img/mia.svg',
      especie: 'gato',
      porte: 'pequeno',
      idade: 2,
      cidade: 'Rio de Janeiro',
      descricao: 'Gatinha tranquila, castrada, acostumada a apartamento.',
      ong: ong._id
    },
    {
      nome: 'Thor',
      fotoUrl: '/img/thor.svg',
      especie: 'cachorro',
      porte: 'medio',
      idade: 1,
      cidade: 'São Paulo',
      descricao: 'Vira-lata cheio de energia, ideal para casa com quintal.',
      ong: ong._id
    }
  ]);

  // João já possui um pedido pendente, para demonstrar a regra de negócio 3
  await Pedido.create({ usuario: joao._id, animal: mia._id, mensagem: 'Moro em apartamento e tenho tempo para cuidar da Mia.' });

  console.log(`Dados de teste: 3 usuários, 3 animais e 1 pedido pendente (senha padrão: ${SENHA_PADRAO}). Adotante sem pendência: ${maria.email}`);
}

module.exports = seed;
