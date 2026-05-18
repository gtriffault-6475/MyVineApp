import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const PHOTOS_DIR = 'wine-photos';

async function ensurePhotosDir(): Promise<string> {
  const dir = `${RNFS.DocumentDirectoryPath}/${PHOTOS_DIR}`;
  const exists = await RNFS.exists(dir);
  if (!exists) await RNFS.mkdir(dir);
  return dir;
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useImagePicker() {
  async function pickFromLibrary(): Promise<string | null> {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]?.uri) return null;
    return copyToLocal(result.assets[0].uri);
  }

  async function pickFromCamera(): Promise<string | null> {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]?.uri) return null;
    return copyToLocal(result.assets[0].uri);
  }

  async function copyToLocal(uri: string): Promise<string> {
    const dir = await ensurePhotosDir();
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${uuid()}.${ext}`;
    const destPath = `${dir}/${filename}`;
    // RNFS.copyFile expects paths without file:// prefix
    await RNFS.copyFile(uri.replace('file://', ''), destPath);
    return `${PHOTOS_DIR}/${filename}`;
  }

  async function deletePhoto(relativeUri: string): Promise<void> {
    try {
      const fullPath = `${RNFS.DocumentDirectoryPath}/${relativeUri}`;
      const exists = await RNFS.exists(fullPath);
      if (exists) await RNFS.unlink(fullPath);
    } catch { /* best-effort */ }
  }

  function toFullUri(relativeUri: string | null): string | null {
    if (!relativeUri) return null;
    return `file://${RNFS.DocumentDirectoryPath}/${relativeUri}`;
  }

  return { pickFromLibrary, pickFromCamera, deletePhoto, toFullUri };
}
