import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { WineForm } from '@/components/WineForm';
import { useWineForm, EMPTY_FORM } from '@/hooks/useWineForm';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useWineContext } from '@/context/WineContext';
import { insertWine, getWineById } from '@/db/queries';
import { wineFormToDb } from '@/types/wine';

export default function AddScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { dispatch } = useWineContext();
  const { form, errors, update, validate } = useWineForm(EMPTY_FORM);
  const { pickFromLibrary, pickFromCamera, toFullUri } = useImagePicker();
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = () => {
    Alert.alert("Photo de l’étiquette", 'Choisissez une source', [
      {
        text: 'Appareil photo',
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) update('photo_uri', uri);
        },
      },
      {
        text: 'Galerie',
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) update('photo_uri', uri);
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
      const id = await insertWine(db, data);
      const wine = await getWineById(db, id);
      if (wine) dispatch({ type: 'ADD_WINE', payload: wine });
      router.dismiss();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer le vin.");
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
      submitLabel="Ajouter ce vin"
      showCancel
      onCancel={() => router.dismiss()}
    />
  );
}
