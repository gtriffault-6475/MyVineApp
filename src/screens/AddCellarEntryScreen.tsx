import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CellarForm } from '@/components/CellarForm';
import { useCellarContext } from '@/context/CellarContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { getDb } from '@/db/database';
import { insertCellarEntry, getCellarEntryById, updateCellarEntry } from '@/db/cellarQueries';
import { cellarFormToDb, cellarEntryToForm, EMPTY_CELLAR_FORM } from '@/types/cellar';
import type { RootStackParamList } from '@/navigation';

export function AddCellarEntryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddCellarEntry'>>();
  const { entryId } = route.params ?? {};
  const { state, dispatch } = useCellarContext();
  const { pickFromLibrary, pickFromCamera, toFullUri } = useImagePicker();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = entryId !== undefined;
  const existingEntry = isEdit ? state.entries.find((e) => e.id === entryId) : null;
  const initialForm = existingEntry ? cellarEntryToForm(existingEntry) : { ...EMPTY_CELLAR_FORM };

  const handlePickPhoto = () => {
    Alert.alert('Photo de la bouteille', 'Choisissez une source', [
      {
        text: 'Appareil photo',
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) setPhotoUri(uri);
        },
      },
      {
        text: 'Galerie',
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) setPhotoUri(uri);
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const [photoRelativeUri, setPhotoUri] = useState<string | null>(
    existingEntry?.photo_uri ?? null
  );

  const handleSubmit = async (form: typeof EMPTY_CELLAR_FORM) => {
    setSubmitting(true);
    try {
      const db = await getDb();
      const data = cellarFormToDb({ ...form, photo_uri: photoRelativeUri });
      if (isEdit && entryId !== undefined) {
        await updateCellarEntry(db, entryId, data);
        const updated = await getCellarEntryById(db, entryId);
        if (updated) dispatch({ type: 'UPDATE_ENTRY', payload: updated });
      } else {
        const id = await insertCellarEntry(db, data);
        const created = await getCellarEntryById(db, id);
        if (created) dispatch({ type: 'ADD_ENTRY', payload: created });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer la bouteille.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CellarForm
      initialForm={{ ...initialForm, photo_uri: photoRelativeUri }}
      photoFullUri={toFullUri(photoRelativeUri)}
      onPickPhoto={handlePickPhoto}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={isEdit ? 'Enregistrer les modifications' : 'Ajouter à la cave'}
      onCancel={() => navigation.goBack()}
    />
  );
}
