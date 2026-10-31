/**
 * Defects found by this suite that are not fixed in the app yet.
 * Tests covering them are marked with test.fail(), so the run stays green while the bug is open
 * and turns red ("expected to fail, but passed") the moment a fix ships, as a reminder to drop the mark.
 */
export const KNOWN_BUGS = {
  'BUG-001': 'Medal collection marks the wrong medal as earned for Hijaiyah, Membaca, Berhitung and Bahasa Inggris',
  'BUG-002': 'Home medal counter ignores the "Campur Warna" medal, so it never matches the medal collection',
  'BUG-003': 'Berhitung games award 2 stars from 5 level stars, while Home awards 2 stars from 6',
} as const;

export type KnownBugId = keyof typeof KNOWN_BUGS;

export function knownBug(id: KnownBugId): string {
  return `${id}: ${KNOWN_BUGS[id]}`;
}
