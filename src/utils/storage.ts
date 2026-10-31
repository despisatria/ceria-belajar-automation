import type { Page } from '@playwright/test';
import type { ChildProfile } from '../data/profiles';

/** localStorage keys used by the app. */
export const STORAGE_KEYS = {
  profiles: 'ceria_profiles',
  activeProfileId: 'ceria_active_profile_id',
  musicMuted: 'ceria_music_muted',
} as const;

export interface SeedState {
  profiles?: ChildProfile[];
  activeProfileId?: string | null;
  musicMuted?: boolean;
}

/**
 * Seeds localStorage before any app script runs.
 * The init script runs on every navigation, so it only writes when the store is still empty;
 * otherwise a reload would wipe what the test just did in the UI.
 */
export async function seedStorage(page: Page, state: SeedState): Promise<void> {
  await page.addInitScript(
    ({ keys, state }) => {
      if (localStorage.getItem('__qa_seeded__')) return;
      localStorage.setItem('__qa_seeded__', 'true');
      if (state.profiles) localStorage.setItem(keys.profiles, JSON.stringify(state.profiles));
      if (state.activeProfileId) localStorage.setItem(keys.activeProfileId, state.activeProfileId);
      localStorage.setItem(keys.musicMuted, String(state.musicMuted ?? true));
    },
    { keys: STORAGE_KEYS, state },
  );
}

export async function readProfiles(page: Page): Promise<ChildProfile[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), STORAGE_KEYS.profiles);
}

export async function readActiveProfileId(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.activeProfileId);
}
