// Borrado de cuenta con Apple (sin respaldo que no revoque) y aviso si falla el canje del código de Apple al entrar.
const { test, expect } = require('@playwright/test');

const puenteApp = () => {
  window.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Browser: { open: () => Promise.resolve() },
      StatusBar: { setStyle: () => Promise.resolve() },
      SignInWithApple: {
        authorize: () => Promise.resolve({ response: { identityToken: 'tok', authorizationCode: 'cod' } }),
      },
    },
  };
};

/* Sustituye a Supabase: eliminar-cuenta responde lo que diga window.__elim y se cuentan las llamadas */
const falsoSupabase = () => {
  window.__rpc = 0; window.__invocaciones = []; window.__elim = { data: null, error: new Error('caído') };
  window.__canje = { data: { ok: true }, error: null };
  const fake = {
    functions: {
      invoke: async (n) => { window.__invocaciones.push(n); return n === 'eliminar-cuenta' ? window.__elim : window.__canje; },
    },
    rpc: async () => { window.__rpc++; return { error: null }; },
    auth: {
      signOut: async () => ({}),
      signInWithIdToken: async () => ({ error: null }),
      signInWithPassword: async () => ({ error: null }),
    },
  };
  loadSB = async () => fake; // eslint-disable-line no-global-assign
};

test.beforeEach(async ({ page }) => { await page.addInitScript(puenteApp); });

async function abreBorrado(page, provider) {
  await page.goto('/');
  await page.evaluate(falsoSupabase);
  await page.evaluate((p) => {
    USER = { id: 'u1', email: 'a@b.c', app_metadata: { provider: p } };
    PERFIL = { name: 'Ana', look: limpiaLook({}) };
    deleteAccountConfirmSheet();
  }, provider);
}

test.describe('Eliminar cuenta', () => {
  test('con Apple, si falla eliminar-cuenta no se usa el respaldo: error y Reintentar', async ({ page }) => {
    await abreBorrado(page, 'apple');
    await page.fill('#delWord', 'BORRAR');
    await page.click('#delFinal');
    await expect(page.locator('#delErr')).toContainText('revocar tu acceso con Apple');
    await expect(page.locator('#delFinal')).toHaveText('Reintentar');
    await expect(page.locator('#delFinal')).toBeEnabled();
    expect(await page.evaluate(() => window.__rpc)).toBe(0);

    // al reintentar, con el servidor ya bien, se borra
    await page.evaluate(() => { window.__elim = { data: { ok: true }, error: null }; });
    await page.click('#delFinal');
    await expect(page.locator('#toast')).toHaveText('Cuenta eliminada');
    expect(await page.evaluate(() => [window.__rpc, window.__invocaciones.filter((n) => n === 'eliminar-cuenta').length])).toEqual([0, 2]);
  });

  test('con otro proveedor, si falla eliminar-cuenta sigue valiendo el respaldo', async ({ page }) => {
    await abreBorrado(page, 'google');
    await page.fill('#delWord', 'BORRAR');
    await page.click('#delFinal');
    await expect(page.locator('#toast')).toHaveText('Cuenta eliminada');
    expect(await page.evaluate(() => window.__rpc)).toBe(1);
  });
});

test.describe('Entrar con Apple (app)', () => {
  const entra = async (page, canje) => {
    await page.goto('/');
    await page.evaluate(falsoSupabase);
    await page.evaluate((c) => { window.__canje = c; }, canje);
    await page.evaluate(() => { entraConAppleNativo(); });
  };

  test('si el servidor no canjea el código de Apple, avisa al usuario', async ({ page }) => {
    await entra(page, { data: null, error: new Error('503') });
    await expect(page.locator('#sheet h3')).toHaveText('Has entrado, con un aviso');
    await expect(page.locator('#sheet')).toContainText('revocando también tu acceso con Apple');
  });

  test('si el canje va bien, no hay aviso', async ({ page }) => {
    await entra(page, { data: { ok: true }, error: null });
    await expect(page.locator('#toast')).toHaveText('Sesión iniciada');
    await page.waitForTimeout(400);
    await expect(page.locator('#overlay')).not.toHaveClass(/on/);
    expect(await page.evaluate(() => window.__invocaciones)).toEqual(['apple-canjear-codigo']);
  });
});
