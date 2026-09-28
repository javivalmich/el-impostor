// Menú ☰, ranking por jugador y atajo "Victoria del impostor" (modo un solo móvil).
const { test, expect } = require('@playwright/test');
const {
  startSolo, peekCard, voteVoice, waitReveal, afterReveal,
} = require('./helpers');

async function dealAll(page, names) {
  for (const name of names) {
    await expect(page.locator('#shName')).toHaveText(name);
    await page.click('#shGo');
    await peekCard(page);
    await page.click('#scNext');
  }
}

test.describe('Menú del juego (un solo móvil)', () => {
  test('se abre en la tarjeta, tapa la tarjeta destapada, y se cierra con la X y tocando fuera', async ({ page }) => {
    test.setTimeout(30000);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo'); // Ana
    const card = page.locator('#card2');
    // simula que la tarjeta se ha quedado destapada al abrir el menú (p.ej. accesibilidad por teclado)
    await page.evaluate(() => document.getElementById('card2').classList.add('open'));
    await expect(card).toHaveClass(/open/);

    await page.click('#scMenu');
    await expect(page.locator('#menuOverlay')).toHaveClass(/on/);
    await expect(card).not.toHaveClass(/open/); // la tarjeta se tapa al abrir el menú
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Menú');

    // cerrar con la X
    await page.click('#menuSheetEl .xbtn');
    await expect(page.locator('#menuOverlay')).not.toHaveClass(/on/);

    // reabrir y cerrar tocando fuera
    await page.click('#scMenu');
    await expect(page.locator('#menuOverlay')).toHaveClass(/on/);
    await page.click('#menuOverlay', { position: { x: 5, y: 5 } });
    await expect(page.locator('#menuOverlay')).not.toHaveClass(/on/);
  });

  test('se abre en el debate y en la votación, con "Cómo se juega" y "Ranking" navegables', async ({ page }) => {
    test.setTimeout(30000);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    for (const n of ['Ana', 'Beto', 'Cris']) { await page.click('#shGo'); await peekCard(page); await page.click('#scNext'); }
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);

    await page.click('#sdMenu');
    await page.click('[data-a="menuHowto"]');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Cómo se juega');
    await page.click('[data-a="menuBack"]');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Menú');
    await page.click('[data-a="menuRank"]');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('Ranking de la partida');
    // todos a cero: aún no ha terminado ninguna ronda
    await expect(page.locator('#menuSheetEl')).toContainText('Ana');
    await expect(page.locator('#menuSheetEl .rkpts').first()).toHaveText('0 puntos');
    await page.click('[data-a="menuBack"]');
    await page.click('[data-a="menuClose"]');
    await expect(page.locator('#menuOverlay')).not.toHaveClass(/on/);

    await page.click('#sdVote');
    await expect(page.locator('#s-solo-vote')).toHaveClass(/on/);
    await page.click('#svMenu');
    await expect(page.locator('#menuOverlay')).toHaveClass(/on/);
    await page.click('[data-a="menuClose"]');
  });

  test('"Salir de la partida" desde el menú hace lo mismo que "Terminar partida"', async ({ page }) => {
    test.setTimeout(30000);
    await startSolo(page, ['Ana', 'Beto', 'Cris'], { k: 1 });
    await page.click('#shGo');
    await page.click('#scMenu');
    await page.click('[data-a="menuExit"]');
    await expect(page.locator('#menuSheetEl h3')).toHaveText('¿Terminar la partida?');
    await page.click('[data-a="menuExitYes"]');
    await expect(page.locator('#s-home')).toHaveClass(/on/);
  });
});

test.describe('Ranking por jugador', () => {
  test('reparte puntos a inocentes vivos y suma "veces impostor"', async ({ page }) => {
    test.setTimeout(60000);
    const names = ['Ana', 'Beto', 'Cris', 'Dani'];
    await startSolo(page, names, { k: 1, secret: false });
    await dealAll(page, names);
    const impName = await page.evaluate(() => SOLO.names[soloImps()[0] - 1]);
    await voteVoice(page, impName);
    await waitReveal(page);

    // el resultado ya enseña el ranking junto a la palabra y los impostores
    await expect(page.locator('#reveal .box h4').nth(2)).toHaveText('Ranking');
    const rank = await page.evaluate(() => SOLO.rank);
    const impSeat = await page.evaluate(() => String(soloImps()[0]));
    Object.entries(rank).forEach(([seat, e]) => {
      if (seat === impSeat) {
        expect(e.pts).toBe(0);
        expect(e.imp).toBe(1);
        expect(e.w).toBe(0);
      } else {
        expect(e.pts).toBe(1); // inocente vivo cuando ganan los inocentes
        expect(e.w).toBe(1);
      }
    });
    await afterReveal(page);

    // se puede consultar también desde el menú, en cualquier momento
    await expect(page.locator('#s-solo-hand')).toHaveClass(/on/);
    await page.click('#shQuit');
    await page.click('#sqNo'); // seguir jugando, solo quería comprobar que el menú de salida no rompe nada
  });
});

test.describe('Victoria del impostor (atajo)', () => {
  test('en un solo móvil, el botón junto a "Cerrar votación" da la ronda por ganada a los impostores', async ({ page }) => {
    test.setTimeout(30000);
    const names = ['Ana', 'Beto', 'Cris', 'Dani'];
    await startSolo(page, names, { k: 1, secret: false });
    await dealAll(page, names);
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);

    await page.click('#sdVote');
    await expect(page.locator('#svClose')).toBeVisible();
    await expect(page.locator('#svImpWin')).toBeVisible();
    // vale sin que nadie haya votado
    await page.click('#svImpWin');
    await expect(page.locator('#sheet h3')).toHaveText('¿Dar la ronda por ganada a los impostores?');
    await page.click('#iwYes');

    await page.waitForSelector('#reveal.on [data-a="solo-after"]', { timeout: 9000 });
    await expect(page.locator('#reveal .big').first()).toHaveText('¡GANAN LOS IMPOSTORES!');
    expect(await page.evaluate(() => SOLO.res.out)).toBe('imp');
    expect(await page.evaluate(() => SOLO.res.elim)).toBe(null);

    const impSeat = await page.evaluate(() => String(soloImps()[0]));
    const rank = await page.evaluate(() => SOLO.rank);
    expect(rank[impSeat].pts).toBe(2);
    expect(rank[impSeat].w).toBe(1);

    await afterReveal(page);
    await expect(page.locator('#s-solo-hand')).toHaveClass(/on/); // arranca la ronda siguiente
    expect(await page.evaluate(() => SOLO.round)).toBe(2);
  });

  test('en modo de voto secreto no aparece el botón de victoria del impostor', async ({ page }) => {
    test.setTimeout(30000);
    const names = ['Ana', 'Beto', 'Cris'];
    await startSolo(page, names, { k: 1, secret: true });
    await dealAll(page, names);
    await page.click('#sdVote');
    await expect(page.locator('#s-solo-hand')).toHaveClass(/on/);
    await page.click('#shGo'); // primer votante pasa a elegir en secreto
    await expect(page.locator('#s-solo-vote')).toHaveClass(/on/);
    await expect(page.locator('#svClose')).toBeHidden();
    await expect(page.locator('#svImpWinBar')).toBeHidden();
  });
});
