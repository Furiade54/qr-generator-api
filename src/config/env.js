function parsePositiveInt(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;

    const parsed = Number.parseInt(String(value), 10);
    if (Number.isNaN(parsed) || parsed <= 0) return null;

    return parsed;
}

function loadDotEnvIfPresent() {
    try {
        require('dotenv').config();
    } catch {
    }
}

loadDotEnvIfPresent();

const DEFAULT_PORT = 3002;
const DEFAULT_QR_WIDTH = 350;
const DEFAULT_QR_MARGIN = 1;
const DEFAULT_QR_ERROR_CORRECTION_LEVEL = 'L';

const env = {
    port: parsePositiveInt(process.env.PORT, DEFAULT_PORT),
    qr: {
        width: parsePositiveInt(process.env.QR_WIDTH, DEFAULT_QR_WIDTH),
        margin: parsePositiveInt(process.env.QR_MARGIN, DEFAULT_QR_MARGIN),
        errorCorrectionLevel: process.env.QR_ERROR_CORRECTION_LEVEL || DEFAULT_QR_ERROR_CORRECTION_LEVEL
    }
};

if (env.port === null) throw new Error('PORT debe ser un número positivo');
if (env.qr.width === null) throw new Error('QR_WIDTH debe ser un número positivo');
if (env.qr.margin === null) throw new Error('QR_MARGIN debe ser un número positivo');

module.exports = { env };
