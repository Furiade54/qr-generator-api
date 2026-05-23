const express = require('express');
const { generateQrDataUrl, generateQrPngBuffer } = require('../services/qrService');

function parsePositiveInt(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;

    const parsed = Number.parseInt(String(value), 10);
    if (Number.isNaN(parsed) || parsed <= 0) return null;

    return parsed;
}

function createQrRouter({ qrDefaults }) {
    const router = express.Router();

    router.get('/generar', async (req, res) => {
        const texto = req.query.texto;
        if (!texto) return res.status(400).json({ error: 'Falta el parámetro "texto"' });

        const width = parsePositiveInt(req.query.width, qrDefaults.width);
        if (width === null) {
            return res.status(400).json({ error: 'El parámetro "width" debe ser un número positivo' });
        }

        try {
            const qrCodigoUrl = await generateQrDataUrl(texto, { ...qrDefaults, width });
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const link = `${baseUrl}/qr?texto=${encodeURIComponent(texto)}&width=${width}`;

            return res.json({ qrCodigoUrl, link });
        } catch {
            return res.status(500).json({ error: 'Error al generar el código QR' });
        }
    });

    router.get('/qr', async (req, res) => {
        const texto = req.query.texto;
        if (!texto) return res.status(400).send('Falta el parámetro "texto"');

        const width = parsePositiveInt(req.query.width, qrDefaults.width);
        if (width === null) return res.status(400).send('El parámetro "width" debe ser un número positivo');

        try {
            const pngBuffer = await generateQrPngBuffer(texto, { ...qrDefaults, width });
            res.type('png');
            return res.send(pngBuffer);
        } catch {
            return res.status(500).send('Error al generar el código QR');
        }
    });

    router.get('/qrtexto', async (req, res) => {
        const texto = req.query.texto;
        if (!texto) return res.status(400).send('Falta el parámetro "texto"');

        const width = parsePositiveInt(req.query.width, qrDefaults.width);
        if (width === null) return res.status(400).send('El parámetro "width" debe ser un número positivo');

        try {
            const qrCodigoUrl = await generateQrDataUrl(texto, { ...qrDefaults, width });
            return res.json({ codigo64: qrCodigoUrl.split(',')[1], link: 'base64' });
        } catch {
            return res.status(500).send('Error al generar el código QR');
        }
    });

    return router;
}

module.exports = { createQrRouter };
