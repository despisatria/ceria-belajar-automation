import { expect, test } from '../../src/fixtures';
import { AVATARS, MAX_PROFILES, buildProfile, buildProfiles } from '../../src/data/profiles';
import { documentTest } from '../../src/utils/report';
import { readActiveProfileId, readProfiles, seedStorage } from '../../src/utils/storage';

const feature = 'Profiles';

test.describe('Profile - Session', { tag: ['@profile'] }, () => {
  const story = 'Stay signed in and switch player';

  test('should keep the child signed in after a reload', { tag: ['@smoke', '@mobile'] }, async ({ page, player, homePage }) => {
    await documentTest({
      feature, story, severity: 'critical',
      verifies: ['Reloading the page (or reopening the app) keeps the same child signed in, without asking "who is playing" again'],
    });

    await test.step(`When ${player.name} opens Home and reloads the page`, async () => {
      await homePage.goto();
      await homePage.expectSignedInAs(player.name);
      await page.reload();
    });

    await test.step(`Then ${player.name} is still the active player`, async () => {
      await homePage.expectSignedInAs(player.name);
    });
  });

  test('should switch player back to the profile selection screen', { tag: ['@smoke'] }, async ({ page, player, homePage, profileSelector }) => {
    await documentTest({
      feature, story, severity: 'critical',
      verifies: [
        'Tapping the profile chip on Home and confirming "Ya, Keluar" signs the child out',
        'The "Siapa yang bermain hari ini?" screen lists the existing profile',
        'No profile is active in localStorage afterwards',
      ],
    });

    await test.step(`When ${player.name} switches player from Home`, async () => {
      await homePage.goto();
      await homePage.switchPlayer();
    });

    await test.step('Then the profile selection screen is shown and nobody is signed in', async () => {
      await expect(profileSelector.selectionHeading, '"Siapa yang bermain hari ini?" is shown').toBeVisible();
      await expect(profileSelector.profileCard(player.name), `${player.name} is listed`).toBeVisible();
      expect(await readActiveProfileId(page), 'no profile is active').toBeNull();
    });
  });

  test('should stay on Home when switching player is cancelled', { tag: ['@regression'] }, async ({ player, homePage }) => {
    await documentTest({
      feature, story,
      verifies: ['Pressing "Batal" in the "Ganti Pemain" dialog closes it and keeps the child on Home, still signed in'],
    });

    await test.step('When the child opens "Ganti Pemain" and presses "Batal"', async () => {
      await homePage.goto();
      await homePage.profileChip.click();
      await homePage.modal.cancel();
    });

    await test.step(`Then the dialog closes and ${player.name} is still signed in`, async () => {
      await expect(homePage.modal.title('Ganti Pemain'), 'the "Ganti Pemain" dialog is closed').toBeHidden();
      await homePage.expectSignedInAs(player.name);
    });
  });
});

