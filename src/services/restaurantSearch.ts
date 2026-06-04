import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'myvineapp-foursquare';
const AUTOCOMPLETE_URL = 'https://api.foursquare.com/v3/autocomplete';

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
    types: 'place',
    limit: '5',
  });

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params}`, {
    headers: { Authorization: apiKey },
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn(`[Foursquare] ${response.status}`, body);
    return [];
  }

  const data = await response.json() as {
    results: Array<{
      type: string;
      place?: {
        fsq_id: string;
        name: string;
        location?: { formatted_address?: string };
      };
    }>;
  };

  return (data.results ?? [])
    .filter((r) => r.type === 'place' && r.place)
    .map((r) => ({
      id: r.place!.fsq_id,
      name: r.place!.name,
      address: r.place!.location?.formatted_address ?? null,
    }));
}
