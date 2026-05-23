const { env } = require('./config/env');
const { createApp } = require('./app');

const app = createApp({ qrDefaults: env.qr });

const server = app.listen(env.port, () => {
    console.log(`Servidor escuchando en http://localhost:${env.port}`);
});

server.on('error', (err) => {
    console.error(err);
    process.exitCode = 1;
});
