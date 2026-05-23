# qr-generator-api

Micro-servicio en Node.js (Express) que genera códigos QR en formato PNG a partir de un texto recibido por querystring.

## Requisitos

- Node.js + npm

## Instalación

```bash
npm install
```

## Variables de entorno

El proyecto lee variables desde `process.env`. En desarrollo puedes copiar `.env.example` a `.env`.

- `PORT` (default `3002`)
- `QR_WIDTH` (default `350`)
- `QR_MARGIN` (default `1`)
- `QR_ERROR_CORRECTION_LEVEL` (default `L`)

## Ejecución

### Local (npm)

```bash
npm start
```

El servidor queda escuchando en:

- `http://localhost:3002` (o el puerto definido en `PORT`)

Ejemplos de ejecución con variables de entorno:

```bash
# PowerShell
$env:PORT=39001; npm start
```

```bash
# Git Bash
PORT=39001 npm start
```

## Estructura

- `src/index.js`: punto de entrada
- `src/app.js`: configuración de Express
- `src/routes/*`: rutas HTTP
- `src/services/*`: lógica de negocio
- `src/config/*`: configuración/variables de entorno

## Uso de endpoints

Base URL (local):

- `http://localhost:3002`

### Parámetros comunes

- `texto` (obligatorio): contenido a codificar (URL, texto libre, etc.). Debe ir URL-encoded si contiene `&`, `?`, espacios, etc.
- `width` (opcional): ancho del PNG en píxeles. Si no se envía, usa el default (`QR_WIDTH`, por defecto `350`). Debe ser un número positivo.

### 1) Generar QR y devolver JSON (Data URL)

**GET** `/generar`

Devuelve un JSON con el QR como Data URL (útil para frontends) y un `link` listo para pedir la imagen por `/qr`.

Ejemplo (navegador):

```text
http://localhost:3002/generar?texto=www.google.com&width=150
```

Ejemplo (curl):

```bash
curl "http://localhost:3002/generar?texto=hola%20mundo&width=250"
```

Respuesta (JSON):

- `qrCodigoUrl`: `data:image/png;base64,...`
- `link`: URL generada para `/qr` con los mismos parámetros

Errores:

- `400` si falta `texto` o `width` no es válido
- `500` si ocurre un error generando el QR

### 2) Generar QR y devolver PNG (binario)

**GET** `/qr`

Devuelve directamente la imagen PNG. Útil para incrustar en HTML o descargar.

Ejemplo (abrir en el navegador):

```text
http://localhost:3002/qr?texto=www.google.com&width=300
```

Ejemplo (guardar a archivo):

```bash
curl -o qr.png "http://localhost:3002/qr?texto=www.google.com&width=300"
```

Respuesta:

- Content-Type: `image/png`
- Body: bytes del PNG

Errores:

- `400` si falta `texto` o `width` no es válido
- `500` si ocurre un error generando el QR

### 3) Generar QR y devolver solo base64 (sin prefijo data:)

**GET** `/qrtexto`

Devuelve un JSON con `codigo64` (base64 del PNG sin `data:image/png;base64,`). Útil cuando necesitas guardar o transportar solo el base64.

Ejemplo:

```text
http://localhost:3002/qrtexto?texto=hola&width=250
```

Respuesta (JSON):

- `codigo64`: base64 del PNG

Errores:

- `400` si falta `texto` o `width` no es válido
- `500` si ocurre un error generando el QR

## Dependencias

- `dotenv`: carga opcional de `.env` en desarrollo
- `express`: servidor HTTP y ruteo
- `qrcode`: generación del QR
