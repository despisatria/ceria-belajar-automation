import { expect, type Locator, type Page } from '@playwright/test';
import { ConfirmModal } from '../components/ConfirmModal';

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
    await this.page.goto('/');
  }

  welcomeGreeting(name: string): Locator {
    return this.page.getByRole('heading', { name: `Halo, ${name}!` });
  }

  categoryCard(title: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(title) });
  }

  async expectSignedInAs(name: string): Promise<void> {
    await expect(this.profileChip).toBeVisible();
    await expect(this.profileChip).toContainText(name);
  }

  async dismissWelcome(name: string): Promise<void> {
    await expect(this.welcomeGreeting(name)).toBeVisible();
    await this.welcomeStartButton.click();
    await expect(this.welcomeGreeting(name)).toBeHidden();
  }

  async switchPlayer(): Promise<void> {
    await this.profileChip.click();
    await this.modal.expectOpen('Ganti Pemain', 'Apakah kamu yakin ingin keluar dan ganti pemain?');
    await this.modal.confirm('Ya, Keluar');
  }
}
