import type { KnownBugId } from './known-bugs';

const items = (count: number) => Array.from({ length: count }, (_, i) => `item-${i}`);
const keyed = (count: number) => Object.fromEntries(items(count).map((key) => [key, true]));

export interface BadgeCase {
  id: string;
  title: string;
  category: string;
  /** The smallest progress, in the shape the app's pages write it, that should earn this medal and nothing else. */
  progress: Record<string, unknown>;
  knownBug?: KnownBugId;
}

/**
 * Every collection medal, in the order the app lists them.
 * Thresholds come from the medal descriptions (e.g. "Mengenal 26 Huruf Besar").
 */
export const BADGES: BadgeCase[] = [
  { id: 'alfabet-besar', title: 'Huruf Besar', category: 'Alfabet', progress: { alfabet: { 'huruf-besar': { viewedLetters: items(26) } } } },
  { id: 'alfabet-kecil', title: 'Huruf Kecil', category: 'Alfabet', progress: { alfabet: { 'huruf-kecil': { viewedLetters: items(26) } } } },
  { id: 'alfabet-ketik', title: 'Ketik Huruf', category: 'Alfabet', progress: { alfabet: { 'ketik-huruf': { viewedLetters: items(52) } } } },
  { id: 'alfabet-tulis', title: 'Tulis Huruf', category: 'Alfabet', progress: { 'belajar-menulis': keyed(52) } },

  { id: 'angka-mengenal', title: 'Mengenal Angka', category: 'Angka', progress: { angka: { belajar: { viewedNumbers: items(101) } } } },
  { id: 'angka-ketik', title: 'Ketik Angka', category: 'Angka', progress: { angka: { ketik: { viewedNumbers: items(100) } } } },
  { id: 'angka-tulis', title: 'Tulis Angka', category: 'Angka', progress: { 'belajar-menulis-angka': keyed(20) } },

  { id: 'membaca-dasar', title: 'Suku Kata Dasar', category: 'Membaca', progress: { membaca: { dasar: { viewedSyllables: items(110) } } }, knownBug: 'BUG-001' },
  { id: 'membaca-khusus', title: 'Suku Kata Khusus', category: 'Membaca', progress: { membaca: { khusus: { viewedSyllables: items(10) } } }, knownBug: 'BUG-001' },
  { id: 'membaca-kata2', title: '2 Suku Kata', category: 'Membaca', progress: { membaca: { kata2: { viewedWords: items(45) } } }, knownBug: 'BUG-001' },
  { id: 'membaca-kata3', title: '3 Suku Kata', category: 'Membaca', progress: { membaca: { kata3: { viewedWords: items(30) } } }, knownBug: 'BUG-001' },
  { id: 'membaca-ketik', title: 'Ketik Kata', category: 'Membaca', progress: { membaca: { ketik: { viewedWords: items(45) } } }, knownBug: 'BUG-001' },
  { id: 'membaca-kalimat', title: 'Membaca Kalimat', category: 'Membaca', progress: { membaca: { kalimat: { viewedSentences: items(50) } } }, knownBug: 'BUG-001' },

  { id: 'mtk-penjumlahan', title: 'Penjumlahan', category: 'Berhitung', progress: { matematika: { penjumlahan: { 'level-1': { completedPages: items(20) } } } }, knownBug: 'BUG-001' },
  { id: 'mtk-pengurangan', title: 'Pengurangan', category: 'Berhitung', progress: { matematika: { pengurangan: { 'level-1': { completedPages: items(20) } } } }, knownBug: 'BUG-001' },
  { id: 'mtk-katak-tambah', title: 'Katak Penjumlah', category: 'Berhitung', progress: { matematika: { katakPenjumlah: { completedPages: items(15) } } }, knownBug: 'BUG-001' },
  { id: 'mtk-katak-kurang', title: 'Katak Pengurang', category: 'Berhitung', progress: { matematika: { katakPengurang: { completedPages: items(15) } } }, knownBug: 'BUG-001' },

  { id: 'hijaiyah-huruf', title: 'Huruf Hijaiyah', category: 'Hijaiyah', progress: { hijaiyah: { mengenal: { viewedLetters: items(30) } } }, knownBug: 'BUG-001' },
  { id: 'hijaiyah-angka', title: 'Angka Hijaiyah', category: 'Hijaiyah', progress: { hijaiyah: { angka: { viewedNumbers: items(20) } } }, knownBug: 'BUG-001' },
  { id: 'hijaiyah-tanda', title: 'Tanda Baca', category: 'Hijaiyah', progress: { hijaiyah: { tandaBaca: { viewedSymbols: items(24) } } }, knownBug: 'BUG-001' },
  { id: 'hijaiyah-iqro', title: 'Iqro Dasar', category: 'Hijaiyah', progress: { hijaiyah: { iqro: { viewedPages: items(21) } } }, knownBug: 'BUG-001' },

  { id: 'english-alfabet', title: 'ABC in English', category: 'Bahasa Inggris', progress: { 'bahasa-inggris': { alfabet: { viewedLetters: items(26) } } }, knownBug: 'BUG-001' },
  { id: 'english-angka', title: 'Number in English', category: 'Bahasa Inggris', progress: { 'bahasa-inggris': { angka: { viewedNumbers: items(21) } } }, knownBug: 'BUG-001' },
  { id: 'english-colors', title: 'Colors in English', category: 'Bahasa Inggris', progress: { 'bahasa-inggris': { colors: { viewedItems: items(10) } } }, knownBug: 'BUG-001' },
  { id: 'english-animals', title: 'Animals in English', category: 'Bahasa Inggris', progress: { 'bahasa-inggris': { animals: { viewedItems: items(20) } } }, knownBug: 'BUG-001' },
  { id: 'english-fruits', title: 'Fruits in English', category: 'Bahasa Inggris', progress: { 'bahasa-inggris': { fruits: { viewedItems: items(20) } } }, knownBug: 'BUG-001' },

  { id: 'warna-mengenal', title: 'Mengenal Warna', category: 'Warna', progress: { warna: { mengenal: { viewedItems: items(11) } } } },
  { id: 'warna-campur', title: 'Campur Warna', category: 'Warna', progress: { warna: { 'belajar-campur': { viewedItems: items(5) } } }, knownBug: 'BUG-002' },

  { id: 'sains-hewan', title: 'Mengenal Hewan', category: 'Sains', progress: { sains_hewan: { progress: 54 } } },
  { id: 'sains-tumbuhan', title: 'Mengenal Tumbuhan', category: 'Sains', progress: { tumbuhan: { progress: 10 } } },
  { id: 'sains-cuaca', title: 'Mengenal Cuaca', category: 'Sains', progress: { cuaca: { progress: 6 } } },
  { id: 'sains-tatasurya', title: 'Tata Surya', category: 'Sains', progress: { tata_surya: { isCompleted: true } } },
];

export const TOTAL_BADGES = BADGES.length;
