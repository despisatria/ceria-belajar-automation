import { expect, test } from '../../src/fixtures';
import { AVATARS, MAX_NAME_LENGTH } from '../../src/data/profiles';
import { readActiveProfileId, readProfiles } from '../../src/utils/storage';

test.describe('Profile - Create', { tag: ['@profile'] }, () => {
  test.beforeEach(async ({ freshVisitor, profileSelector }) => {
    await profileSelector.goto();
  });

  test('should show the create form on first visit without a cancel button', { tag: ['@smoke', '@mobile'] }, async ({ profileSelector }) => {
    await expect(profileSelector.createHeading).toBeVisible();
    await expect(profileSelector.cancelButton).toHaveCount(0);
  });

  test('should create a profile, greet the child and open Home', { tag: ['@smoke', '@mobile'] }, async ({ page, profileSelector, homePage }) => {
    await profileSelector.createProfile('Daffa', AVATARS.panda);

    await homePage.dismissWelcome('DAFFA');
    await homePage.expectSignedInAs('DAFFA');

    const profiles = await readProfiles(page);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({ name: 'DAFFA', avatarUrl: AVATARS.panda, progress: {} });
    expect(await readActiveProfileId(page)).toBe(profiles[0].id);
  });

  test('should uppercase the name while typing', { tag: ['@regression'] }, async ({ profileSelector }) => {
    await profileSelector.nameInput.pressSequentially('aisyah');
    await expect(profileSelector.nameInput).toHaveValue('AISYAH');
  });

  test(`should limit the name to ${MAX_NAME_LENGTH} characters`, { tag: ['@regression'] }, async ({ profileSelector }) => {
    await profileSelector.nameInput.pressSequentially('MUHAMMADRIZKI');
    await expect(profileSelector.nameInput).toHaveValue('MUHAMMADRI');
  });

  test('should trim surrounding spaces from the name', { tag: ['@regression'] }, async ({ page, profileSelector, homePage }) => {
    await profileSelector.createProfile('  RARA  ');
    await homePage.dismissWelcome('RARA');
    expect((await readProfiles(page))[0].name).toBe('RARA');
  });

  test('should not submit an empty name', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.submitButton.click();

    await expect(profileSelector.createHeading).toBeVisible();
    expect(await profileSelector.nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    expect(await readProfiles(page)).toHaveLength(0);
  });

  test('should reject a name made only of spaces', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.createProfile('   ');

    await profileSelector.modal.expectOpen('Nama Belum Diisi', 'Tolong isi nama ya!');
    await profileSelector.modal.confirm('OK');
    await expect(profileSelector.createHeading).toBeVisible();
    expect(await readProfiles(page)).toHaveLength(0);
  });

  test('should select the first avatar by default and allow exactly one selection', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await expect(profileSelector.avatarOptions).toHaveCount(15);
    await expect(profileSelector.avatarOption(AVATARS.burungHantu)).toHaveAttribute('aria-checked', 'true');

    await profileSelector.avatarOption(AVATARS.zebra).click();

    await expect(profileSelector.avatarOption(AVATARS.zebra)).toHaveAttribute('aria-checked', 'true');
    await expect(profileSelector.avatarOptions.and(page.locator('[aria-checked="true"]'))).toHaveCount(1);
  });

  test('should let a child pick an avatar with the keyboard', { tag: ['@regression', '@a11y'] }, async ({ page, profileSelector }) => {
    await profileSelector.avatarOption(AVATARS.gajah).focus();
    await page.keyboard.press('Space');
    await expect(profileSelector.avatarOption(AVATARS.gajah)).toHaveAttribute('aria-checked', 'true');
  });
});
