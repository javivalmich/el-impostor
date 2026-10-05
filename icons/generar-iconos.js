/* Redibuja el icono de Punto Falso como vector (a partir de las formas del logo) y lo exporta a PNG nítido
   en cualquier tamaño: no se reescala ningún original pequeño.
   Uso: node icons/generar-iconos.js   (usa el Playwright del proyecto)
   Salida: icons/icono.svg, icono-maskable.svg y los PNG (192, 512, 1024, 180 apple-touch, maskable 192/512/1024). */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const FONDO = '#0b0b0d';

/* Lienzo de 1024; el logo es un círculo de radio 480 centrado. `escala` lo encoge dentro del lienzo
   (más margen para el icono «maskable», cuya zona segura es un círculo del 80 % del lado). */
function svg(escala, soloLogo = false) {
  const t = `translate(${512 - 512 * escala} ${512 - 512 * escala}) scale(${escala})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" ${soloLogo ? 'viewBox="32 32 960 960" width="960" height="960"' : 'viewBox="0 0 1024 1024" width="1024" height="1024"'}>
  <defs>
    <radialGradient id="campo" cx="42%" cy="34%" r="80%"><stop offset="0" stop-color="#FF2D26"/><stop offset=".55" stop-color="#E0120F"/><stop offset="1" stop-color="#A30806"/></radialGradient>
    <linearGradient id="aro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF2A24"/><stop offset="1" stop-color="#C80D0A"/></linearGradient>
    <radialGradient id="casco" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EDEDF1"/><stop offset="1" stop-color="#B9B9C4"/></radialGradient>
    <linearGradient id="sudadera" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2C2C34"/><stop offset="1" stop-color="#0F0F13"/></linearGradient>
    <linearGradient id="mochila" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3A44"/><stop offset="1" stop-color="#1B1B21"/></linearGradient>
    <linearGradient id="hoja" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#B80806"/><stop offset=".6" stop-color="#F0140F"/><stop offset="1" stop-color="#FF4A42"/></linearGradient>
    <filter id="brillo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
    <clipPath id="interior"><circle cx="512" cy="512" r="404"/></clipPath>
  </defs>
  ${soloLogo ? '' : `<rect width="1024" height="1024" fill="${FONDO}"/>`}
  <g transform="${soloLogo ? '' : t}">
    <circle cx="512" cy="512" r="480" fill="#08080A"/>
    <circle cx="512" cy="512" r="456" fill="url(#aro)"/>
    <circle cx="512" cy="512" r="418" fill="none" stroke="#3A0606" stroke-width="20"/>
    <circle cx="512" cy="512" r="404" fill="url(#campo)"/>
    <g clip-path="url(#interior)">
      <!-- mochila -->
      <path d="M150 560 q30 -70 120 -74 l60 20 l10 330 l-170 30 q-40 -140 -20 -306 z" fill="url(#mochila)" stroke="#0A0A0C" stroke-width="10" stroke-linejoin="round"/>
      <path d="M190 590 l90 -40" stroke="#8C8C98" stroke-width="12" stroke-linecap="round" opacity=".7"/>
      <!-- sudadera -->
      <path d="M170 920 q-10 -250 120 -340 q120 -70 250 -20 q130 60 190 200 l40 180 z" fill="url(#sudadera)" stroke="#08080A" stroke-width="12" stroke-linejoin="round"/>
      <path d="M300 640 q130 -90 300 -30" fill="none" stroke="#5A5A66" stroke-width="8" stroke-linecap="round" opacity=".7"/>
      <!-- cordones de la capucha -->
      <path d="M548 640 v118 M600 646 v104" stroke="#E4E4EA" stroke-width="13" stroke-linecap="round"/>
      <!-- casco -->
      <ellipse cx="546" cy="372" rx="292" ry="278" fill="url(#casco)" stroke="#08080A" stroke-width="14"/>
      <path d="M300 540 q246 150 520 -40 q-30 120 -150 180 q-230 60 -370 -140 z" fill="#000" opacity=".12"/>
      <!-- visor -->
      <rect x="338" y="214" width="438" height="318" rx="150" fill="#08080B" stroke="#1B1B22" stroke-width="10"/>
      <path d="M372 296 q40 -64 130 -74" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="12" stroke-linecap="round"/>
      <path d="M690 252 q50 24 66 82" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="12" stroke-linecap="round"/>
      <!-- ojos con brillo -->
      <ellipse cx="470" cy="378" rx="30" ry="62" fill="#fff" filter="url(#brillo)" opacity=".9"/><ellipse cx="636" cy="378" rx="30" ry="62" fill="#fff" filter="url(#brillo)" opacity=".9"/>
      <ellipse cx="470" cy="378" rx="30" ry="62" fill="#fff"/><ellipse cx="636" cy="378" rx="30" ry="62" fill="#fff"/>
      <!-- cuchillo -->
      <path d="M960 484 C 880 556 760 640 628 700 L 548 770 L 596 846 C 740 812 890 676 960 484 Z" fill="url(#hoja)" stroke="#08080A" stroke-width="14" stroke-linejoin="round"/>
      <path d="M912 540 C 840 620 750 690 640 738" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="13" stroke-linecap="round"/>
      <!-- mano -->
      <path d="M470 770 q40 -50 112 -28 q50 24 28 84 q-30 56 -112 54 q-70 -10 -28 -110 z" fill="#17171C" stroke="#08080A" stroke-width="12" stroke-linejoin="round"/>
      <path d="M492 800 q36 -22 76 -8" fill="none" stroke="#5A5A66" stroke-width="8" stroke-linecap="round" opacity=".7"/>
    </g>
  </g>
</svg>`;
}

