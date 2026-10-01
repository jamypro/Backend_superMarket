require('dotenv').config();

const app = require('./app');
const dataSource = require('./config/data-source');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await dataSource.initialize();
    console.log('Conexión a la base de datos establecida correctamente');
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor iniciado correctamente en http://localhost:${PORT}`);
  });
}

bootstrap();
