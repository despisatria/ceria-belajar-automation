import { expect, type Locator, type Page } from '@playwright/test';
import { ConfirmModal } from '../components/ConfirmModal';
import { step } from '../utils/report';

/** The "who is playing" gate shown before the app, plus the create/edit profile form. */
export class ProfileSelectorPage {
  readonly modal: ConfirmModal;

  // Selection screen
  readonly selectionHeading: Locator;
  readonly addProfileButton: Locator;
  readonly manageButton: Locator;
  readonly doneManagingButton: Locator;

  // Create / edit form
  readonly createHeading: Locator;
  readonly editHeading: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly avatarOptions: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.modal = new ConfirmModal(page);

    this.selectionHeading = page.getByRole('heading', { name: /Siapa yang bermain hari ini/ });
    this.addProfileButton = page.getByRole('button', { name: 'Tambah profil' });
    this.manageButton = page.getByRole('button', { name: 'Atur Profil' });
    this.doneManagingButton = page.getByRole('button', { name: 'Selesai Mengatur' });

    this.createHeading = page.getByRole('heading', { name: /Buat Profil Baru/ });
    this.editHeading = page.getByRole('heading', { name: /Edit Profil/ });
    this.form = page.locator('form');
    this.nameInput = page.getByLabel('Siapa nama panggilanmu?');
    this.avatarOptions = page.getByRole('radio');
    this.submitButton = this.form.getByRole('button', { name: /Selesai!/ });
    this.cancelButton = this.form.getByRole('button', { name: 'Batal' });
    this.deleteButton = this.form.getByRole('button', { name: 'Hapus' });
  }

  async goto(): Promise<void> {
    await step('Open the app', () => this.page.goto('/').then(() => undefined));
  }

  profileCard(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^(Main sebagai|Edit profil) ${name}$`) });
  }

  avatarOption(avatarUrl: string): Locator {
    return this.page.locator(`[role="radio"]:has(img[src="${avatarUrl}"])`);
  }

  async fillProfileForm(name: string, avatarUrl?: string): Promise<void> {
    await step(`Type name "${name}"${avatarUrl ? ` and pick avatar ${avatarLabel(avatarUrl)}` : ''}`, async () => {
      await this.nameInput.fill(name);
      if (avatarUrl) await this.avatarOption(avatarUrl).click();
    });
  }

  async createProfile(name: string, avatarUrl?: string): Promise<void> {
    await step(`Create profile "${name}"${avatarUrl ? ` with avatar ${avatarLabel(avatarUrl)}` : ''}`, async () => {
      await expect(this.createHeading, 'the create-profile form is shown').toBeVisible();
      await this.fillProfileForm(name, avatarUrl);
      await this.submitButton.click();
    });
  }

  async selectProfile(name: string): Promise<void> {
    await step(`Start playing as ${name}`, async () => {
      await this.profileCard(name).click();
      await this.modal.expectOpen('Pilih Pemain', `Mulai bermain sebagai ${name}?`);
      await this.modal.confirm('Ya, Mulai!');
    });
  }

  async openEditForm(name: string): Promise<void> {
    await step(`Open the edit form for ${name} via "Atur Profil"`, async () => {
      await this.manageButton.click();
      await this.profileCard(name).click();
      await expect(this.editHeading, 'the edit-profile form is shown').toBeVisible();
    });
  }
}

/** '/images/avatar/avatar-singa.webp' -> 'singa' */
function avatarLabel(url: string): string {
  return url.replace(/^.*avatar-/, '').replace(/\.webp$/, '');
}
