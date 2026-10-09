// Walkie apagado por defecto al crear sala en línea, y sesión de audio nativa (ambient / walkie) en la app.
const { test, expect } = require('@playwright/test');

const sw = (page) => page.locator('#remote2Sw');

test.describe('Walkie al crear una partida en grupo', () => {
  test('viene desactivado, se puede activar y se vuelve a desactivar al crear otra partida', async ({ page }) => {
    await page.goto('/');
    await page.click('#goCreate');
    await expect(sw(page)).toHaveAttribute('aria-checked', 'false');
    await sw(page).click();
    await expect(sw(page)).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate(() => rs.remote)).toBe(true); // el anfitrión lo activa: se respeta
    await page.evaluate(() => show('s-home'));
    await page.click('#goCreate');
    await expect(sw(page)).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('Sesión de audio de la app', () => {
  test('el walkie pide playAndRecord al abrirse y ambient al cerrarse; en la web no hace nada', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.addInitScript(() => {
      window.__audio = [];
      window.Capacitor = {
        isNativePlatform: () => true,
        Plugins: {
          Browser: { open: () => Promise.resolve() },
          StatusBar: { setStyle: () => Promise.resolve() },
          SignInWithApple: { authorize: () => Promise.reject(new Error('cancel')) },
          Haptics: { impact: () => Promise.resolve(), vibrate: () => Promise.resolve() },
          AudioSesion: { modo: (o) => { window.__audio.push(o.modo); return Promise.resolve(); } },
        },
      };
    });
    await page.goto('/');
    await page.evaluate(() => { window.__audio = []; audioModo('walkie'); audioModo('ambient'); });
    expect(await page.evaluate(() => window.__audio)).toEqual(['walkie', 'ambient']);
    // si el plugin falla o no existe, no se rompe nada
    await page.evaluate(() => { window.Capacitor.Plugins.AudioSesion.modo = () => { throw new Error('boom'); }; audioModo('walkie'); delete window.Capacitor.Plugins.AudioSesion; audioModo('ambient'); });
    expect(errores).toEqual([]);
  });

  test('WK.abrir / WK.cerrar cambian la sesión de audio', async ({ page }) => {
    await page.addInitScript(() => {
      window.__audio = [];
      window.Capacitor = { isNativePlatform: () => true, Plugins: { AudioSesion: { modo: (o) => { window.__audio.push(o.modo); return Promise.resolve(); } } } };
    });
    await page.goto('/');
    await page.evaluate(() => { window.__audio = []; ROOM = { code: 'ABCDE', name: 'Ana', creator: true, remote: true, joined: Date.now() }; WK.abrir(); WK.cerrar(); });
    expect(await page.evaluate(() => window.__audio)).toEqual(['walkie', 'ambient']);
  });
});
