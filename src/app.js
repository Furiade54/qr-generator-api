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
    const safeExampleText = escapeHtml(exampleText);
    const safeDefaultWidth = escapeHtml(qrDefaults?.width ?? 350);
    const safeDefaultMargin = escapeHtml(qrDefaults?.margin ?? 1);
    const safeDefaultEcl = escapeHtml(qrDefaults?.errorCorrectionLevel ?? 'L');
    const safeTemplateQr = escapeHtml(`${baseUrl}/qr?texto={TEXTO_URL_ENCODED}&width={WIDTH}`);
    const safeTemplateGenerar = escapeHtml(`${baseUrl}/generar?texto={TEXTO_URL_ENCODED}&width={WIDTH}`);

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
    .formgrid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 12px; }
    @media (min-width: 980px) { .formgrid { grid-template-columns: 1fr 160px; align-items: end; } }
    .hero {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      margin-top: 12px;
    }
    @media (min-width: 980px) { .hero { grid-template-columns: 1fr 320px; align-items: start; } }
    .heroRight {
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.18);
      padding: 12px;
    }
    .heroRight .label { font-size: 12px; color: rgba(231,234,243,0.72); margin-bottom: 10px; }
    .heroQr {
      display: grid;
      place-items: center;
      border-radius: 14px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      background: var(--panel2);
    }
    .heroQr img {
      box-shadow: 0 14px 30px rgba(0,0,0,0.35);
    }
    label { display: block; font-size: 13px; color: rgba(231,234,243,0.82); margin-bottom: 6px; }
    input[type="text"], input[type="number"] {
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.25);
      color: rgba(231,234,243,0.95);
      outline: none;
    }
    input[type="text"]:focus, input[type="number"]:focus { border-color: rgba(138,180,255,0.55); box-shadow: 0 0 0 3px rgba(138,180,255,0.16); }
    .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
    .row .actions { margin-top: 0; }
    .kpi { display: flex; gap: 10px; flex-wrap: wrap; }
    .note { margin-top: 10px; color: rgba(231,234,243,0.70); font-size: 13px; line-height: 1.5; }
    .callout {
      margin-top: 12px;
      border-radius: 14px;
      padding: 12px 12px;
      border: 1px solid rgba(138,180,255,0.22);
      background: rgba(138,180,255,0.10);
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .callout .left { display: grid; gap: 6px; }
    .callout .label { font-size: 12px; color: rgba(231,234,243,0.75); }
    .callout code { font-size: 13px; }
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
      white-space: pre-wrap;
      word-break: break-word;
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
    img { image-rendering: pixelated; border-radius: 8px; background: #ffffff; padding: 10px; max-width: 100%; height: auto; }
    .footer { margin-top: 14px; color: rgba(231,234,243,0.55); font-size: 12px; text-align: center; }
    @media (max-width: 520px) {
      body { padding: 18px 12px 28px; }
      .top { padding: 14px 12px 12px; }
      .brandrow { flex-direction: column; align-items: flex-start; gap: 10px; }
      .logo { width: 36px; height: 36px; border-radius: 11px; }
      h1 { font-size: 20px; }
      .meta { width: 100%; }
      .pill { max-width: 100%; }
      .pill code { word-break: break-all; }
      .formgrid { grid-template-columns: 1fr; }
      .hero { grid-template-columns: 1fr; }
      .actions { flex-direction: column; }
      .btn { width: 100%; justify-content: center; }
      .callout { align-items: stretch; }
      .callout .actions { width: 100%; }
      .imgwrap { padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="wrap" id="app" data-base-url="${safeBaseUrl}" data-default-width="${safeDefaultWidth}">
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
          <span class="pill"><strong>QR_WIDTH</strong> <code>${safeDefaultWidth}</code></span>
          <span class="pill"><strong>QR_MARGIN</strong> <code>${safeDefaultMargin}</code></span>
          <span class="pill"><strong>ECL</strong> <code>${safeDefaultEcl}</code></span>
        </div>
      </div>
      <div class="hero">
        <div class="heroLeft">
          <div class="row">
            <p class="hint">Escribe un texto o URL y la página genera los links automáticamente.</p>
            <div class="kpi">
              <span class="pill"><strong>GET</strong> <code>/generar</code></span>
              <span class="pill"><strong>GET</strong> <code>/qr</code></span>
              <span class="pill"><strong>GET</strong> <code>/qrtexto</code></span>
            </div>
          </div>
          <div class="formgrid">
            <div>
              <label for="texto">Texto / URL</label>
              <input id="texto" type="text" value="${safeExampleText}" autocomplete="off" spellcheck="false" />
            </div>
            <div>
              <label for="width">Width (px)</label>
              <input id="width" type="number" min="1" step="1" value="${safeWidth}" />
            </div>
          </div>
          <div class="callout">
            <div class="left">
              <div class="label">URL para integrar (PNG directo)</div>
              <code id="integrationUrl">${safeExampleQr}</code>
            </div>
            <div class="actions">
              <button class="btn primary" id="copyIntegration" type="button" data-copy="${safeExampleQr}">Copiar</button>
            </div>
          </div>
          <p class="note">Tip: si pegas una URL con parámetros (<code>&amp;</code>, <code>?</code>) la página se encarga de codificar <code>texto</code> automáticamente.</p>
        </div>
        <aside class="heroRight" aria-label="Vista previa del QR">
          <div class="label">Vista previa (PNG)</div>
          <div class="heroQr">
            <img id="qrHeroImg" src="${safeExampleQr}" width="${safeWidth}" height="${safeWidth}" alt="QR" />
          </div>
        </aside>
      </div>
    </div>

    <div class="grid">
      <section class="card">
        <h2>Integración rápida</h2>
        <p>Puedes consumir el PNG directamente o pedir un Data URL en JSON.</p>
        <pre id="templateQr">${safeTemplateQr}</pre>
        <div class="actions">
          <button class="btn" type="button" data-copy="${safeTemplateQr}">Copiar plantilla PNG</button>
        </div>
        <pre id="templateGenerar">${safeTemplateGenerar}</pre>
        <div class="actions">
          <button class="btn" type="button" data-copy="${safeTemplateGenerar}">Copiar plantilla JSON</button>
        </div>
        <pre id="htmlSnippet">&lt;img src="${safeExampleQr}" width="${safeWidth}" height="${safeWidth}" alt="QR" /&gt;</pre>
        <div class="actions">
          <button class="btn" id="copyHtmlSnippet" type="button" data-copy="&lt;img src=&quot;${safeExampleQr}&quot; width=&quot;${safeWidth}&quot; height=&quot;${safeWidth}&quot; alt=&quot;QR&quot; /&gt;">Copiar HTML</button>
        </div>
      </section>

      <section class="card">
        <h2>1) JSON con Data URL · GET /generar</h2>
        <p>Devuelve un JSON con <code>qrCodigoUrl</code> (data URL) y un <code>link</code> listo para pedir el PNG.</p>
        <pre id="urlGenerar">${safeExampleGenerar}</pre>
        <div class="actions">
          <a class="btn primary" id="openGenerar" href="${safeExampleGenerar}">Abrir</a>
          <button class="btn" id="copyGenerar" type="button" data-copy="${safeExampleGenerar}">Copiar URL</button>
        </div>
      </section>

      <section class="card">
        <h2>2) PNG directo · GET /qr</h2>
        <p>Devuelve la imagen PNG directamente (ideal para <code>&lt;img&gt;</code> o descargas).</p>
        <pre id="urlQr">${safeExampleQr}</pre>
        <div class="actions">
          <a class="btn primary" id="openQr" href="${safeExampleQr}">Abrir</a>
          <button class="btn" id="copyQr" type="button" data-copy="${safeExampleQr}">Copiar URL</button>
        </div>
        <div class="imgwrap">
          <img id="qrImg" src="${safeExampleQr}" width="${safeWidth}" height="${safeWidth}" alt="QR" />
        </div>
      </section>

      <section class="card">
        <h2>3) JSON con base64 · GET /qrtexto</h2>
        <p>Devuelve un JSON con <code>codigo64</code> (base64 del PNG sin el prefijo <code>data:</code>).</p>
        <pre id="urlQrTexto">${safeExampleQrTexto}</pre>
        <div class="actions">
          <a class="btn primary" id="openQrTexto" href="${safeExampleQrTexto}">Abrir</a>
          <button class="btn" id="copyQrTexto" type="button" data-copy="${safeExampleQrTexto}">Copiar URL</button>
        </div>
      </section>

      <section class="card">
        <h2>Parámetros</h2>
        <pre>texto: obligatorio (URL o texto)
width: opcional (número positivo, px)</pre>
        <p class="hint">El valor de <code>width</code> de la página no cambia el default del servidor; solo se usa para armar la URL.</p>
      </section>
    </div>

    <div class="footer">qr-generator-api</div>
  </div>
  <script>
    const root = document.getElementById('app');
    const baseUrl = root?.getAttribute('data-base-url') || '';
    const defaultWidth = Number.parseInt(root?.getAttribute('data-default-width') || '350', 10) || 350;

    const inputTexto = document.getElementById('texto');
    const inputWidth = document.getElementById('width');

    const elUrlGenerar = document.getElementById('urlGenerar');
    const elUrlQr = document.getElementById('urlQr');
    const elUrlQrTexto = document.getElementById('urlQrTexto');

    const openGenerar = document.getElementById('openGenerar');
    const openQr = document.getElementById('openQr');
    const openQrTexto = document.getElementById('openQrTexto');

    const copyGenerar = document.getElementById('copyGenerar');
    const copyQr = document.getElementById('copyQr');
    const copyQrTexto = document.getElementById('copyQrTexto');
    const integrationUrl = document.getElementById('integrationUrl');
    const copyIntegration = document.getElementById('copyIntegration');
    const htmlSnippet = document.getElementById('htmlSnippet');
    const copyHtmlSnippet = document.getElementById('copyHtmlSnippet');

    const qrImg = document.getElementById('qrImg');
    const qrHeroImg = document.getElementById('qrHeroImg');

    function parseWidth(value) {
      const n = Number.parseInt(String(value || ''), 10);
      if (!Number.isFinite(n) || n <= 0) return defaultWidth;
      return n;
    }

    function buildUrls() {
      const texto = String(inputTexto?.value || '').trim();
      const width = parseWidth(inputWidth?.value);
      const encodedTexto = encodeURIComponent(texto || ' ');

      const generar = \`\${baseUrl}/generar?texto=\${encodedTexto}&width=\${width}\`;
      const qr = \`\${baseUrl}/qr?texto=\${encodedTexto}&width=\${width}\`;
      const qrtexto = \`\${baseUrl}/qrtexto?texto=\${encodedTexto}&width=\${width}\`;

      if (elUrlGenerar) elUrlGenerar.textContent = generar;
      if (elUrlQr) elUrlQr.textContent = qr;
      if (elUrlQrTexto) elUrlQrTexto.textContent = qrtexto;

      if (openGenerar) openGenerar.setAttribute('href', generar);
      if (openQr) openQr.setAttribute('href', qr);
      if (openQrTexto) openQrTexto.setAttribute('href', qrtexto);

      if (copyGenerar) copyGenerar.setAttribute('data-copy', generar);
      if (copyQr) copyQr.setAttribute('data-copy', qr);
      if (copyQrTexto) copyQrTexto.setAttribute('data-copy', qrtexto);

      if (integrationUrl) integrationUrl.textContent = qr;
      if (copyIntegration) copyIntegration.setAttribute('data-copy', qr);

      const snippet = \`<img src="\${qr}" width="\${width}" height="\${width}" alt="QR" />\`;
      if (htmlSnippet) htmlSnippet.textContent = snippet;
      if (copyHtmlSnippet) copyHtmlSnippet.setAttribute('data-copy', snippet);

      if (qrImg) {
        qrImg.setAttribute('src', qr);
        qrImg.setAttribute('width', String(width));
        qrImg.setAttribute('height', String(width));
      }

      if (qrHeroImg) {
        const heroSize = Math.max(160, Math.min(260, width));
        qrHeroImg.setAttribute('src', qr);
        qrHeroImg.setAttribute('width', String(heroSize));
        qrHeroImg.setAttribute('height', String(heroSize));
      }

      const url = new URL(window.location.href);
      url.searchParams.set('texto', texto);
      url.searchParams.set('width', String(width));
      window.history.replaceState({}, '', url.toString());
    }

    function initFromQuery() {
      const url = new URL(window.location.href);
      const texto = url.searchParams.get('texto');
      const width = url.searchParams.get('width');
      if (texto !== null && inputTexto) inputTexto.value = texto;
      if (width !== null && inputWidth) inputWidth.value = String(parseWidth(width));
    }

    function bindCopyButtons() {
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
    }

    let t = null;
    function scheduleBuild() {
      if (t) clearTimeout(t);
      t = setTimeout(() => buildUrls(), 100);
    }

    initFromQuery();
    buildUrls();
    bindCopyButtons();

    if (inputTexto) inputTexto.addEventListener('input', scheduleBuild);
    if (inputWidth) inputWidth.addEventListener('input', scheduleBuild);
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
