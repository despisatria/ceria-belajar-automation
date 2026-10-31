import { expect, test } from '../../src/fixtures';
import { knownBug, type KnownBugId } from '../../src/data/known-bugs';
import { buildProfile } from '../../src/data/profiles';
import { CategoryMenuPage } from '../../src/pages/CategoryMenuPage';
import { seedStorage } from '../../src/utils/storage';

/** Number of games that award stars, as listed in the Koleksi Bintang modal. */
const STAR_GAMES = 42;

test.describe('Progress - Stars', { tag: ['@progress'] }, () => {
  test('should start a new player with no stars', { tag: ['@smoke'] }, async ({ player, homePage }) => {
    await homePage.goto();
    await expect(homePage.starCount).toHaveText('0');

    const collection = await homePage.openStarCollection();
    await expect(collection.allItems()).toHaveCount(STAR_GAMES);
    await expect(collection.earnedItems()).toHaveCount(0);
    await expect(collection.indicator).toHaveText(`0/${STAR_GAMES * 3}`);
  });

  test('should show the stars of a single-level game on Home', { tag: ['@regression'] }, async ({ page, homePage }) => {
    const profile = buildProfile({ progress: { game_angka_benda: { score: 100, stars: 2 } } });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    await expect(homePage.starCount).toHaveText('2');
    const collection = await homePage.openStarCollection();
    await expect(collection.item('hitung_benda')).toHaveAttribute('data-stars', '2');
    await expect(collection.earnedItems()).toHaveCount(1);
  });

  // Three-level games roll the 9 possible level stars up into 3 overall stars.
  const LEVEL_ROLLUP = [
    { levels: [3, 3, 3], expected: 3 },
    { levels: [3, 3, 0], expected: 2 },
    { levels: [1, 0, 0], expected: 1 },
    { levels: [0, 0, 0], expected: 0 },
  ];
  for (const { levels, expected } of LEVEL_ROLLUP) {
    test(`should roll level stars ${levels.join('+')} up to ${expected} overall`, { tag: ['@regression'] }, async ({ page, homePage }) => {
      const [level1, level2, level3] = levels.map((stars) => ({ score: 100, stars }));
      const profile = buildProfile({ progress: { game_tebak_kata: { level1, level2, level3 } } });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
      await homePage.goto();

      await expect(homePage.starCount).toHaveText(String(expected));
      const collection = await homePage.openStarCollection();
      await expect(collection.item('tebak_kata')).toHaveAttribute('data-stars', String(expected));
    });
  }

  // The same progress must show the same stars on the game's menu card and in the Home collection.
  const CONSISTENCY = [
    { category: 'Membaca', menu: '/membaca', card: 'Tebak Kata', progressKey: 'game_tebak_kata', starId: 'tebak_kata' },
    { category: 'Berhitung', menu: '/matematika', card: 'Kuis Tambah Apel', progressKey: 'game_kuis_tambah', starId: 'kuis_tambah', knownBug: 'BUG-003' as KnownBugId },
    { category: 'Berhitung', menu: '/matematika', card: 'Kuis Kurang Kue', progressKey: 'game_kuis_kurang', starId: 'kuis_kurang', knownBug: 'BUG-003' as KnownBugId },
  ];
  for (const game of CONSISTENCY) {
    test(`should show the same stars for "${game.card}" on the ${game.category} menu and on Home`, { tag: ['@regression'] }, async ({ page, homePage }) => {
      if (game.knownBug) test.fail(true, knownBug(game.knownBug));

      // 5 level stars sits on the boundary where the two calculations disagree.
      const progress = { [game.progressKey]: { level1: { score: 100, stars: 3 }, level2: { score: 80, stars: 2 } } };
      const profile = buildProfile({ progress });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });

      const menu = new CategoryMenuPage(page);
      await menu.goto(game.menu);
      await menu.openLatihan();
      const menuStars = await menu.cardStars(game.card);

      await homePage.goto();
      const collection = await homePage.openStarCollection();
      await expect(collection.item(game.starId)).toHaveAttribute('data-stars', String(menuStars));
    });
  }

  test('should filter the star collection by category', { tag: ['@regression'] }, async ({ player, homePage }) => {
    await homePage.goto();
    const collection = await homePage.openStarCollection();

    await collection.filter('Angka').click();

    await expect(collection.allItems()).toHaveCount(4);
    await expect(collection.indicator).toHaveText('0/12');
  });
});