(async () => {
  const ANY = 0.92, MASK = 0.7; // diámetro del logo: ~88 % en «any» y ~67 % en «maskable» (la zona segura es el 80 %)
  fs.writeFileSync(path.join(OUT, 'icono.svg'), svg(ANY));
  fs.writeFileSync(path.join(OUT, 'icono-maskable.svg'), svg(MASK));
  // logo suelto (sin fondo, recortado al círculo) para usarlo dentro de la app; version compacta lista para incrustar
  const compacto = svg(1, true).replace(/\n\s*/g, '').replace(/>\s+</g, '><');
  fs.writeFileSync(path.join(OUT, 'logo.svg'), compacto);
  const br = await chromium.launch();
  const page = await br.newPage({ deviceScaleFactor: 1 });
  const render = async (s, size, file) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<body style="margin:0;background:${FONDO}"><div style="width:${size}px;height:${size}px">${s.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}</div></body>`);
    await page.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: size, height: size } });
  };
  const any = svg(ANY), mask = svg(MASK);
  await render(any, 1024, 'icon-1024.png');
  await render(any, 512, 'icon-512.png');
  await render(any, 192, 'icon-192.png');
  await render(any, 180, 'apple-touch-icon.png');
  await render(mask, 1024, 'icon-maskable-1024.png');
  await render(mask, 512, 'icon-maskable-512.png');
  await render(mask, 192, 'icon-maskable-192.png');
  // hoja de comprobación de recortes (no se versiona)
  const prev = path.join(OUT, 'vista-previa-recortes.png');
  const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
  await page.setViewportSize({ width: 1180, height: 640 });
  await page.setContent(`<body style="margin:0;background:#888;font:14px system-ui;color:#fff"><div style="display:flex;gap:20px;padding:20px;flex-wrap:wrap">
    ${[['any · círculo', 'icon-512.png', '50%'], ['any · cuadrado redondeado', 'icon-512.png', '22.4%'], ['maskable · círculo', 'icon-maskable-512.png', '50%'], ['maskable · cuadrado redondeado', 'icon-maskable-512.png', '22.4%']]
      .map(([t, f, r]) => `<div style="text-align:center"><img src="${b64(f)}" width="256" height="256" style="border-radius:${r}"><br>${t}</div>`).join('')}
    ${[['180', 'apple-touch-icon.png', 180], ['96', 'icon-192.png', 96], ['48', 'icon-192.png', 48]].map(([t, f, w]) => `<div style="text-align:center"><img src="${b64(f)}" width="${w}" height="${w}" style="border-radius:22.4%"><br>${t}px</div>`).join('')}
  </div></body>`);
  await page.screenshot({ path: prev });
  await br.close();
  console.log('listo');
})().catch((e) => { console.error(e); process.exit(1); });
