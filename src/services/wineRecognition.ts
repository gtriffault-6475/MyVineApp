import RNFS from 'react-native-fs';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'myvineapp';
const API_URL = 'https://api.anthropic.com/v1/messages';

export interface RecognizedWine {
  name: string | null;
  producer: string | null;
  appellation: string | null;
  vintage: string | null;
}

export async function saveApiKey(key: string): Promise<void> {
  await Keychain.setGenericPassword('anthropic_api_key', key.trim(), { service: KEYCHAIN_SERVICE });
}

export async function getApiKey(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  return creds ? creds.password : null;
}

export async function deleteApiKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}

export async function recognizeWineLabel(photoUri: string): Promise<RecognizedWine> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('Clé API non configurée. Rendez-vous dans les Paramètres.');

  // photoUri is a file:// URI or relative path
  const fullPath = photoUri.startsWith('file://')
    ? photoUri.replace('file://', '')
    : `${RNFS.DocumentDirectoryPath}/${photoUri}`;

  const base64 = await RNFS.readFile(fullPath, 'base64');
  const ext = fullPath.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: `Analyse cette étiquette de vin et extrais les informations suivantes. Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.\n\nFormat attendu :\n{"name":"<nom du vin>","producer":"<producteur ou domaine>","appellation":"<appellation ou AOC>","vintage":"<millésime (4 chiffres)>"}\n\nSi une information est absente ou illisible, utilise null pour ce champ.` },
      ],
    }],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Erreur ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim()) as RecognizedWine;
    return { name: parsed.name ?? null, producer: parsed.producer ?? null, appellation: parsed.appellation ?? null, vintage: parsed.vintage ?? null };
  } catch {
    throw new Error("Impossible d'interpréter la réponse du modèle.");
  }
}
