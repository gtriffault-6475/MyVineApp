import React, { useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useWineContext } from '@/context/WineContext';
import { updateWine, getWineById } from '@/db/queries';
import { WineForm } from '@/components/WineForm';
import { useWineForm } from '@/hooks/useWineForm';
import { useImagePicker } from '@/hooks/useImagePicker';
import { wineFormToDb, wineToForm } from '@/types/wine';
import { colors } from '@/components/ui/tokens';

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const { state, dispatch } = useWineContext();

  const wine = state.wines.find((w) => w.id === parseInt(id, 10));

  const { form, errors, update, validate } = useWineForm(wine ? wineToForm(wine) : undefined);
  const { pickFromLibrary, pickFromCamera, deletePhoto, toFullUri } = useImagePicker();
  const [submitting, setSubmitting] = useState(false);

  if (!wine) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handlePickPhoto = () => {
    Alert.alert("Photo de l'étiquette", 'Choisissez une source', [
      {
        text: 'Appareil photo',
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) {
            if (form.photo_uri) await deletePhoto(form.photo_uri);
            update('photo_uri', uri);
          }
        },
      },
      {
        text: 'Galerie',
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) {
            if (form.photo_uri) await deletePhoto(form.photo_uri);
            update('photo_uri', uri);
          }
        },
      },
      {
        text: 'Supprimer la photo',
        style: 'destructive',
        onPress: async () => {
          if (form.photo_uri) await deletePhoto(form.photo_uri);
          update('photo_uri', null);
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = wineFormToDb(form);
      await updateWine(db, wine.id, data);
      const updated = await getWineById(db, wine.id);
      if (updated) dispatch({ type: 'UPDATE_WINE', payload: updated });
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le vin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WineForm
      form={form}
      errors={errors}
      update={update}
      onSubmit={handleSubmit}
      onPickPhoto={handlePickPhoto}
      photoFullUri={toFullUri(form.photo_uri)}
      submitting={submitting}
      submitLabel="Enregistrer les modifications"
    />
  );
}
