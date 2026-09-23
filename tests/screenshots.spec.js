// Capturas de las pantallas del modo "un solo móvil" en los tamaños pedidos, con un nombre de
// 14 caracteres y una palabra larga del propio banco, para comprobar que nada se corta.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { startSolo, peekCard } = require('./helpers');

async function pressCard(page, sel = '#card2') {
  const box = await page.locator(sel).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(120);
}

const SIZES = [
  { name: '320x568', width: 320, height: 568 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
];
const NAMES = ['Maximilianoooo', 'Ana', 'Cristopherson', 'Beto'];
const OUT = path.join(__dirname, '..', 'test-results', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

for (const size of SIZES) {
  test.describe(`Capturas ${size.name}`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test(`pantallas del modo un solo móvil en ${size.name}`, async ({ page }) => {
      test.setTimeout(60000);
      await startSolo(page, NAMES, { k: 1, secret: false });
      // fuerza la palabra larga real del banco para forzar el peor caso
      await page.evaluate(() => {
        window.roundInfo = () => ({ imps: [4], starter: 1, word: { w: 'Parque de atracciones', h: 'cola', c: 'Lugares' } });
      });

      await page.screenshot({ path: path.join(OUT, `${size.name}-01-handoff.png`) });

      await page.click('#shGo');
      await pressCard(page);
      await page.screenshot({ path: path.join(OUT, `${size.name}-02-tarjeta-palabra.png`) });
      await page.mouse.up();
      await page.click('#scNext');

      // avanza hasta el impostor (Beto, slot 4)
      await page.click('#shGo'); await peekCard(page); await page.click('#scNext'); // Ana
      await page.click('#shGo'); await peekCard(page); await page.click('#scNext'); // Cristopherson
      await page.click('#shGo');
      await pressCard(page);
      await page.screenshot({ path: path.join(OUT, `${size.name}-03-tarjeta-impostor.png`) });
      await page.mouse.up();
      await page.click('#scNext');

      await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);
      await page.screenshot({ path: path.join(OUT, `${size.name}-04-debate.png`) });

      await page.click('#sdVote');
      await page.screenshot({ path: path.join(OUT, `${size.name}-05-votacion.png`) });

      await page.locator('#svList .vbtn', { hasText: 'Beto' }).click();
      await page.click('#svClose');
      await page.waitForSelector('#reveal.on [data-a="solo-after"]', { timeout: 9000 });
      await page.screenshot({ path: path.join(OUT, `${size.name}-06-revelacion.png`), fullPage: true });
    });
  });
}
