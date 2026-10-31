import { test as base, expect } from '@playwright/test';
import { buildProfile, type ChildProfile } from '../data/profiles';
import { HomePage } from '../pages/HomePage';
import { ProfileSelectorPage } from '../pages/ProfileSelectorPage';
import { seedStorage } from '../utils/storage';

interface Fixtures {
  homePage: HomePage;
  profileSelector: ProfileSelectorPage;
  /** Fresh visitor: no profiles, music muted. */
  freshVisitor: void;
  /** A signed-in child profile, seeded through localStorage so the test starts on Home. */
  player: ChildProfile;
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  profileSelector: async ({ page }, use) => {
    await use(new ProfileSelectorPage(page));
  },

  freshVisitor: async ({ page }, use) => {
    await seedStorage(page, { profiles: [] });
    await use();
  },

  player: async ({ page }, use) => {
    const profile = buildProfile({ name: 'BUDI' });
    await seedStorage(page, { profiles: [profile], activeProfileId: profile.id });
    await use(profile);
  },
});

export { expect };
