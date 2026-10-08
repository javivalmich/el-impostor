// Moderación (Apple 1.2): filtro de nombres y «Reportar» con respaldo si no se abre el correo.
const { test, expect } = require('@playwright/test');

test.describe('Filtro de nombres', () => {
  test('veta insultos aunque estén disfrazados, y deja pasar nombres normales', async ({ page }) => {
    await page.goto('/');
    const ofensivo = (n) => page.evaluate((x) => nombreOfensivo(x), n);
    for (const n of ['Puta', 'p.u.t.a', 'PUUUUTA', 'P0lla', 'Cabrón', 'hijoputa', 'Hijo de puta', 'mierdaaa', 'Gilipollas', 'xX_Nazi_Xx', 'maric0n', 'coño']) {
      expect(await ofensivo(n), n).toBe(true);
    }
    for (const n of ['Ana', 'Beto', 'Computadora', 'Maricarmen', 'Ignazio', 'Nazaret', 'Pola', 'Pol', 'Escuela', 'Dipuntado', 'María José', 'Núñez', 'Cono Sur', 'Pitufo', 'Saturno', '']) {
      expect(await ofensivo(n), n).toBe(false);
    }
  });

  test('en «un solo móvil» no se añade un nombre vetado y se avisa', async ({ page }) => {
    await page.goto('/');
    await page.click('#goCreateOff');
    await page.fill('#nameIn', 'Puta');
    await page.click('#addName');
    await expect(page.locator('#toast')).toHaveText('Ese nombre no está permitido. Elige otro.');
    await expect(page.locator('.names .nm', { hasText: 'Puta' })).toHaveCount(0);
    await page.fill('#nameIn', 'Marta');
    await page.click('#addName');
    await expect(page.locator('.names .nm', { hasText: 'Marta' })).toHaveCount(1);
  });

  test('al crear una sala en línea con un nombre vetado, no se crea', async ({ page }) => {
    await page.goto('/');
    await page.click('#goCreate');
    await page.fill('#myName', 'Cabrón');
    await page.click('#doCreateRoom');
    await expect(page.locator('#createErr')).toHaveText('Ese nombre no está permitido. Elige otro.');
    await expect(page.locator('#doCreateRoom')).toBeEnabled();
  });

  test('al unirse a una sala con un nombre vetado, se rechaza antes de conectar', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => doJoinRoom('ABCDE', 'Mierda'))).toBe('Ese nombre no está permitido. Elige otro.');
  });
});

test.describe('Reportar a un jugador', () => {
  test('si no se abre el correo, se ofrece la dirección y los datos para copiar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.evaluate(() => reportarJugador('pid123', 'Ana'));
    await expect(page.locator('#sheet h3')).toHaveText('No se ha abierto el correo', { timeout: 4000 });
    const txt = await page.locator('#rpTxt').inputValue();
    expect(txt).toContain('Para: soporte@puntostudio.es');
    expect(txt).toContain('Jugador: Ana');
    expect(txt).toContain('Identificador: pid123');
    await expect(page.locator('#rpMsg')).toContainText('He copiado la dirección y los datos');
    const norm = (t) => t.replace(/[ \t]+(\r?\n|$)/g, '\n').replace(/\r/g, '').trim();
    expect(norm(await page.evaluate(() => navigator.clipboard.readText()))).toBe(norm(txt));
    await page.click('#rpNo');
    await expect(page.locator('#overlay')).not.toHaveClass(/on/);
  });

  test('si el correo se abre (la página pasa a segundo plano), no sale ningún aviso', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { reportarJugador('pid123', 'Ana'); window.dispatchEvent(new Event('blur')); });
    await page.waitForTimeout(2000);
    await expect(page.locator('#overlay')).not.toHaveClass(/on/);
  });
});
