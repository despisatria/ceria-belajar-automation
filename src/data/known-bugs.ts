/**
 * Defects found by this suite that are not fixed in the app yet.
 * Tests covering them are marked with test.fail(), so the run stays green while the bug is open
 * and turns red ("expected to fail, but passed") the moment a fix ships, as a reminder to drop the mark.
 */
export const KNOWN_BUGS = {} as const;

export type KnownBugId = keyof typeof KNOWN_BUGS;

export function knownBug(id: KnownBugId): string {
  return `${id}: ${KNOWN_BUGS[id]}`;
}
