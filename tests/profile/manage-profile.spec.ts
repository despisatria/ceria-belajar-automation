import { expect, test } from '../../src/fixtures';
import { AVATARS, MAX_PROFILES, buildProfile, buildProfiles } from '../../src/data/profiles';
import { readActiveProfileId, readProfiles, seedStorage } from '../../src/utils/storage';

test.describe('Profile - Session', { tag: ['@profile'] }, () => {
  test('should keep the child signed in after a reload', { tag: ['@smoke', '@mobile'] }, async ({ page, player, homePage }) => {
    await homePage.goto();
    await homePage.expectSignedInAs(player.name);

    await page.reload();

    await homePage.expectSignedInAs(player.name);
  });

  test('should switch player back to the profile selection screen', { tag: ['@smoke'] }, async ({ page, player, homePage, profileSelector }) => {
    await homePage.goto();
    await homePage.switchPlayer();

    await expect(profileSelector.selectionHeading).toBeVisible();
    await expect(profileSelector.profileCard(player.name)).toBeVisible();
    expect(await readActiveProfileId(page)).toBeNull();
  });

  test('should stay on Home when switching player is cancelled', { tag: ['@regression'] }, async ({ player, homePage }) => {
    await homePage.goto();
    await homePage.profileChip.click();
    await homePage.modal.cancel();

    await expect(homePage.modal.title('Ganti Pemain')).toBeHidden();
    await homePage.expectSignedInAs(player.name);
  });
});

test.describe('Profile - Selection & management', { tag: ['@profile'] }, () => {
  // Manage mode wiggles the cards forever; the app stops that under reduced motion, which also makes them clickable.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  const [ani, budi] = [buildProfile({ name: 'ANI' }), buildProfile({ name: 'BUDI', avatarUrl: AVATARS.gajah })];

  test.beforeEach(async ({ page, profileSelector }) => {
    await seedStorage(page, { profiles: [ani, budi] });
    await profileSelector.goto();
    await expect(profileSelector.selectionHeading).toBeVisible();
  });

  test('should list every saved profile', { tag: ['@smoke'] }, async ({ profileSelector }) => {
    await expect(profileSelector.profileCard('ANI')).toBeVisible();
    await expect(profileSelector.profileCard('BUDI')).toBeVisible();
  });

  test('should start playing as the chosen profile after confirmation', { tag: ['@smoke', '@mobile'] }, async ({ page, profileSelector, homePage }) => {
    await profileSelector.selectProfile('BUDI');

    await homePage.dismissWelcome('BUDI');
    await homePage.expectSignedInAs('BUDI');
    expect(await readActiveProfileId(page)).toBe(budi.id);
  });

  test('should not start playing when the selection is cancelled', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.profileCard('ANI').click();
    await profileSelector.modal.cancel();

    await expect(profileSelector.selectionHeading).toBeVisible();
    expect(await readActiveProfileId(page)).toBeNull();
  });

  test('should rename a profile and change its avatar', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.openEditForm('ANI');
    await expect(profileSelector.nameInput).toHaveValue('ANI');

    await profileSelector.fillProfileForm('ANITA', AVATARS.domba);
    await profileSelector.submitButton.click();

    const profiles = await readProfiles(page);
    expect(profiles.find((p) => p.id === ani.id)).toMatchObject({ name: 'ANITA', avatarUrl: AVATARS.domba });
    expect(profiles).toHaveLength(2);
  });

  test('should discard edits when cancelled', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.openEditForm('ANI');
    await profileSelector.fillProfileForm('XXX');
    await profileSelector.cancelButton.click();

    expect((await readProfiles(page)).map((p) => p.name)).toEqual(['ANI', 'BUDI']);
  });

  test('should delete a profile after confirmation', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.openEditForm('ANI');
    await profileSelector.deleteButton.click();
    await profileSelector.modal.expectOpen('Hapus Profil', 'Yakin mau hapus profil ANI?');
    await profileSelector.modal.confirm('Hapus');

    await expect(profileSelector.selectionHeading).toBeVisible();
    await expect(profileSelector.profileCard('ANI')).toHaveCount(0);
    expect((await readProfiles(page)).map((p) => p.name)).toEqual(['BUDI']);
  });

  test('should return to the create form when the last profile is deleted', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await profileSelector.openEditForm('ANI');
    await profileSelector.deleteButton.click();
    await profileSelector.modal.confirm('Hapus');

    // Manage mode stays on after a delete, so the next card opens the edit form directly.
    await profileSelector.profileCard('BUDI').click();
    await profileSelector.deleteButton.click();
    await profileSelector.modal.confirm('Hapus');

    await expect(profileSelector.createHeading).toBeVisible();
    expect(await readProfiles(page)).toEqual([]);
  });
});

test.describe('Profile - Limits', { tag: ['@profile'] }, () => {
  test(`should hide the add button once ${MAX_PROFILES} profiles exist`, { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await seedStorage(page, { profiles: buildProfiles(MAX_PROFILES) });
    await profileSelector.goto();

    await expect(profileSelector.selectionHeading).toBeVisible();
    await expect(profileSelector.addProfileButton).toHaveCount(0);
  });

  test(`should still allow adding at ${MAX_PROFILES - 1} profiles`, { tag: ['@regression'] }, async ({ page, profileSelector, homePage }) => {
    await seedStorage(page, { profiles: buildProfiles(MAX_PROFILES - 1) });
    await profileSelector.goto();

    await profileSelector.addProfileButton.click();
    await profileSelector.createProfile('KEENAM');
    await homePage.dismissWelcome('KEENAM');

    expect(await readProfiles(page)).toHaveLength(MAX_PROFILES);
  });
});
