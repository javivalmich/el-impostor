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
      Haptics: { vibrate: () => { window.__golpes.push({ s: 'vibrate', t: performance.now() }); return Promise.resolve(); }, impact: (o) => { window.__golpes.push({ s: o.style, t: performance.now() }); return Promise.resolve(); } },
    },
  };
};

const NOMBRES = ['Ana', 'Beto', 'Cris'];

/* Empieza la partida de un solo móvil y reparte: devuelve lo que vibró al empezar y, por jugador, lo que vibró al abrir su tarjeta */
async function golpesPorJugador(page) {
  await startSolo(page, NOMBRES, { k: 1 });
  await page.waitForTimeout(500); // el patrón de inicio dura ~220 ms
  const inicio = await page.evaluate(() => ({ golpes: window.__golpes, vib: window.__vib }));
  const res = [];
  for (const nombre of NOMBRES) {
    await expect(page.locator('#shName')).toHaveText(nombre);
    await page.click('#shGo');
    await page.evaluate(() => { window.__golpes = []; window.__vib = []; });
    const { isImp } = await peekCard(page);
    await page.waitForTimeout(500);
    const golpes = await page.evaluate(() => window.__golpes);
    const vib = await page.evaluate(() => window.__vib);
    res.push({ nombre, isImp, golpes, vib });
    await page.click('#scNext');
  }
  return { inicio, res };
}

test.describe('Vibración en la app (Haptics)', () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(puenteApp); });

  test('al empezar vibra una vez (3 zumbidos) y abrir la tarjeta no vibra, para impostor e inocentes', async ({ page }) => {
    test.setTimeout(40000);
    const { inicio, res } = await golpesPorJugador(page);
    // [80,60,80] → dos zumbidos reales (Haptics.vibrate), antes de ver ninguna tarjeta
    expect(inicio.golpes.map((g) => g.s)).toEqual(['vibrate', 'vibrate']);
    expect(res.some((r) => r.isImp)).toBe(true);
    expect(res.some((r) => !r.isImp)).toBe(true);
    for (const r of res) expect(r.golpes, r.nombre).toEqual([]);
  });

  test('al abrirse la votación vibra (zumbido); al revelar, impostor y no impostor tienen su patrón', async ({ page }) => {
    test.setTimeout(60000);
    await startSolo(page, NOMBRES, { k: 1 });
    for (const nombre of NOMBRES) { await page.click('#shGo'); await peekCard(page); await page.waitForTimeout(150); await page.click('#scNext'); }
    await page.evaluate(() => { window.__golpes = []; });
    await page.click('#sdVote');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__golpes.map((g) => g.s))).toEqual(['vibrate', 'vibrate']);
    // se vota a un inocente: no es el impostor → un solo zumbido
    const inocente = await page.evaluate(() => SOLO.names.find((_, i) => !soloImps().includes(i + 1)));
    await page.evaluate(() => { window.__golpes = []; });
    await page.locator('#svList .vbtn', { hasText: inocente }).click();
    await page.click('#svClose');
    await page.waitForTimeout(5500);
    expect(await page.evaluate(() => window.__golpes.map((g) => g.s))).toEqual(['vibrate']);
  });

  test('con la vibración apagada en Ajustes no hay ningún golpe', async ({ page }) => {
    test.setTimeout(40000);
    await page.addInitScript(() => localStorage.setItem('impostor-vibra', '0'));
    const { inicio, res } = await golpesPorJugador(page);
    expect(inicio.golpes).toEqual([]);
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

  test('pulsos fuertes: un zumbido por tramo, con sus pausas; los toques pequeños siguen siendo impact', async ({ page }) => {
    await page.goto('/');
    const estilos = async (patron, fuerte) => {
      await page.evaluate(([p, f]) => { window.__golpes = []; vibra(p, f); }, [patron, fuerte]);
      await page.waitForTimeout(700);
      return page.evaluate(() => window.__golpes.map((g) => g.s));
    };
    expect(await estilos([110, 70, 110, 70, 110, 70, 260], true)).toEqual(['vibrate', 'vibrate', 'vibrate', 'vibrate']);
    expect(await estilos([60], true)).toEqual(['vibrate']);
    expect(await estilos([50, 40, 50], false)).toEqual(['LIGHT', 'LIGHT']);
  });

  test('si falla el plugin, no se rompe nada', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/');
    await page.evaluate(() => { window.Capacitor.Plugins.Haptics.impact = () => { throw new Error('boom'); }; window.Capacitor.Plugins.Haptics.vibrate = () => { throw new Error('boom'); }; vibra([90, 60, 90]); vibra([90, 60, 90], true); });
    await page.waitForTimeout(300);
    expect(errores).toEqual([]);
  });
});

test.describe('Vibración en la web (navigator.vibrate)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__vib = []; Navigator.prototype.vibrate = function (p) { window.__vib.push(p); return true; }; });
  });

  test('al empezar vibra el mismo patrón y abrir la tarjeta no vibra', async ({ page }) => {
    test.setTimeout(40000);
    const { inicio, res } = await golpesPorJugador(page);
    expect(inicio.vib).toEqual([[80, 60, 80]]);
    expect(res.some((r) => r.isImp)).toBe(true);
    for (const r of res) expect(r.vib, r.nombre).toEqual([]);
  });
});
