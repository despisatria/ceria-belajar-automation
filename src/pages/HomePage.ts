import { expect, type Locator, type Page } from '@playwright/test';
import { CollectionModal } from '../components/CollectionModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { step } from '../utils/report';

export const CATEGORIES = [
  { title: 'Dunia Alfabet', path: '/alfabet' },
  { title: 'Dunia Angka', path: '/angka' },
  { title: 'Ayo Membaca', path: '/membaca' },
  { title: 'Ayo Berhitung', path: '/matematika' },
  { title: 'Dunia Hijaiyah', path: '/hijaiyah' },
  { title: 'Bahasa Inggris', path: '/bahasa-inggris' },
  { title: 'Dunia Warna', path: '/warna' },
  { title: 'Belajar Sains', path: '/sains' },
  { title: 'Tebak & Cocok', path: '/mencocokkan' },
] as const;

export class HomePage {
  readonly modal: ConfirmModal;
  readonly medalCollection: CollectionModal;
  readonly starCollection: CollectionModal;

  readonly welcomeStartButton: Locator;
  readonly profileChip: Locator;
  readonly settingsLink: Locator;
  readonly medalButton: Locator;
  readonly starButton: Locator;
  readonly medalCount: Locator;
  readonly starCount: Locator;
  readonly categoryCards: Locator;
  readonly modalCloseButton: Locator;

  constructor(private readonly page: Page) {
    this.modal = new ConfirmModal(page);
    this.medalCollection = new CollectionModal(page, 'badge');
    this.starCollection = new CollectionModal(page, 'star');

    this.welcomeStartButton = page.getByRole('button', { name: /MULAI/ });
    this.profileChip = page.getByRole('button', { name: 'Ganti profil' });
    this.settingsLink = page.getByRole('link', { name: 'Pengaturan' });
    this.medalButton = page.getByRole('button', { name: 'Lihat koleksi medali' });
    this.starButton = page.getByRole('button', { name: 'Lihat koleksi bintang' });
    this.medalCount = page.getByTestId('medal-count');
    this.starCount = page.getByTestId('star-count');
    this.categoryCards = page.locator('main .category-grid > a');
    this.modalCloseButton = page.getByRole('button', { name: 'Tutup' });
  }

  async goto(): Promise<void> {
    await step('Open Home', () => this.page.goto('/').then(() => undefined));
  }

  welcomeGreeting(name: string): Locator {
    return this.page.getByRole('heading', { name: `Halo, ${name}!` });
  }

  categoryCard(title: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(title) });
  }

  async expectSignedInAs(name: string): Promise<void> {
    await step(`Home shows ${name} as the active player`, async () => {
      await expect(this.profileChip, 'the profile chip is shown on Home').toBeVisible();
      await expect(this.profileChip, `the profile chip shows "${name}"`).toContainText(name);
    });
  }

  async dismissWelcome(name: string): Promise<void> {
    await step(`Greeting "Halo, ${name}!" appears and is closed with MULAI`, async () => {
      await expect(this.welcomeGreeting(name), `the greeting "Halo, ${name}!" is shown`).toBeVisible();
      await this.welcomeStartButton.click();
      await expect(this.welcomeGreeting(name), 'the greeting is closed').toBeHidden();
    });
  }

  async openMedalCollection(): Promise<CollectionModal> {
    await step('Open "Koleksi Medali"', async () => {
      await this.medalButton.click();
      await this.medalCollection.expectOpen();
    });
    return this.medalCollection;
  }

  async openStarCollection(): Promise<CollectionModal> {
    await step('Open "Koleksi Bintang"', async () => {
      await this.starButton.click();
      await this.starCollection.expectOpen();
    });
    return this.starCollection;
  }

  async switchPlayer(): Promise<void> {
    await step('Switch player from Home', async () => {
      await this.profileChip.click();
      await this.modal.expectOpen('Ganti Pemain', 'Apakah kamu yakin ingin keluar dan ganti pemain?');
      await this.modal.confirm('Ya, Keluar');
    });
  }
}
