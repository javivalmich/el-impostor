// Vibración: en la app, motor háptico (Capacitor.Plugins.Haptics); en la web, navigator.vibrate.
// Anti-chivato: abrir la tarjeta y revelar deben notarse exactamente igual para el impostor y para el resto.
const { test, expect } = require('@playwright/test');
const { startSolo, peekCard } = require('./helpers');

/* Puente de la app con Haptics simulado: anota cada golpe con su estilo y su instante */
const puenteApp = () => {
  window.__golpes = [];
  window.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Browser: { open: () => Promise.resolve() },
      StatusBar: { setStyle: () => Promise.resolve() },
      SignInWithApple: { authorize: () => Promise.reject(new Error('cancel')) },
      Haptics: { impact: (o) => { window.__golpes.push({ s: o.style, t: performance.now() }); return Promise.resolve(); } },
    },
  };
};

const NOMBRES = ['Ana', 'Beto', 'Cris'];

/* Reparte la partida de un solo móvil: cada jugador mantiene pulsada su tarjeta y se recogen los golpes que notó */
async function golpesPorJugador(page) {
  await startSolo(page, NOMBRES, { k: 1 });
  const res = [];
  for (const nombre of NOMBRES) {
    await expect(page.locator('#shName')).toHaveText(nombre);
    await page.click('#shGo');
    await page.evaluate(() => { window.__golpes = []; window.__vib = []; });
    const { isImp } = await peekCard(page);
    await page.waitForTimeout(500); // el patrón dura ~300 ms
    const golpes = await page.evaluate(() => window.__golpes);
    const vib = await page.evaluate(() => window.__vib);
    res.push({ nombre, isImp, golpes, vib });
    await page.click('#scNext');
  }
  return res;
}

test.describe('Vibración en la app (Haptics)', () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(puenteApp); });

  test('al destapar la tarjeta, impostor e inocentes notan exactamente lo mismo', async ({ page }) => {
    test.setTimeout(40000);
    const res = await golpesPorJugador(page);
    expect(res.some((r) => r.isImp)).toBe(true);
    expect(res.some((r) => !r.isImp)).toBe(true);
    for (const r of res) {
      // [90,60,90,60,220] → medio, medio, fuerte
      expect(r.golpes.map((g) => g.s)).toEqual(['MEDIUM', 'MEDIUM', 'HEAVY']);
    }
    // y con los mismos tiempos (±80 ms) entre el primer golpe y los siguientes
    const rel = (r) => r.golpes.map((g) => g.t - r.golpes[0].t);
    const ref = rel(res[0]);
    for (const r of res) rel(r).forEach((t, i) => expect(Math.abs(t - ref[i])).toBeLessThan(80));
  });

  test('con la vibración apagada en Ajustes no hay ningún golpe', async ({ page }) => {
    test.setTimeout(40000);
    await page.addInitScript(() => localStorage.setItem('impostor-vibra', '0'));
    const res = await golpesPorJugador(page);
    for (const r of res) expect(r.golpes).toEqual([]);
  });

  test('conversión de patrones a golpes: suave, medio y fuerte, con sus pausas', async ({ page }) => {
    await page.goto('/');
    const estilos = async (patron) => {
      await page.evaluate((p) => { window.__golpes = []; vibra(p); }, patron);
      await page.waitForTimeout(700); // el patrón más largo dura ~540 ms
      return page.evaluate(() => window.__golpes.map((g) => g.s));
    };
    expect(await estilos(50)).toEqual(['LIGHT']);
    expect(await estilos([50, 40, 50])).toEqual(['LIGHT', 'LIGHT']);
    expect(await estilos([110, 70, 110, 70, 110, 70, 260])).toEqual(['MEDIUM', 'MEDIUM', 'MEDIUM', 'HEAVY']);
  });

  test('si falla el plugin, no se rompe nada', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/');
    await page.evaluate(() => { window.Capacitor.Plugins.Haptics.impact = () => { throw new Error('boom'); }; vibra([90, 60, 90]); });
    await page.waitForTimeout(300);
    expect(errores).toEqual([]);
  });
});

test.describe('Vibración en la web (navigator.vibrate)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__vib = []; Navigator.prototype.vibrate = function (p) { window.__vib.push(p); return true; }; });
  });

  test('al destapar la tarjeta, todos reciben el mismo patrón', async ({ page }) => {
    test.setTimeout(40000);
    const res = await golpesPorJugador(page);
    expect(res.some((r) => r.isImp)).toBe(true);
    for (const r of res) expect(r.vib).toEqual([[90, 60, 90, 60, 220]]);
  });
});
