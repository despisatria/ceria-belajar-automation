import { expect, test } from '../../src/fixtures';
import { BADGES, TOTAL_BADGES } from '../../src/data/badges';
import { knownBug } from '../../src/data/known-bugs';
import { buildProfile } from '../../src/data/profiles';
import { seedStorage } from '../../src/utils/storage';

test.describe('Progress - Medals', { tag: ['@progress'] }, () => {
  test('should start a new player with no medals', { tag: ['@smoke'] }, async ({ player, homePage }) => {
    await homePage.goto();
    await expect(homePage.medalCount).toHaveText('0');

    const collection = await homePage.openMedalCollection();
    await expect(collection.heading).toHaveText(`Koleksi Medali ${player.name}`);
    await expect(collection.allItems()).toHaveCount(TOTAL_BADGES);
    await expect(collection.earnedItems()).toHaveCount(0);
    await expect(collection.indicator).toHaveText(`0/${TOTAL_BADGES}`);
  });

  for (const badge of BADGES) {
    test(`should award only the "${badge.title}" medal (${badge.category}) when its collection is complete`, { tag: ['@regression'] }, async ({ page, homePage }) => {
      if (badge.knownBug) test.fail(true, knownBug(badge.knownBug));

      const profile = buildProfile({ progress: badge.progress });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
      await homePage.goto();

      const collection = await homePage.openMedalCollection();
      await expect(collection.item(badge.id)).toHaveAttribute('data-earned', 'true');
      await expect(collection.earnedItems()).toHaveCount(1);
      await expect(collection.indicator).toHaveText(`1/${TOTAL_BADGES}`);

      await collection.closeButton.click();
      await expect(homePage.medalCount).toHaveText('1');
    });
  }

  test('should not award a medal one item short of the target', { tag: ['@regression'] }, async ({ page, homePage }) => {
    const profile = buildProfile({ progress: { alfabet: { 'huruf-besar': { viewedLetters: Array.from({ length: 25 }, (_, i) => i) } } } });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    await expect(homePage.medalCount).toHaveText('0');
    const collection = await homePage.openMedalCollection();
    await expect(collection.item('alfabet-besar')).toHaveAttribute('data-earned', 'false');
  });

  test('should keep the Home counter in sync with the collection when every medal is earned', { tag: ['@regression'] }, async ({ page, homePage }) => {
    test.fail(true, knownBug('BUG-002'));

    const allProgress = BADGES.reduce<Record<string, Record<string, unknown>>>((acc, { progress }) => {
      for (const [key, value] of Object.entries(progress)) {
        acc[key] = { ...(acc[key] ?? {}), ...(value as Record<string, unknown>) };
      }
      return acc;
    }, {});
    const profile = buildProfile({ progress: allProgress });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    const collection = await homePage.openMedalCollection();
    await expect(collection.indicator).toHaveText(`${TOTAL_BADGES}/${TOTAL_BADGES}`);
    await collection.closeButton.click();
    await expect(homePage.medalCount).toHaveText(String(TOTAL_BADGES));
  });

  test('should filter the collection by category', { tag: ['@regression'] }, async ({ player, homePage }) => {
    await homePage.goto();
    const collection = await homePage.openMedalCollection();

    await collection.filter('Hijaiyah').click();

    const hijaiyah = BADGES.filter((b) => b.category === 'Hijaiyah');
    await expect(collection.allItems()).toHaveCount(hijaiyah.length);
    await expect(collection.indicator).toHaveText(`0/${hijaiyah.length}`);
    for (const badge of hijaiyah) await expect(collection.item(badge.id)).toBeVisible();
  });

  test('should close the collection with the close button and the backdrop', { tag: ['@regression'] }, async ({ page, player, homePage }) => {
    await homePage.goto();

    const collection = await homePage.openMedalCollection();
    await collection.closeButton.click();
    await expect(collection.heading).toBeHidden();

    await homePage.openMedalCollection();
    await page.mouse.click(5, 5);
    await expect(collection.heading).toBeHidden();
  });
});
