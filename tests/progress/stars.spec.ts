import { expect, test } from '../../src/fixtures';
import { buildProfile } from '../../src/data/profiles';
import { CategoryMenuPage } from '../../src/pages/CategoryMenuPage';
import { documentTest } from '../../src/utils/report';
import { seedStorage } from '../../src/utils/storage';

const feature = 'Stars';

/** Number of games that award stars, as listed in the Koleksi Bintang modal. */
const STAR_GAMES = 42;

test.describe('Progress - Stars', { tag: ['@progress'] }, () => {
  test('should start a new player with no stars', { tag: ['@smoke'] }, async ({ player, homePage }) => {
    await documentTest({
      feature, story: 'Star collection', severity: 'critical',
      verifies: [
        'A new player sees 0 stars on Home',
        `"Koleksi Bintang" lists all ${STAR_GAMES} star games with no stars yet`,
        `The collection counter reads 0/${STAR_GAMES * 3} (3 stars per game)`,
      ],
    });

    await homePage.goto();

    await test.step('Then Home shows 0 stars', async () => {
      await expect(homePage.starCount, 'the Home star counter shows 0').toHaveText('0');
    });

    await test.step(`And the collection lists ${STAR_GAMES} games without stars`, async () => {
      const collection = await homePage.openStarCollection();
      await expect(collection.allItems(), `${STAR_GAMES} games are listed`).toHaveCount(STAR_GAMES);
      await expect(collection.earnedItems(), 'no game has stars').toHaveCount(0);
      await expect(collection.indicator, `the counter reads 0/${STAR_GAMES * 3}`).toHaveText(`0/${STAR_GAMES * 3}`);
    });
  });

  test('should show the stars of a single-level game on Home', { tag: ['@regression'] }, async ({ page, homePage }) => {
    await documentTest({
      feature, story: 'Earn stars in a game',
      verifies: [
        'Earning 2 stars in "Hitung Benda" shows 2 stars for that game in "Koleksi Bintang"',
        'The Home star counter adds them up to 2',
      ],
    });

    const profile = buildProfile({ progress: { game_angka_benda: { score: 100, stars: 2 } } });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await homePage.goto();

    await test.step('Then Home counts 2 stars', async () => {
      await expect(homePage.starCount, 'the Home star counter shows 2').toHaveText('2');
    });

    await test.step('And "Hitung Benda" shows 2 stars in the collection', async () => {
      const collection = await homePage.openStarCollection();
      await expect(collection.item('hitung_benda'), '"Hitung Benda" has 2 stars').toHaveAttribute('data-stars', '2');
      await expect(collection.earnedItems(), 'only one game has stars').toHaveCount(1);
    });
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
      await documentTest({
        feature, story: 'Three-level games',
        verifies: [
          `"Tebak Kata" has 3 levels worth up to 3 stars each; ${levels.join(' + ')} level stars roll up to ${expected} overall`,
          `Both the Home counter and the "Tebak Kata" entry show ${expected}`,
        ],
      });

      const [level1, level2, level3] = levels.map((stars) => ({ score: 100, stars }));
      const profile = buildProfile({ progress: { game_tebak_kata: { level1, level2, level3 } } });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
      await homePage.goto();

      await test.step(`Then Home and the collection show ${expected} star(s) for "Tebak Kata"`, async () => {
        await expect(homePage.starCount, `the Home star counter shows ${expected}`).toHaveText(String(expected));
        const collection = await homePage.openStarCollection();
        await expect(collection.item('tebak_kata'), `"Tebak Kata" has ${expected} star(s)`).toHaveAttribute('data-stars', String(expected));
      });
    });
  }

  // The same progress must show the same stars on the game's menu card and in the Home collection.
  const CONSISTENCY = [
    { category: 'Membaca', menu: '/membaca', card: 'Tebak Kata', progressKey: 'game_tebak_kata', starId: 'tebak_kata' },
    { category: 'Berhitung', menu: '/matematika', card: 'Kuis Tambah Apel', progressKey: 'game_kuis_tambah', starId: 'kuis_tambah' },
    { category: 'Berhitung', menu: '/matematika', card: 'Kuis Kurang Kue', progressKey: 'game_kuis_kurang', starId: 'kuis_kurang' },
  ];
  for (const game of CONSISTENCY) {
    test(`should show the same stars for "${game.card}" on the ${game.category} menu and on Home`, { tag: ['@regression'] }, async ({ page, homePage }) => {
      await documentTest({
        feature, story: 'Stars agree across screens',
        verifies: [
          `With 5 level stars (3 + 2), the "${game.card}" card on the ${game.category} menu and the "Koleksi Bintang" entry on Home show the same number of stars`,
          '5 is the boundary where the two star calculations in the app could disagree',
        ],
      });

      const progress = { [game.progressKey]: { level1: { score: 100, stars: 3 }, level2: { score: 80, stars: 2 } } };
      const profile = buildProfile({ progress });
      await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });

      const menu = new CategoryMenuPage(page);
      let menuStars = 0;
      await test.step(`When the stars on the "${game.card}" card are read from the ${game.category} menu`, async () => {
        await menu.goto(game.menu);
        await menu.openLatihan();
        menuStars = await menu.cardStars(game.card);
      });

      await test.step(`Then "Koleksi Bintang" on Home shows the same stars for "${game.card}"`, async () => {
        await homePage.goto();
        const collection = await homePage.openStarCollection();
        await expect(collection.item(game.starId), `Home shows ${menuStars} star(s), like the menu card`).toHaveAttribute('data-stars', String(menuStars));
      });
    });
  }

  test('should filter the star collection by category', { tag: ['@regression'] }, async ({ player, homePage }) => {
    await documentTest({
      feature, story: 'Star collection', severity: 'minor',
      verifies: ['The "Angka" filter shows only the 4 Angka games and the counter follows the filter (0/12)'],
    });

    await homePage.goto();
    const collection = await homePage.openStarCollection();

    await test.step('When the "Angka" filter is chosen', async () => {
      await collection.filter('Angka').click();
    });

    await test.step('Then only the 4 Angka games are shown', async () => {
      await expect(collection.allItems(), '4 games are shown').toHaveCount(4);
      await expect(collection.indicator, 'the counter reads 0/12').toHaveText('0/12');
    });
  });
});
