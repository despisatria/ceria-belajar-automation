import { expect, type Locator, type Page } from '@playwright/test';

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
    await expect(this.dialog).toBeVisible();
    await expect(this.dialog).toHaveAccessibleName(title);
    if (message) await expect(this.dialog.getByText(message)).toBeVisible();
  }

  async confirm(label: string | RegExp): Promise<void> {
    await this.dialog.getByRole('button', { name: label }).click();
  }

  async cancel(label: string | RegExp = 'Batal'): Promise<void> {
    await this.dialog.getByRole('button', { name: label }).click();
  }
}
