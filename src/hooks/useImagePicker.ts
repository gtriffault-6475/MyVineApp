import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import 'react-native';

const PHOTOS_DIR = 'wine-photos/';

async function ensurePhotosDir() {
  const dir = `${FileSystem.documentDirectory}${PHOTOS_DIR}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useImagePicker() {
  const [picking, setPicking] = useState(false);

  async function pickFromLibrary(): Promise<string | null> {
    setPicking(true);
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (result.canceled) return null;
      return await copyToLocal(result.assets[0].uri);
    } finally {
      setPicking(false);
    }
  }

  async function pickFromCamera(): Promise<string | null> {
    setPicking(true);
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (result.canceled) return null;
      return await copyToLocal(result.assets[0].uri);
    } finally {
      setPicking(false);
    }
  }

  async function copyToLocal(uri: string): Promise<string> {
    const dir = await ensurePhotosDir();
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${uuid()}.${ext}`;
    const dest = `${dir}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return `${PHOTOS_DIR}${filename}`;
  }

  async function deletePhoto(relativeUri: string): Promise<void> {
    try {
      const full = `${FileSystem.documentDirectory}${relativeUri}`;
      await FileSystem.deleteAsync(full, { idempotent: true });
    } catch {
      // best-effort
    }
  }

  function toFullUri(relativeUri: string | null): string | null {
    if (!relativeUri) return null;
    return `${FileSystem.documentDirectory}${relativeUri}`;
  }

  return { picking, pickFromLibrary, pickFromCamera, deletePhoto, toFullUri };
}
