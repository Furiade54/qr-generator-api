const QRCode = require('qrcode');

function getQrOptions({ width, margin, errorCorrectionLevel }) {
    return {
        width,
        margin,
        errorCorrectionLevel,
        type: 'image/png'
    };
}

async function generateQrDataUrl(text, qrConfig) {
    return QRCode.toDataURL(text, getQrOptions(qrConfig));
}

async function generateQrPngBuffer(text, qrConfig) {
    const dataUrl = await generateQrDataUrl(text, qrConfig);
    return Buffer.from(dataUrl.split(',')[1], 'base64');
}

module.exports = {
    generateQrDataUrl,
    generateQrPngBuffer
};
