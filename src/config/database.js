const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connect() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'adocao' });
  console.log('Banco em memória (mongodb-memory-server) iniciado');
}

async function disconnect() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

module.exports = { connect, disconnect };
