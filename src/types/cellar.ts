export interface CellarEntry {
  id: number;
  name: string;
  producer: string | null;
  appellation: string | null;
  vintage: string | null;
  quantity: number;
  quantity_initial: number;
  purchase_date: string | null;
  purchase_price: number | null;
  optimal_from: number | null;
  optimal_to: number | null;
  storage_location: string | null;
  notes: string | null;
  photo_uri: string | null;
  archived: 0 | 1;
  cave_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CellarForm {
  name: string;
  producer: string;
  appellation: string;
  vintage: string;
  quantity: string;
  purchase_date: string;
  purchase_price: string;
  optimal_from: string;
  optimal_to: string;
  storage_location: string;
  notes: string;
  photo_uri: string | null;
}

export const EMPTY_CELLAR_FORM: CellarForm = {
  name: '',
  producer: '',
  appellation: '',
  vintage: '',
  quantity: '1',
  purchase_date: '',
  purchase_price: '',
  optimal_from: '',
  optimal_to: '',
  storage_location: '',
  notes: '',
  photo_uri: null,
};

export function cellarFormToDb(form: CellarForm): Omit<CellarEntry, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: form.name.trim(),
    producer: form.producer.trim() || null,
    appellation: form.appellation.trim() || null,
    vintage: form.vintage.trim() || null,
    quantity: parseInt(form.quantity, 10) || 1,
    quantity_initial: parseInt(form.quantity, 10) || 1,
    purchase_date: form.purchase_date || null,
    purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
    optimal_from: form.optimal_from ? parseInt(form.optimal_from, 10) : null,
    optimal_to: form.optimal_to ? parseInt(form.optimal_to, 10) : null,
    storage_location: form.storage_location.trim() || null,
    notes: form.notes.trim() || null,
    photo_uri: form.photo_uri,
    archived: 0,
    cave_id: null,
  };
}

export function cellarEntryToForm(entry: CellarEntry): CellarForm {
  return {
    name: entry.name,
    producer: entry.producer ?? '',
    appellation: entry.appellation ?? '',
    vintage: entry.vintage ?? '',
    quantity: entry.quantity.toString(),
    purchase_date: entry.purchase_date ?? '',
    purchase_price: entry.purchase_price?.toString() ?? '',
    optimal_from: entry.optimal_from?.toString() ?? '',
    optimal_to: entry.optimal_to?.toString() ?? '',
    storage_location: entry.storage_location ?? '',
    notes: entry.notes ?? '',
    photo_uri: entry.photo_uri,
  };
}

export function cellarApogeeLabel(entry: CellarEntry): string | null {
  const { optimal_from, optimal_to } = entry;
  if (optimal_from && optimal_to) return `${optimal_from} – ${optimal_to}`;
  if (optimal_from) return `À partir de ${optimal_from}`;
  if (optimal_to) return `Jusqu'en ${optimal_to}`;
  return null;
}

export function cellarApogeeStatus(entry: CellarEntry): 'peak' | 'past' | 'early' | 'unknown' {
  const now = new Date().getFullYear();
  const { optimal_from, optimal_to } = entry;
  if (!optimal_from && !optimal_to) return 'unknown';
  if (optimal_to && now > optimal_to) return 'past';
  if (optimal_from && now < optimal_from) return 'early';
  return 'peak';
}
