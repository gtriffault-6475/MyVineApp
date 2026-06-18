import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'myvineapp-foursquare';
const SEARCH_URL = 'https://places-api.foursquare.com/places/search';
const FSQ_API_VERSION = '2024-06-01';

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
  coords?: { latitude: number; longitude: number } | null,
  signal?: AbortSignal,
): Promise<RestaurantSuggestion[]> {
  const apiKey = await getFoursquareKey();
  if (!apiKey || !query.trim()) return [];

  const paramObj: Record<string, string> = {
    query: query.trim(),
    limit: '8',
  };
  if (coords) {
    paramObj.ll = `${coords.latitude},${coords.longitude}`;
    paramObj.radius = '5000';
  }
  const queryString = Object.entries(paramObj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const response = await fetch(`${SEARCH_URL}?${queryString}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-Places-Api-Version': FSQ_API_VERSION,
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`FSQ_${response.status}`);
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
