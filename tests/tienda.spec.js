// Genera las capturas para las fichas de Google Play y App Store: tienda/capturas/<destino>/NN-nombre.png
// Uso: npx playwright test tests/tienda.spec.js   (el lobby en línea usa Supabase Realtime real; si no hay red, se omite)
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { startSolo } = require('./helpers');

const DESTINOS = [
  { dir: 'google-1080x1920', width: 360, height: 640, scale: 3 },
  { dir: 'apple-6.9-1320x2868', width: 440, height: 956, scale: 3 },
  { dir: 'apple-6.5-1284x2778', width: 428, height: 926, scale: 3 },
  { dir: 'apple-5.5-1242x2208', width: 414, height: 736, scale: 3 },
];
const NAMES = ['Ana', 'Luis', 'Marta', 'Pablo'];

async function pressCard(page) {
  const box = await page.locator('#card2').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
}

for (const d of DESTINOS) {
  test.describe(`Tienda ${d.dir}`, () => {
    test.use({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: d.scale, isMobile: true, hasTouch: false, colorScheme: 'dark' });

    test(`capturas ${d.dir}`, async ({ page }) => {
      test.setTimeout(90000);
      const out = path.join(__dirname, '..', 'tienda', 'capturas', d.dir);
      fs.mkdirSync(out, { recursive: true });
      const shot = async (n) => {
        // en las capturas de la tienda no se ve ningún correo
        const c = await page.evaluate(() => { const t = document.body.innerText + ' ' + [...document.querySelectorAll('input,textarea')].map((i) => i.value).join(' '); const m = t.match(/\S+@\S+/); return m && m[0]; });
        if (c) throw new Error('La captura ' + n + ' enseña un correo: ' + c);
        await page.screenshot({ path: path.join(out, n + '.png') });
      };

      await page.goto('/');
      await page.waitForSelector('#s-home.on');
      await page.evaluate(() => document.fonts.ready);
      await shot('01-portada');

      await page.click('#goCreate');
      await page.fill('#myName', 'Ana');
      await shot('02-crear-partida');

      // sala de espera en línea (necesita red)
      try {
        await page.click('#doCreateRoom');
        await page.waitForSelector('#s-lobby.on', { timeout: 8000 });
        await page.waitForSelector('#lbQr svg', { timeout: 4000 });
        await shot('03-sala-de-espera');
      } catch (e) { console.warn('sala en línea omitida:', e.message); }

      // limpia el estado de la sala y empieza desde cero
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.goto('about:blank');

      // partida con un solo móvil
      await startSolo(page, NAMES, { k: 1, secret: false });
      await page.evaluate(() => {
        window.roundInfo = () => ({ imps: [4], starter: 1, word: { w: 'Parque de atracciones', h: 'cola', c: 'Lugares' } });
      });
      await page.click('#shGo');
      await pressCard(page);
      await shot('04-tu-palabra');
      await page.mouse.up();
      await page.click('#scNext');
      for (let i = 0; i < 2; i++) { await page.click('#shGo'); await pressCard(page); await page.mouse.up(); await page.click('#scNext'); }
      await page.click('#shGo');
      await pressCard(page);
      await shot('05-eres-el-impostor');
      await page.mouse.up();
      await page.click('#scNext');
      await shot('06-debate');
      await page.click('#sdVote');
      await shot('07-votacion');
      await page.locator('#svList .vbtn', { hasText: 'Pablo' }).click();
      await page.click('#svClose');
      await page.waitForSelector('#reveal.on [data-a="solo-after"]', { timeout: 9000 });
      await page.waitForTimeout(2500); // deja acabar la animación de revelación
      await shot('08-resultado');
    });
  });
}
