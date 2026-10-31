/** Mirrors ChildProfile in the app (src/contexts/ProfileContext.tsx). */
export interface ChildProfile {
  id: string;
  name: string;
  avatarUrl: string;
  progress: Record<string, unknown>;
}

export const AVATARS = {
  burungHantu: '/images/avatar/avatar-burunghantu.webp',
  domba: '/images/avatar/avatar-domba.webp',
  gajah: '/images/avatar/avatar-gajah.webp',
  panda: '/images/avatar/avatar-panda.webp',
  singa: '/images/avatar/avatar-singa.webp',
  zebra: '/images/avatar/avatar-zebra.webp',
} as const;

/** The app caps profiles at 6 and names at 10 characters. */
export const MAX_PROFILES = 6;
export const MAX_NAME_LENGTH = 10;

let counter = 0;

/** Builds a profile the way the app stores it. Names are uppercase because the app uppercases input. */
export function buildProfile(overrides: Partial<ChildProfile> = {}): ChildProfile {
  counter += 1;
  return {
    id: `${Date.now()}${counter}`,
    name: `ANAK${counter}`,
    avatarUrl: AVATARS.singa,
    progress: {},
    ...overrides,
  };
}

export function buildProfiles(count: number): ChildProfile[] {
  return Array.from({ length: count }, (_, i) => buildProfile({ name: `ANAK${i + 1}` }));
}
