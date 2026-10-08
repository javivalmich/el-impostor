// Comportamiento en la app nativa (Capacitor) simulado con un puente falso: enlaces externos, enlaces para compartir y cabecera del área segura.
const { test, expect } = require('@playwright/test');

const puente = () => {
  window.__abiertos = [];
  window.Capacitor = {
    isNativePlatform: () => true,
    registerPlugin: (n) => (n === 'Browser' ? { open: (o) => { window.__abiertos.push(o.url); return Promise.resolve(); } } : {}),
  };
};

test.beforeEach(async ({ page }) => { await page.addInitScript(puente); });

test('en la app, Privacidad/Términos/Soporte se abren con Browser y URL absoluta', async ({ page }) => {
  await page.goto('/');
  const legal = page.locator('#s-home .legal a');
  await expect(legal).toHaveCount(3);
  for (const t of ['Privacidad', 'Términos', 'Soporte']) await page.locator('#s-home .legal a', { hasText: t }).click();
  expect(await page.evaluate(() => window.__abiertos)).toEqual([
    'https://puntostudio.es/privacidad/',
    'https://puntostudio.es/punto-falso/terminos.html',
    'https://puntostudio.es/soporte/',
  ]);
  expect(page.url()).not.toContain('puntostudio.es');
});

test('en la app, el enlace de sala apunta a la web pública', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => roomLink('ABCDE'))).toBe('https://puntostudio.es/punto-falso/#s=ABCDE');
  expect(await page.evaluate(() => linkFor('XYZ', ['a', 'b'], false))).toMatch(/^https:\/\/puntostudio\.es\/punto-falso\/#j=XYZ~a~b/);
});

test('la cabecera opaca existe y usa el área segura', async ({ page }) => {
  await page.goto('/');
  const c = await page.evaluate(() => { const s = getComputedStyle(document.body, '::before'); return { pos: s.position, bg: s.backgroundColor, z: s.zIndex }; });
  expect(c.pos).toBe('fixed');
  expect(c.bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(+c.z).toBeGreaterThan(0);
});

test('en la web (sin puente), los enlaces legales siguen siendo normales', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8383/');
  expect(await page.evaluate(() => [EN_APP, roomLink('ABCDE').startsWith(location.origin)])).toEqual([false, true]);
  await ctx.close();
});
