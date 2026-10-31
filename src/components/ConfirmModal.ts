import { expect, type Locator, type Page } from '@playwright/test';
import { step } from '../utils/report';

/** The app's shared ConfirmModal (src/components/ui/ConfirmModal.tsx), also used for alerts. */
export class ConfirmModal {
  readonly dialog: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog');
  }

  title(text: string | RegExp): Locator {
    return this.dialog.getByRole('heading', { name: text });
  }

  async expectOpen(title: string | RegExp, message?: string | RegExp): Promise<void> {
    await step(`Dialog "${title}" is shown`, async () => {
      await expect(this.dialog, `a dialog is open`).toBeVisible();
      await expect(this.dialog, `the dialog is titled "${title}"`).toHaveAccessibleName(title);
      if (message) await expect(this.dialog.getByText(message), `the dialog says "${message}"`).toBeVisible();
    });
  }

  async confirm(label: string | RegExp): Promise<void> {
    await step(`Click "${label}" in the dialog`, () => this.dialog.getByRole('button', { name: label }).click());
  }

  async cancel(label: string | RegExp = 'Batal'): Promise<void> {
    await step(`Click "${label}" in the dialog`, () => this.dialog.getByRole('button', { name: label }).click());
  }
}
