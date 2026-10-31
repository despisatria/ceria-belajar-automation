import { expect, type Locator, type Page } from '@playwright/test';

/** The "Koleksi Medali" / "Koleksi Bintang" modals on Home. */
export class CollectionModal {
  readonly heading: Locator;
  readonly indicator: Locator;
  readonly closeButton: Locator;
  private readonly items: Locator;

  constructor(
    private readonly page: Page,
    private readonly kind: 'badge' | 'star',
  ) {
    this.heading = page.getByRole('heading', { name: kind === 'badge' ? /^Koleksi Medali/ : /^Koleksi Bintang/ });
    this.indicator = page.getByTestId(`${kind}-indicator`);
    this.closeButton = page.getByRole('button', { name: 'Tutup' });
    // Only one collection modal is open at a time, so every item on the page belongs to it.
    this.items = page.locator('.medal-modal-item');
  }

  item(id: string): Locator {
    return this.page.getByTestId(`${this.kind}-${id}`);
  }

  /** Medals: items with data-earned="true". Stars: items with at least one star. */
  earnedItems(): Locator {
    return this.kind === 'badge'
      ? this.items.and(this.page.locator('[data-earned="true"]'))
      : this.items.and(this.page.locator('.earned'));
  }

  allItems(): Locator {
    return this.items;
  }

  filter(category: string): Locator {
    return this.page.getByRole('button', { name: category, exact: true });
  }

  async expectOpen(): Promise<void> {
    await expect(this.heading, `the "${this.kind === 'badge' ? 'Koleksi Medali' : 'Koleksi Bintang'}" modal is open`).toBeVisible();
  }
}
