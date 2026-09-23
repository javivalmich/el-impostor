const { test, expect } = require('@playwright/test');
const {
  startSolo, peekCard, voteVoice, waitReveal, afterReveal,
} = require('./helpers');

test.describe('Un solo móvil', () => {
  test('partida completa de 4 jugadores con voto en voz alta', async ({ page }) => {
    test.setTimeout(60000);
    const names = ['Ana', 'Beto', 'Cris', 'Dani'];
    await startSolo(page, names, { k: 1, secret: false });

    // Reparto: nunca debe quedar visible la palabra ni el rojo del jugador anterior
    for (const name of names) {
      await expect(page.locator('#shName')).toHaveText(name);
      await page.click('#shGo');
      await expect(page.locator('#scWho')).toContainText(name);
      const redBeforeHold = await page.evaluate(() => document.body.classList.contains('red'));
      expect(redBeforeHold).toBe(false); // cerrada por defecto, antes de mantener pulsado
      await peekCard(page);
      // tras soltar, la tarjeta se cierra y el rojo desaparece
      await expect(page.locator('#card2')).not.toHaveClass(/open/);
      await expect(page.locator('body')).not.toHaveClass(/red/);
      await page.click('#scNext');
      // la pantalla neutra no debe enseñar nada del jugador anterior
      if (name !== names[names.length - 1]) {
        await expect(page.locator('body')).not.toHaveClass(/red/);
      }
    }

    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);
    const impName = await page.evaluate(() => SOLO.names[soloImps()[0] - 1]);

    await voteVoice(page, impName);
    await waitReveal(page);
    await expect(page.locator('#reveal')).toHaveClass(/red/);
    await expect(page.locator('#reveal .box h4').first()).toHaveText('Votos');
    await expect(page.locator('#reveal .box h4').nth(1)).toHaveText('Ganan los inocentes');
    await afterReveal(page);

    // "Siguiente ronda" vuelve al reparto (todos vivos); se puede terminar la partida desde ahí
    await expect(page.locator('#s-solo-hand')).toHaveClass(/on/);
    await page.click('#shQuit');
    await page.click('#sqYes');
    await expect(page.locator('#s-home')).toHaveClass(/on/);
  });

  test('partida de 5 jugadores, voto secreto y 2 impostores: inocente eliminado, impostor pillado, empate y victoria de los impostores', async ({ page }) => {
    test.setTimeout(120000);
    const names = ['Ana', 'Beto', 'Cris', 'Dani', 'Eva'];
    await startSolo(page, names, { k: 2, secret: true });

    for (const name of names) {
      await expect(page.locator('#shName')).toHaveText(name);
      await page.click('#shGo');
      await peekCard(page);
      await page.click('#scNext');
    }
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);

    const { impNames, innNames } = await page.evaluate(() => {
      const imps = soloImps();
      return {
        impNames: imps.map((s) => SOLO.names[s - 1]),
        innNames: SOLO.names.filter((_, i) => !imps.includes(i + 1)),
      };
    });
    const [imp1, imp2] = impNames;
    const [inn1, inn2, inn3] = innNames;

    // Vote A: empate provocado entre un impostor (imp1) y un inocente (inn1).
    // Nadie vota por sí mismo: imp2 e inn2 votan a inn1; inn1 e inn3 votan a imp1; imp1 vota a inn2 (voto suelto).
    await page.click('#sdVote');
    await voteSecretWithMap(page, names, {
      [imp2]: inn1, [inn2]: inn1, [inn1]: imp1, [inn3]: imp1, [imp1]: inn2,
    });
    await waitReveal(page);
    expect(await page.evaluate(() => SOLO.res.out)).toBe('tie');
    await afterReveal(page); // repite la votación solo entre los empatados (imp1 e inn1)

    // Repetición: todos (menos imp1) votan a imp1 -> se pilla al impostor, la partida continúa
    await voteSecretWithMap(page, names, {
      [imp2]: imp1, [inn1]: imp1, [inn2]: imp1, [inn3]: imp1, [imp1]: inn1,
    });
    await waitReveal(page);
    expect(await page.evaluate(() => SOLO.names[SOLO.res.elim - 1])).toBe(imp1);
    expect(await page.evaluate(() => SOLO.res.out)).toBe('cont');
    await afterReveal(page);

    // Vote B: con imp1 fuera, eliminan a un inocente (inn1); todavía queda un impostor con vida
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);
    const aliveB = names.filter((n) => n !== imp1); // en el mismo orden de asientos que llama el móvil
    await page.click('#sdVote');
    await voteSecretWithMap(page, aliveB, {
      [imp2]: inn1, [inn2]: inn1, [inn3]: inn1, [inn1]: inn2,
    });
    await waitReveal(page);
    expect(await page.evaluate(() => SOLO.names[SOLO.res.elim - 1])).toBe(inn1);
    expect(await page.evaluate(() => SOLO.res.out)).toBe('cont');
    await afterReveal(page);

    // Vote C: eliminan al último inocente necesario para que ganen los impostores
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);
    const aliveC = aliveB.filter((n) => n !== inn1);
    await page.click('#sdVote');
    await voteSecretWithMap(page, aliveC, {
      [imp2]: inn2, [inn3]: inn2, [inn2]: inn3,
    });
    await waitReveal(page);
    expect(await page.evaluate(() => SOLO.res.out)).toBe('imp');
    await expect(page.locator('#reveal .box h4').nth(1)).toHaveText('Ganan los impostores');
  });

  test('volver a ver mi palabra y recarga a mitad de partida', async ({ page }) => {
    test.setTimeout(60000);
    const names = ['Ana', 'Beto', 'Cris'];
    await startSolo(page, names, { k: 1, secret: false });
    for (const name of names) {
      await page.click('#shGo');
      await peekCard(page);
      await page.click('#scNext');
    }
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);

    // Volver a ver mi palabra: elegir nombre, confirmar y ver la tarjeta otra vez
    await page.click('#sdPeek');
    await expect(page.locator('#s-pick')).toHaveClass(/on/);
    await page.locator('#grid button', { hasText: 'Beto' }).click();
    await expect(page.locator('#sheet h3')).toHaveText('¿Eres Beto?');
    await page.click('#pkYes');
    await expect(page.locator('#s-solo-card')).toHaveClass(/on/);
    await expect(page.locator('#scWho')).toContainText('Beto');
    await page.click('#scNext');
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/);

    // Recarga a mitad de partida: debe recuperar nombres, ronda y fase
    await page.reload();
    await expect(page.locator('#s-solo-debate')).toHaveClass(/on/, { timeout: 5000 });
    const state = await page.evaluate(() => ({ names: SOLO.names, round: SOLO.round, phase: SOLO.phase, dead: SOLO.dead }));
    expect(state.names).toEqual(names);
    expect(state.round).toBe(1);
    expect(state.phase).toBe('debate');
    expect(state.dead).toEqual([]);
  });

  test('sin peticiones de red durante la partida', async ({ page }) => {
    test.setTimeout(60000);
    const names = ['Ana', 'Beto', 'Cris'];
    await startSolo(page, names, { k: 1, secret: false });

    const requests = [];
    page.on('request', (r) => requests.push(r.url()));

    for (const name of names) {
      await page.click('#shGo');
      await peekCard(page);
      await page.click('#scNext');
    }
    const impName = await page.evaluate(() => SOLO.names[soloImps()[0] - 1]);
    await voteVoice(page, impName);
    await waitReveal(page);
    await afterReveal(page);

    expect(requests).toEqual([]);
  });
});

// Simula el paso del móvil de mano en mano para la votación secreta, usando la interfaz real.
async function voteSecretWithMap(page, order, choices) {
  for (const voter of order) {
    await expect(page.locator('#shName')).toHaveText(voter, { timeout: 5000 });
    await page.click('#shGo');
    await page.locator('#svList .vbtn', { hasText: choices[voter] }).click();
  }
}
