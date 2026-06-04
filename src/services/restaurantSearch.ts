import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'myvineapp-foursquare';
const API_URL = 'https://api.foursquare.com/v3/places/search';

export interface RestaurantSuggestion {
  id: string;
  name: string;
  address: string | null;
}

export async function saveFoursquareKey(key: string): Promise<void> {
  await Keychain.setGenericPassword('foursquare_api_key', key.trim(), { service: KEYCHAIN_SERVICE });
}

export async function getFoursquareKey(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  return creds ? creds.password : null;
}

export async function deleteFoursquareKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}

export async function searchRestaurants(
  query: string,
  signal?: AbortSignal,
): Promise<RestaurantSuggestion[]> {
  const apiKey = await getFoursquareKey();
  if (!apiKey || !query.trim()) return [];

  const params = new URLSearchParams({
    query: query.trim(),
    categories: '13000',
    limit: '5',
    fields: 'fsq_id,name,location',
  });

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: apiKey },
    signal,
  });

  if (!response.ok) return [];

  const data = await response.json() as {
    results: Array<{
      fsq_id: string;
      name: string;
      location?: { formatted_address?: string };
    }>;
  };

  return (data.results ?? []).map((r) => ({
    id: r.fsq_id,
    name: r.name,
    address: r.location?.formatted_address ?? null,
  }));
}
