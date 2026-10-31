import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

export interface TestDoc {
  /** Allure "Feature", e.g. "Profiles". */
  feature: string;
  /** Allure "Story", e.g. "Create a profile". */
  story: string;
  severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
  /** Plain-language list of what the test checks, shown as the test description in the report. */
  verifies: string[];
  /** Open defect this test is expected to expose, from KNOWN_BUGS. */
  knownBug?: string;
}

/**
 * Labels the running test for the Allure report and writes a readable description,
 * so someone who never opens the code still sees what was checked and why.
 */
export async function documentTest(doc: TestDoc): Promise<void> {
  await allure.epic('Ceria Belajar');
  await allure.feature(doc.feature);
  await allure.story(doc.story);
  await allure.severity(doc.severity ?? 'normal');

  const lines = ['**What this test verifies**', '', ...doc.verifies.map((item) => `- ${item}`)];
  if (doc.knownBug) {
    lines.push('', `**Known bug:** ${doc.knownBug}`, '', 'Marked as expected to fail: the run stays green while the bug is open and turns red once the fix ships.');
  }
  await allure.description(lines.join('\n'));
}

/** A page-object action reported as one readable step, with its clicks and fills nested inside. */
export function step<T>(title: string, body: () => Promise<T>): Promise<T> {
  return test.step(title, body, { box: true });
}
