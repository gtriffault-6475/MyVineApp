export type LocationType = 'home' | 'friend' | 'restaurant';

export type WineSortOption =
  | 'date_desc'
  | 'date_asc'
  | 'score_desc'
  | 'score_asc'
  | 'name_asc'
  | 'vintage_desc';

export interface WineSearchFilters {
  term: string;
  buyAgainOnly: boolean;
  locationType: LocationType | null;
  scoreMin: number | null;
  scoreMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: WineSortOption;
}

export const DEFAULT_FILTERS: WineSearchFilters = {
  term: '',
  buyAgainOnly: false,
  locationType: null,
  scoreMin: null,
  scoreMax: null,
  dateFrom: null,
  dateTo: null,
  sortBy: 'date_desc',
};

export interface Wine {
  id: number;
  name: string;
  producer: string | null;
  appellation: string | null;
  vintage: number | null;
  score: number | null;
  location_type: LocationType;
  restaurant_name: string | null;
  drunk_at: string; // YYYY-MM-DD
  food_pairing: string | null;
  photo_uri: string | null; // relative path inside documentDirectory
  comment: string | null;
  companion: string | null;
  buy_again: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface WineForm {
  name: string;
  producer: string;
  appellation: string;
  vintage: string;
  score: number | null;
  location_type: LocationType;
  restaurant_name: string;
  drunk_at: string;
  food_pairing: string;
  photo_uri: string | null;
  comment: string;
  companion: string;
  buy_again: boolean;
}

export interface WineStats {
  total: number;
  avg_score: number | null;
  buy_again_count: number;
  top_appellations: { appellation: string; count: number }[];
  top_producers: { producer: string; count: number }[];
}

export function wineFormToDb(form: WineForm): Omit<Wine, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: form.name.trim(),
    producer: form.producer.trim() || null,
    appellation: form.appellation.trim() || null,
    vintage: form.vintage ? parseInt(form.vintage, 10) : null,
    score: form.score,
    location_type: form.location_type,
    restaurant_name:
      form.location_type === 'restaurant' ? form.restaurant_name.trim() || null : null,
    drunk_at: form.drunk_at,
    food_pairing: form.food_pairing.trim() || null,
    photo_uri: form.photo_uri,
    comment: form.comment.trim() || null,
    companion: form.companion.trim() || null,
    buy_again: form.buy_again ? 1 : 0,
  };
}

export function wineToForm(wine: Wine): WineForm {
  return {
    name: wine.name,
    producer: wine.producer ?? '',
    appellation: wine.appellation ?? '',
    vintage: wine.vintage?.toString() ?? '',
    score: wine.score,
    location_type: wine.location_type,
    restaurant_name: wine.restaurant_name ?? '',
    drunk_at: wine.drunk_at,
    food_pairing: wine.food_pairing ?? '',
    photo_uri: wine.photo_uri,
    comment: wine.comment ?? '',
    companion: wine.companion ?? '',
    buy_again: wine.buy_again === 1,
  };
}
