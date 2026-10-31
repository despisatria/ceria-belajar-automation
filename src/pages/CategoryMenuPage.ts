import { expect, type Locator, type Page } from '@playwright/test';

/** A category menu (e.g. /matematika) with its Belajar / Latihan tabs and activity cards. */
export class CategoryMenuPage {
  readonly belajarTab: Locator;
  readonly latihanTab: Locator;
  readonly backButton: Locator;
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.belajarTab = page.getByRole('button', { name: /Belajar$/ });
    this.latihanTab = page.getByRole('button', { name: /Latihan$/ });
    this.backButton = page.getByRole('link', { name: /Kembali/ });
    this.cards = page.locator('main .category-grid > a');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await expect(this.backButton).toBeVisible();
  }

  card(title: string): Locator {
    return this.cards.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  /** Number of lit stars on a game card's star badge. */
  async cardStars(title: string): Promise<number> {
    const badge = this.card(title).getByTitle('Pencapaian Bintang');
    await expect(badge).toBeVisible();
    return badge.locator('.star-active').count();
  }

  async openLatihan(): Promise<void> {
    await this.latihanTab.click();
    await expect(this.latihanTab).toHaveClass(/active/);
  }
}
