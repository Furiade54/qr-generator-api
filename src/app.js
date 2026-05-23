const express = require('express');
const { createQrRouter } = require('./routes/qrRoutes');

function getBaseUrl(req) {
    const forwardedProto = req.get('x-forwarded-proto');
    const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
    return `${proto}://${req.get('host')}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderLandingPage({ baseUrl, qrDefaults }) {
    const exampleText = 'www.google.com';
    const width = qrDefaults?.width || 350;
    const widthSm = Math.max(150, Math.min(300, width));

    const exampleGenerar = `${baseUrl}/generar?texto=${encodeURIComponent(exampleText)}&width=${widthSm}`;
    const exampleQr = `${baseUrl}/qr?texto=${encodeURIComponent(exampleText)}&width=${widthSm}`;
    const exampleQrTexto = `${baseUrl}/qrtexto?texto=${encodeURIComponent(exampleText)}&width=${widthSm}`;

    const safeBaseUrl = escapeHtml(baseUrl);
    const safeExampleGenerar = escapeHtml(exampleGenerar);
    const safeExampleQr = escapeHtml(exampleQr);
    const safeExampleQrTexto = escapeHtml(exampleQrTexto);
    const safeWidth = escapeHtml(widthSm);

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>qr-generator-api</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1020;
      --panel: rgba(255, 255, 255, 0.06);
      --panel2: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.12);
      --muted: rgba(231, 234, 243, 0.78);
      --text: #e7eaf3;
      --brand: #8ab4ff;
      --brand2: #5eead4;
      --shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
      --radius: 16px;
    }
    * { box-sizing: border-box; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      margin: 0;
      padding: 28px 18px 40px;
      background:
        radial-gradient(1200px 700px at 15% 10%, rgba(138, 180, 255, 0.25), transparent 60%),
        radial-gradient(900px 600px at 90% 20%, rgba(94, 234, 212, 0.18), transparent 55%),
        var(--bg);
      color: var(--text);
    }
    a { color: var(--brand); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 1060px; margin: 0 auto; }
    .top {
      background: linear-gradient(135deg, rgba(138, 180, 255, 0.18), rgba(94, 234, 212, 0.10));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 18px 18px 16px;
    }
    .brandrow { display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    .title { display: flex; gap: 12px; align-items: center; }
    .logo {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.18) 40%, rgba(138,180,255,0.55) 70%, rgba(94,234,212,0.35));
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
    }
    h1 { font-size: 22px; margin: 0; letter-spacing: 0.2px; }
    .subtitle { margin: 6px 0 0; color: var(--muted); line-height: 1.5; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
    .pill {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--border);
      color: rgba(231, 234, 243, 0.92);
      font-size: 13px;
    }
    .pill strong { font-weight: 650; color: #ffffff; }
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      margin-top: 14px;
    }
    @media (min-width: 980px) { .grid { grid-template-columns: 1fr 1fr; } }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 14px 12px;
    }
    .card h2 { font-size: 15px; margin: 0 0 8px; }
    .card p { margin: 6px 0 10px; color: var(--muted); line-height: 1.5; font-size: 14px; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    pre {
      margin: 0;
      padding: 12px;
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255,255,255,0.12);
      overflow: auto;
      color: rgba(231,234,243,0.95);
      font-size: 13px;
      line-height: 1.45;
    }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    .btn {
      appearance: none;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.08);
      color: rgba(231,234,243,0.95);
      border-radius: 12px;
      padding: 8px 10px;
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }
    .btn:hover { background: rgba(255,255,255,0.12); }
    .btn.primary {
      border-color: rgba(138,180,255,0.35);
      background: rgba(138,180,255,0.18);
      color: #eaf1ff;
    }
    .btn.primary:hover { background: rgba(138,180,255,0.24); }
    .hint { margin-top: 10px; color: rgba(231,234,243,0.74); font-size: 13px; line-height: 1.5; }
    .imgwrap {
      margin-top: 10px;
      display: grid;
      place-items: center;
      padding: 16px;
      border-radius: 14px;
      background: var(--panel2);
      border: 1px solid var(--border);
    }
    img { image-rendering: pixelated; border-radius: 8px; background: #ffffff; padding: 10px; }
    .footer { margin-top: 14px; color: rgba(231,234,243,0.55); font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="brandrow">
        <div class="title">
          <div class="logo" aria-hidden="true"></div>
          <div>
            <h1>qr-generator-api</h1>
            <p class="subtitle">API HTTP para generar códigos QR (PNG/base64) a partir de un texto.</p>
          </div>
        </div>
        <div class="meta">
          <span class="pill"><strong>Base URL</strong> <code>${safeBaseUrl}</code></span>
          <span class="pill"><strong>QR_WIDTH</strong> <code>${escapeHtml(qrDefaults?.width ?? 350)}</code></span>
          <span class="pill"><strong>QR_MARGIN</strong> <code>${escapeHtml(qrDefaults?.margin ?? 1)}</code></span>
          <span class="pill"><strong>ECL</strong> <code>${escapeHtml(qrDefaults?.errorCorrectionLevel ?? 'L')}</code></span>
        </div>
      </div>
      <p class="hint">Endpoints disponibles: <code>GET /generar</code>, <code>GET /qr</code>, <code>GET /qrtexto</code>. Parámetros: <code>texto</code> (obligatorio), <code>width</code> (opcional).</p>
    </div>

    <div class="grid">
      <section class="card">
        <h2>1) JSON con Data URL · GET /generar</h2>
        <p>Devuelve un JSON con <code>qrCodigoUrl</code> (data URL) y un <code>link</code> listo para pedir el PNG.</p>
        <pre>${safeExampleGenerar}</pre>
        <div class="actions">
          <a class="btn primary" href="${safeExampleGenerar}">Abrir</a>
          <button class="btn" type="button" data-copy="${safeExampleGenerar}">Copiar URL</button>
        </div>
      </section>

      <section class="card">
        <h2>2) PNG directo · GET /qr</h2>
        <p>Devuelve la imagen PNG directamente (ideal para <code>&lt;img&gt;</code> o descargas).</p>
        <pre>${safeExampleQr}</pre>
        <div class="actions">
          <a class="btn primary" href="${safeExampleQr}">Abrir</a>
          <button class="btn" type="button" data-copy="${safeExampleQr}">Copiar URL</button>
        </div>
        <div class="imgwrap">
          <img src="${safeExampleQr}" width="${safeWidth}" height="${safeWidth}" alt="QR" />
        </div>
      </section>

      <section class="card">
        <h2>3) JSON con base64 · GET /qrtexto</h2>
        <p>Devuelve un JSON con <code>codigo64</code> (base64 del PNG sin el prefijo <code>data:</code>).</p>
        <pre>${safeExampleQrTexto}</pre>
        <div class="actions">
          <a class="btn primary" href="${safeExampleQrTexto}">Abrir</a>
          <button class="btn" type="button" data-copy="${safeExampleQrTexto}">Copiar URL</button>
        </div>
      </section>

      <section class="card">
        <h2>Parámetros</h2>
        <pre>texto: obligatorio (URL o texto)
width: opcional (número positivo, px)</pre>
        <p class="hint">Ejemplo de texto sugerido: <code>${escapeHtml(exampleText)}</code></p>
      </section>
    </div>

    <div class="footer">qr-generator-api</div>
  </div>
  <script>
    const buttons = document.querySelectorAll('[data-copy]');
    for (const btn of buttons) {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy') || '';
        const original = btn.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copiado';
        } catch {
          btn.textContent = 'No se pudo copiar';
        }
        setTimeout(() => { btn.textContent = original; }, 900);
      });
    }
  </script>
</body>
</html>`;
}

function createApp({ qrDefaults }) {
    const app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    app.get('/', (req, res) => {
        const baseUrl = getBaseUrl(req);
        res.type('html');
        return res.send(renderLandingPage({ baseUrl, qrDefaults }));
    });

    app.use(createQrRouter({ qrDefaults }));

    return app;
}

module.exports = { createApp };
