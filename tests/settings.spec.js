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
