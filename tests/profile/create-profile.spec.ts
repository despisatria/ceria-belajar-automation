import { expect, test } from '../../src/fixtures';
import { AVATARS, MAX_NAME_LENGTH } from '../../src/data/profiles';
import { documentTest } from '../../src/utils/report';
import { readActiveProfileId, readProfiles } from '../../src/utils/storage';

const feature = 'Profiles';
const story = 'Create a profile';

test.describe('Profile - Create', { tag: ['@profile'] }, () => {
  test.beforeEach(async ({ freshVisitor, profileSelector }) => {
    await profileSelector.goto();
  });

  test('should show the create form on first visit without a cancel button', { tag: ['@smoke', '@mobile'] }, async ({ profileSelector }) => {
    await documentTest({
      feature, story, severity: 'critical',
      verifies: [
        'A first-time visitor lands straight on "Buat Profil Baru" instead of an empty profile list',
        'There is no "Batal" button, because there is nothing to go back to',
      ],
    });

    await test.step('Then the create-profile form is shown with no way to cancel', async () => {
      await expect(profileSelector.createHeading, 'the "Buat Profil Baru" form is shown').toBeVisible();
      await expect(profileSelector.cancelButton, 'there is no "Batal" button').toHaveCount(0);
    });
  });

  test('should create a profile, greet the child and open Home', { tag: ['@smoke', '@mobile'] }, async ({ page, profileSelector, homePage }) => {
    await documentTest({
      feature, story, severity: 'blocker',
      verifies: [
        'Submitting a name and avatar creates the profile and signs the child in',
        'The child is greeted by name ("Halo, DAFFA!") before reaching Home',
        'Home shows the new profile as the active player',
        'The profile is saved in localStorage with the chosen avatar and empty progress',
      ],
    });

    await test.step('When the child creates profile "Daffa" with the panda avatar', async () => {
      await profileSelector.createProfile('Daffa', AVATARS.panda);
    });

    await test.step('Then the child is greeted and lands on Home as DAFFA', async () => {
      await homePage.dismissWelcome('DAFFA');
      await homePage.expectSignedInAs('DAFFA');
    });

    await test.step('And the profile is saved and active in localStorage', async () => {
      const profiles = await readProfiles(page);
      expect(profiles, 'exactly one profile is saved').toHaveLength(1);
      expect(profiles[0], 'the saved profile has the name, avatar and empty progress').toMatchObject({ name: 'DAFFA', avatarUrl: AVATARS.panda, progress: {} });
      expect(await readActiveProfileId(page), 'the new profile is the active one').toBe(profiles[0].id);
    });
  });

  test('should uppercase the name while typing', { tag: ['@regression'] }, async ({ profileSelector }) => {
    await documentTest({
      feature, story, severity: 'minor',
      verifies: ['Letters typed in lowercase appear in uppercase, so names look the same everywhere in the app'],
    });

    await test.step('When the child types "aisyah"', async () => {
      await profileSelector.nameInput.pressSequentially('aisyah');
    });

    await test.step('Then the field shows "AISYAH"', async () => {
      await expect(profileSelector.nameInput, 'the name field shows "AISYAH"').toHaveValue('AISYAH');
    });
  });

  test(`should limit the name to ${MAX_NAME_LENGTH} characters`, { tag: ['@regression'] }, async ({ profileSelector }) => {
    await documentTest({
      feature, story, severity: 'minor',
      verifies: [`The name field stops accepting input after ${MAX_NAME_LENGTH} characters, so long names cannot break the layout`],
    });

    await test.step('When the child types a 13-letter name "MUHAMMADRIZKI"', async () => {
      await profileSelector.nameInput.pressSequentially('MUHAMMADRIZKI');
    });

    await test.step(`Then only the first ${MAX_NAME_LENGTH} letters are kept`, async () => {
      await expect(profileSelector.nameInput, `the name field shows "MUHAMMADRI" (${MAX_NAME_LENGTH} letters)`).toHaveValue('MUHAMMADRI');
    });
  });

  test('should trim surrounding spaces from the name', { tag: ['@regression'] }, async ({ page, profileSelector, homePage }) => {
    await documentTest({
      feature, story,
      verifies: ['Spaces before and after the name are not saved, so "  RARA  " is stored as "RARA"'],
    });

    await test.step('When the child creates a profile named "  RARA  "', async () => {
      await profileSelector.createProfile('  RARA  ');
      await homePage.dismissWelcome('RARA');
    });

    await test.step('Then the profile is saved as "RARA"', async () => {
      expect((await readProfiles(page))[0].name, 'the saved name is "RARA"').toBe('RARA');
    });
  });

  test('should not submit an empty name', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story,
      verifies: [
        'Pressing "Selesai!" with an empty name keeps the form open',
        'The browser marks the name field as required',
        'No profile is saved',
      ],
    });

    await test.step('When the child presses "Selesai!" without typing a name', async () => {
      await profileSelector.submitButton.click();
    });

    await test.step('Then the form stays open and nothing is saved', async () => {
      await expect(profileSelector.createHeading, 'the create-profile form is still shown').toBeVisible();
      expect(await profileSelector.nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing), 'the name field is flagged as required').toBe(true);
      expect(await readProfiles(page), 'no profile is saved').toHaveLength(0);
    });
  });

  test('should reject a name made only of spaces', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story,
      verifies: [
        'A name of only spaces passes the browser check but is rejected by the app',
        'The child sees the "Nama Belum Diisi" dialog asking for a name',
        'No profile is saved',
      ],
    });

    await test.step('When the child submits a name made of three spaces', async () => {
      await profileSelector.createProfile('   ');
    });

    await test.step('Then the app asks for a name and saves nothing', async () => {
      await profileSelector.modal.expectOpen('Nama Belum Diisi', 'Tolong isi nama ya!');
      await profileSelector.modal.confirm('OK');
      await expect(profileSelector.createHeading, 'the create-profile form is still shown').toBeVisible();
      expect(await readProfiles(page), 'no profile is saved').toHaveLength(0);
    });
  });

  test('should select the first avatar by default and allow exactly one selection', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story, severity: 'minor',
      verifies: [
        'All 15 avatars are offered',
        'The owl (first avatar) is selected by default',
        'Choosing another avatar moves the selection, so only one avatar is ever selected',
      ],
    });

    await test.step('Then 15 avatars are offered with the owl selected', async () => {
      await expect(profileSelector.avatarOptions, '15 avatars are offered').toHaveCount(15);
      await expect(profileSelector.avatarOption(AVATARS.burungHantu), 'the owl avatar is selected').toHaveAttribute('aria-checked', 'true');
    });

    await test.step('When the child picks the zebra', async () => {
      await profileSelector.avatarOption(AVATARS.zebra).click();
    });

    await test.step('Then only the zebra is selected', async () => {
      await expect(profileSelector.avatarOption(AVATARS.zebra), 'the zebra avatar is selected').toHaveAttribute('aria-checked', 'true');
      await expect(profileSelector.avatarOptions.and(page.locator('[aria-checked="true"]')), 'exactly one avatar is selected').toHaveCount(1);
    });
  });

  test('should let a child pick an avatar with the keyboard', { tag: ['@regression', '@a11y'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story,
      verifies: ['An avatar can be chosen without a mouse: focus it and press Space'],
    });

    await test.step('When the elephant avatar is focused and Space is pressed', async () => {
      await profileSelector.avatarOption(AVATARS.gajah).focus();
      await page.keyboard.press('Space');
    });

    await test.step('Then the elephant is selected', async () => {
      await expect(profileSelector.avatarOption(AVATARS.gajah), 'the elephant avatar is selected').toHaveAttribute('aria-checked', 'true');
    });
  });
});
