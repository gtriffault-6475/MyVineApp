import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WineForm } from '@/components/WineForm';
import { useWineForm, EMPTY_FORM } from '@/hooks/useWineForm';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useWineContext } from '@/context/WineContext';
import { getDb } from '@/db/database';
import { insertWine, getWineById } from '@/db/queries';
import { wineFormToDb } from '@/types/wine';
import { recognizeWineLabel, getApiKey } from '@/services/wineRecognition';
import type { RootStackParamList } from '@/navigation';

export function AddScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { dispatch } = useWineContext();
  const { form, errors, update, validate } = useWineForm(EMPTY_FORM);
  const { pickFromLibrary, pickFromCamera, toFullUri } = useImagePicker();
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeLabel = async (uri: string) => {
    const apiKey = await getApiKey();
    if (!apiKey) return;

    Alert.alert(
      "Analyser l'étiquette",
      "Voulez-vous que l'IA remplisse automatiquement les informations du vin ?",
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            setAnalyzing(true);
            try {
              const result = await recognizeWineLabel(uri);
              if (result.name) update('name', result.name);
              if (result.producer) update('producer', result.producer);
              if (result.appellation) update('appellation', result.appellation);
              if (result.vintage) update('vintage', result.vintage);
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "Analyse impossible.";
              Alert.alert('Erreur', msg);
            } finally {
              setAnalyzing(false);
            }
          },
        },
      ]
    );
  };

  const handlePickPhoto = () => {
    Alert.alert("Photo de l'étiquette", 'Choisissez une source', [
      {
        text: 'Appareil photo',
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) {
            update('photo_uri', uri);
            analyzeLabel(uri);
          }
        },
      },
      {
        text: 'Galerie',
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) {
            update('photo_uri', uri);
            analyzeLabel(uri);
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const db = await getDb();
      const data = wineFormToDb(form);
      const id = await insertWine(db, data);
      const wine = await getWineById(db, id);
      if (wine) dispatch({ type: 'ADD_WINE', payload: wine });
      navigation.goBack();
    } catch {
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
      submitting={submitting || analyzing}
      submitLabel={analyzing ? "Analyse en cours…" : "Ajouter ce vin"}
      showCancel
      onCancel={() => navigation.goBack()}
    />
  );
}
