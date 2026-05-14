import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

const API_KEY_STORAGE_KEY = 'anthropic_api_key';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface RecognizedWine {
  name: string | null;
  producer: string | null;
  appellation: string | null;
  vintage: string | null;
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key.trim());
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export async function recognizeWineLabel(photoUri: string): Promise<RecognizedWine> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('Clé API non configurée. Rendez-vous dans les Paramètres.');
  }

  const fullUri = photoUri.startsWith('file://')
    ? photoUri
    : `${FileSystem.documentDirectory}${photoUri}`;

  const base64 = await FileSystem.readAsStringAsync(fullUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const ext = fullUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Analyse cette étiquette de vin et extrais les informations suivantes. Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.

Format attendu :
{"name":"<nom du vin>","producer":"<producteur ou domaine>","appellation":"<appellation ou AOC>","vintage":"<millésime (4 chiffres)>"}

Si une information est absente ou illisible, utilise null pour ce champ. Le millésime doit être une année à 4 chiffres ou null.`,
          },
        ],
      },
    ],
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `Erreur ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content.find((c) => c.type === 'text')?.text ?? '';

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as RecognizedWine;
    return {
      name: parsed.name ?? null,
      producer: parsed.producer ?? null,
      appellation: parsed.appellation ?? null,
      vintage: parsed.vintage ?? null,
    };
  } catch {
    throw new Error("Impossible d'interpréter la réponse du modèle.");
  }
}
