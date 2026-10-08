// Interruptores de Sonido y Vibración en el menú ☰: se guardan en el móvil y no dependen de tener cuenta.
const { test, expect } = require('@playwright/test');
const { startSolo, peekCard } = require('./helpers');

test.describe('Ajustes de sonido y vibración', () => {
  test('los interruptores están encendidos por defecto, se pueden apagar y se guardan', async ({ page }) => {
    test.setTimeout(30000);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo');
    await peekCard(page);
    await page.click('#scMenu');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Menú');

    const soundSw = page.locator('#mSoundSw');
    const vibSw = page.locator('#mVibSw');
    await expect(soundSw).toHaveAttribute('aria-checked', 'true');
    await expect(vibSw).toHaveAttribute('aria-checked', 'true');

    await soundSw.click();
    await expect(page.locator('#mSoundSw')).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => localStorage.getItem('impostor-sound'))).toBe('0');

    await page.locator('#mVibSw').click();
    await expect(page.locator('#mVibSw')).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => localStorage.getItem('impostor-vibra'))).toBe('0');

    // persiste tras recargar (recupera la partida guardada del móvil)
    await page.reload();
    expect(await page.evaluate(() => SETTINGS.sound)).toBe(false);
    expect(await page.evaluate(() => SETTINGS.vibra)).toBe(false);
  });

  test('desde la portada, Ajustes guarda tema, sonido y vibración y los comparte con el menú ☰', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await page.click('#goSettings');
    await expect(page.locator('#sheet h3')).toHaveText('Ajustes');
    await expect(page.locator('#sheet')).toContainText('versión');
    await expect(page.locator('#ajTema button[aria-pressed="true"]')).toHaveText('Automático');
    await expect(page.locator('#ajSound')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#ajVibra')).toHaveAttribute('aria-checked', 'true');

    const tema = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.locator('#ajTema button', { hasText: 'Oscuro' }).click();
    await expect.poll(tema).toBe('dark');
    expect(await page.evaluate(() => localStorage.getItem('impostor-theme'))).toBe('"dark"');
    await page.locator('#ajTema button', { hasText: 'Claro' }).click();
    await expect.poll(tema).toBe('light');
    await page.locator('#ajTema button', { hasText: 'Automático' }).click();
    await expect.poll(tema).toBe(null);

    await page.locator('#ajTema button', { hasText: 'Oscuro' }).click();
    await page.locator('#ajSound').click();
    await expect(page.locator('#ajSound')).toHaveAttribute('aria-checked', 'false');
    await page.locator('#ajVibra').click();
    await expect(page.locator('#ajVibra')).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => [localStorage.getItem('impostor-sound'), localStorage.getItem('impostor-vibra')])).toEqual(['0', '0']);

    // persiste al recargar, con el tema ya puesto antes del primer pintado
    await page.reload();
    expect(await tema()).toBe('dark');
    expect(await page.evaluate(() => [SETTINGS.sound, SETTINGS.vibra, SETTINGS.theme])).toEqual([false, false, 'dark']);

    // y el menú ☰ de la partida lee los mismos valores
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo');
    await peekCard(page);
    await page.click('#scMenu');
    await expect(page.locator('#mSoundSw')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#mVibSw')).toHaveAttribute('aria-checked', 'false');
  });

  test('si el dispositivo no puede vibrar, Ajustes y el menú ☰ no enseñan la fila de vibración', async ({ page }) => {
    test.setTimeout(30000);
    await page.addInitScript(() => { Navigator.prototype.vibrate = undefined; });
    await page.goto('/');
    await page.click('#goSettings');
    await expect(page.locator('#sheet h3')).toHaveText('Ajustes');
    await expect(page.locator('#ajSound')).toHaveCount(1);
    await expect(page.locator('#ajVibra')).toHaveCount(0);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo');
    await peekCard(page);
    await page.click('#scMenu');
    await expect(page.locator('#mSoundSw')).toHaveCount(1);
    await expect(page.locator('#mVibSw')).toHaveCount(0);
  });

  test('sin sesión iniciada, el menú no ofrece "Mi cuenta"', async ({ page }) => {
    test.setTimeout(30000);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo');
    await peekCard(page);
    await page.click('#scMenu');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Menú');
    await expect(page.locator('[data-a="menuAcct"]')).toHaveCount(0);
  });
});
