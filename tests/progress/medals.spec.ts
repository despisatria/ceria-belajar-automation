import { expect, test } from '../../src/fixtures';
import { BADGES, TOTAL_BADGES } from '../../src/data/badges';
import { knownBug } from '../../src/data/known-bugs';
import { buildProfile } from '../../src/data/profiles';
import { documentTest } from '../../src/utils/report';
import { seedStorage } from '../../src/utils/storage';

const feature = 'Medals';

test.describe('Progress - Medals', { tag: ['@progress'] }, () => {
  test('should start a new player with no medals', { tag: ['@smoke'] }, async ({ player, homePage }) => {
    await documentTest({
      feature, story: 'Medal collection', severity: 'critical',
      verifies: [
        'A new player sees 0 medals on Home',
        `"Koleksi Medali" lists all ${TOTAL_BADGES} medals, all still locked`,
        `The collection counter reads 0/${TOTAL_BADGES}`,
      ],
    });

    await homePage.goto();

    await test.step('Then Home shows 0 medals', async () => {
      await expect(homePage.medalCount, 'the Home medal counter shows 0').toHaveText('0');
    });

    await test.step(`And the collection lists ${TOTAL_BADGES} locked medals`, async () => {
      const collection = await homePage.openMedalCollection();
      await expect(collection.heading, `the collection is titled for ${player.name}`).toHaveText(`Koleksi Medali ${player.name}`);
      await expect(collection.allItems(), `${TOTAL_BADGES} medals are listed`).toHaveCount(TOTAL_BADGES);
      await expect(collection.earnedItems(), 'no medal is earned').toHaveCount(0);
      await expect(collection.indicator, `the counter reads 0/${TOTAL_BADGES}`).toHaveText(`0/${TOTAL_BADGES}`);
    });
  });

  for (const badge of BADGES) {
    test(`should award only the "${badge.title}" medal (${badge.category}) when its collection is complete`, { tag: ['@regression'] }, async ({ page, homePage }) => {
      await documentTest({
        feature, story: `Earn a medal: ${badge.category}`,
        verifies: [
          `Progress that completes "${badge.title}" lights up exactly that medal in "Koleksi Medali"`,
          'No other medal is lit by the same progress',
          `The collection counter reads 1/${TOTAL_BADGES} and the Home counter reads 1`,
        ],
        knownBug: badge.knownBug && knownBug(badge.knownBug),
      });
      if (badge.knownBug) test.fail(true, knownBug(badge.knownBug));

      const profile = buildProfile({ progress: badge.progress });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
      await homePage.goto();

      await test.step(`Then only "${badge.title}" is lit in the collection`, async () => {
        const collection = await homePage.openMedalCollection();
        await expect(collection.item(badge.id), `"${badge.title}" is earned`).toHaveAttribute('data-earned', 'true');
        await expect(collection.earnedItems(), 'exactly one medal is earned').toHaveCount(1);
        await expect(collection.indicator, `the counter reads 1/${TOTAL_BADGES}`).toHaveText(`1/${TOTAL_BADGES}`);
        await collection.closeButton.click();
      });

      await test.step('And Home counts 1 medal', async () => {
        await expect(homePage.medalCount, 'the Home medal counter shows 1').toHaveText('1');
      });
    });
  }

  test('should not award a medal one item short of the target', { tag: ['@regression'] }, async ({ page, homePage }) => {
    await documentTest({
      feature, story: 'Earn a medal: Alfabet',
      verifies: ['Viewing 25 of the 26 capital letters does not yet award "Huruf Besar" (boundary check)'],
    });

    const profile = buildProfile({ progress: { alfabet: { 'huruf-besar': { viewedLetters: Array.from({ length: 25 }, (_, i) => i) } } } });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    await test.step('Then "Huruf Besar" is still locked', async () => {
      await expect(homePage.medalCount, 'the Home medal counter shows 0').toHaveText('0');
      const collection = await homePage.openMedalCollection();
      await expect(collection.item('alfabet-besar'), '"Huruf Besar" is not earned').toHaveAttribute('data-earned', 'false');
    });
  });

  test('should keep the Home counter in sync with the collection when every medal is earned', { tag: ['@regression'] }, async ({ page, homePage }) => {
    await documentTest({
      feature, story: 'Medal collection',
      verifies: [`With every medal earned, the collection reads ${TOTAL_BADGES}/${TOTAL_BADGES} and the Home counter shows ${TOTAL_BADGES}`],
    });

    const allProgress = BADGES.reduce<Record<string, Record<string, unknown>>>((acc, { progress }) => {
      for (const [key, value] of Object.entries(progress)) {
        acc[key] = { ...(acc[key] ?? {}), ...(value as Record<string, unknown>) };
      }
      return acc;
    }, {});
    const profile = buildProfile({ progress: allProgress });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    await test.step(`Then the collection reads ${TOTAL_BADGES}/${TOTAL_BADGES}`, async () => {
      const collection = await homePage.openMedalCollection();
      await expect(collection.indicator, `the counter reads ${TOTAL_BADGES}/${TOTAL_BADGES}`).toHaveText(`${TOTAL_BADGES}/${TOTAL_BADGES}`);
      await collection.closeButton.click();
    });

    await test.step(`And Home counts ${TOTAL_BADGES} medals`, async () => {
      await expect(homePage.medalCount, `the Home medal counter shows ${TOTAL_BADGES}`).toHaveText(String(TOTAL_BADGES));
    });
  });

  test('should filter the collection by category', { tag: ['@regression'] }, async ({ player, homePage }) => {
    const hijaiyah = BADGES.filter((b) => b.category === 'Hijaiyah');
    await documentTest({
      feature, story: 'Medal collection', severity: 'minor',
      verifies: [`The "Hijaiyah" filter shows only the ${hijaiyah.length} Hijaiyah medals and the counter follows the filter`],
    });

    await homePage.goto();
    const collection = await homePage.openMedalCollection();

    await test.step('When the "Hijaiyah" filter is chosen', async () => {
      await collection.filter('Hijaiyah').click();
    });

    await test.step(`Then only the ${hijaiyah.length} Hijaiyah medals are shown`, async () => {
      await expect(collection.allItems(), `${hijaiyah.length} medals are shown`).toHaveCount(hijaiyah.length);
      await expect(collection.indicator, `the counter reads 0/${hijaiyah.length}`).toHaveText(`0/${hijaiyah.length}`);
      for (const badge of hijaiyah) await expect(collection.item(badge.id), `"${badge.title}" is shown`).toBeVisible();
    });
  });

  test('should close the collection with the close button and the backdrop', { tag: ['@regression'] }, async ({ page, player, homePage }) => {
    await documentTest({
      feature, story: 'Medal collection', severity: 'minor',
      verifies: ['"Koleksi Medali" closes with the × button', 'It also closes by tapping outside the modal'],
    });

    await homePage.goto();

    await test.step('When the collection is closed with the × button', async () => {
      const collection = await homePage.openMedalCollection();
      await collection.closeButton.click();
      await expect(collection.heading, 'the collection is closed').toBeHidden();
    });

    await test.step('And when it is closed by tapping outside', async () => {
      const collection = await homePage.openMedalCollection();
      await page.mouse.click(5, 5);
      await expect(collection.heading, 'the collection is closed').toBeHidden();
    });
  });
});
