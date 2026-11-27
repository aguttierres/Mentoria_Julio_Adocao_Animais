const app = require('./app');
const db = require('./config/database');
const seed = require('./seed');

const PORT = process.env.PORT || 3000;

async function start() {
  await db.connect();
  await seed();
  const server = app.listen(PORT, () => {
    console.log(`Site:    http://localhost:${PORT}`);
    console.log(`API:     http://localhost:${PORT}/api`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });

  const encerrar = async () => {
    server.close();
    await db.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

start().catch((err) => {
  console.error('Falha ao iniciar a aplicação:', err);
  process.exit(1);
});