test.describe('Profile - Selection & management', { tag: ['@profile'] }, () => {
  // Manage mode wiggles the cards forever; the app stops that under reduced motion, which also makes them clickable.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  const [ani, budi] = [buildProfile({ name: 'ANI' }), buildProfile({ name: 'BUDI', avatarUrl: AVATARS.gajah })];

  test.beforeEach(async ({ page, profileSelector }) => {
    await seedStorage(page, { profiles: [ani, budi] });
    await profileSelector.goto();
    await expect(profileSelector.selectionHeading, '"Siapa yang bermain hari ini?" is shown').toBeVisible();
  });

  test('should list every saved profile', { tag: ['@smoke'] }, async ({ profileSelector }) => {
    await documentTest({
      feature, story: 'Choose who is playing', severity: 'critical',
      verifies: ['Every saved profile (ANI and BUDI) appears on the "who is playing" screen'],
    });

    await test.step('Then ANI and BUDI are both listed', async () => {
      await expect(profileSelector.profileCard('ANI'), 'ANI is listed').toBeVisible();
      await expect(profileSelector.profileCard('BUDI'), 'BUDI is listed').toBeVisible();
    });
  });

  test('should start playing as the chosen profile after confirmation', { tag: ['@smoke', '@mobile'] }, async ({ page, profileSelector, homePage }) => {
    await documentTest({
      feature, story: 'Choose who is playing', severity: 'blocker',
      verifies: [
        'Choosing a profile asks for confirmation ("Mulai bermain sebagai BUDI?")',
        'After confirming, the child is greeted and Home shows BUDI as the active player',
        'BUDI is stored as the active profile',
      ],
    });

    await test.step('When the child chooses BUDI and confirms', async () => {
      await profileSelector.selectProfile('BUDI');
    });

    await test.step('Then BUDI is greeted and signed in', async () => {
      await homePage.dismissWelcome('BUDI');
      await homePage.expectSignedInAs('BUDI');
      expect(await readActiveProfileId(page), 'BUDI is the active profile').toBe(budi.id);
    });
  });

  test('should not start playing when the selection is cancelled', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story: 'Choose who is playing',
      verifies: ['Pressing "Batal" in the "Pilih Pemain" dialog keeps the child on the selection screen without signing in'],
    });

    await test.step('When the child chooses ANI and presses "Batal"', async () => {
      await profileSelector.profileCard('ANI').click();
      await profileSelector.modal.cancel();
    });

    await test.step('Then the selection screen stays and nobody is signed in', async () => {
      await expect(profileSelector.selectionHeading, '"Siapa yang bermain hari ini?" is still shown').toBeVisible();
      expect(await readActiveProfileId(page), 'no profile is active').toBeNull();
    });
  });

  test('should rename a profile and change its avatar', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story: 'Edit or delete a profile',
      verifies: [
        'The edit form opens pre-filled with the current name',
        'Saving a new name and avatar updates that profile only',
        'The number of profiles does not change',
      ],
    });

    await test.step('When ANI is renamed to ANITA with the sheep avatar', async () => {
      await profileSelector.openEditForm('ANI');
      await expect(profileSelector.nameInput, 'the form is pre-filled with "ANI"').toHaveValue('ANI');
      await profileSelector.fillProfileForm('ANITA', AVATARS.domba);
      await profileSelector.submitButton.click();
    });

    await test.step('Then the profile is saved as ANITA with the sheep avatar', async () => {
      const profiles = await readProfiles(page);
      expect(profiles.find((p) => p.id === ani.id), 'ANI is now ANITA with the sheep avatar').toMatchObject({ name: 'ANITA', avatarUrl: AVATARS.domba });
      expect(profiles, 'there are still 2 profiles').toHaveLength(2);
    });
  });

  test('should discard edits when cancelled', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story: 'Edit or delete a profile',
      verifies: ['Typing a new name and pressing "Batal" leaves the saved profile unchanged'],
    });

    await test.step('When ANI is renamed to XXX and the edit is cancelled', async () => {
      await profileSelector.openEditForm('ANI');
      await profileSelector.fillProfileForm('XXX');
      await profileSelector.cancelButton.click();
    });

    await test.step('Then the saved names are unchanged', async () => {
      expect((await readProfiles(page)).map((p) => p.name), 'the saved names are still ANI and BUDI').toEqual(['ANI', 'BUDI']);
    });
  });

  test('should delete a profile after confirmation', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story: 'Edit or delete a profile', severity: 'critical',
      verifies: [
        'Deleting asks for confirmation ("Yakin mau hapus profil ANI?")',
        'After confirming, ANI disappears from the list and from storage',
        'The other profile is kept',
      ],
    });

    await test.step('When ANI is deleted and the deletion is confirmed', async () => {
      await profileSelector.openEditForm('ANI');
      await profileSelector.deleteButton.click();
      await profileSelector.modal.expectOpen('Hapus Profil', 'Yakin mau hapus profil ANI?');
      await profileSelector.modal.confirm('Hapus');
    });

    await test.step('Then only BUDI remains', async () => {
      await expect(profileSelector.selectionHeading, 'the selection screen is shown again').toBeVisible();
      await expect(profileSelector.profileCard('ANI'), 'ANI is no longer listed').toHaveCount(0);
      expect((await readProfiles(page)).map((p) => p.name), 'only BUDI is saved').toEqual(['BUDI']);
    });
  });

  test('should return to the create form when the last profile is deleted', { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story: 'Edit or delete a profile',
      verifies: ['Once every profile is deleted, the app goes back to "Buat Profil Baru" instead of showing an empty list'],
    });

    await test.step('When ANI and then BUDI are deleted', async () => {
      await profileSelector.openEditForm('ANI');
      await profileSelector.deleteButton.click();
      await profileSelector.modal.confirm('Hapus');

      // Manage mode stays on after a delete, so the next card opens the edit form directly.
      await profileSelector.profileCard('BUDI').click();
      await profileSelector.deleteButton.click();
      await profileSelector.modal.confirm('Hapus');
    });

    await test.step('Then the create-profile form is shown and storage is empty', async () => {
      await expect(profileSelector.createHeading, 'the "Buat Profil Baru" form is shown').toBeVisible();
      expect(await readProfiles(page), 'no profiles are saved').toEqual([]);
    });
  });
});

test.describe('Profile - Limits', { tag: ['@profile'] }, () => {
  const story = 'Profile limit';

  test(`should hide the add button once ${MAX_PROFILES} profiles exist`, { tag: ['@regression'] }, async ({ page, profileSelector }) => {
    await documentTest({
      feature, story,
      verifies: [`With ${MAX_PROFILES} profiles saved, the "Tambah profil" (+) button is no longer offered`],
    });

    await seedStorage(page, { profiles: buildProfiles(MAX_PROFILES) });

    await test.step('When the app is opened', async () => {
      await profileSelector.goto();
      await expect(profileSelector.selectionHeading, '"Siapa yang bermain hari ini?" is shown').toBeVisible();
    });

    await test.step('Then there is no "Tambah profil" button', async () => {
      await expect(profileSelector.addProfileButton, 'the "Tambah profil" button is hidden').toHaveCount(0);
    });
  });

  test(`should still allow adding at ${MAX_PROFILES - 1} profiles`, { tag: ['@regression'] }, async ({ page, profileSelector, homePage }) => {
    await documentTest({
      feature, story,
      verifies: [`With ${MAX_PROFILES - 1} profiles saved, one more profile can still be added, reaching the limit of ${MAX_PROFILES}`],
    });

    await seedStorage(page, { profiles: buildProfiles(MAX_PROFILES - 1) });

    await test.step('When a sixth profile "KEENAM" is added', async () => {
      await profileSelector.goto();
      await profileSelector.addProfileButton.click();
      await profileSelector.createProfile('KEENAM');
      await homePage.dismissWelcome('KEENAM');
    });

    await test.step(`Then ${MAX_PROFILES} profiles are saved`, async () => {
      expect(await readProfiles(page), `${MAX_PROFILES} profiles are saved`).toHaveLength(MAX_PROFILES);
    });
  });
});
