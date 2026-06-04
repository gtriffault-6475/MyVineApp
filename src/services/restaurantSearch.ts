import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'myvineapp-foursquare';
const SEARCH_URL = 'https://places-api.foursquare.com/places/search';
const FSQ_API_VERSION = '2025-06-17';

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
    limit: '5',
  });

  const response = await fetch(`${SEARCH_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-Places-Api-Version': FSQ_API_VERSION,
    },
    signal,
  });

  if (!response.ok) {
    return [];
  }

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
