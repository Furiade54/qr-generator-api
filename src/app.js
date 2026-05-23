const express = require('express');
const { createQrRouter } = require('./routes/qrRoutes');

function createApp({ qrDefaults }) {
    const app = express();
    app.disable('x-powered-by');

    app.use(createQrRouter({ qrDefaults }));

    return app;
}

module.exports = { createApp };
