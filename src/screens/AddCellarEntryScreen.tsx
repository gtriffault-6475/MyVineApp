import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CellarForm } from '@/components/CellarForm';
import { useCellarContext } from '@/context/CellarContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useTheme } from '@/context/ThemeContext';
import { getDb } from '@/db/database';
import { insertCellarEntry, getCellarEntryById, updateCellarEntry } from '@/db/cellarQueries';
import { cellarFormToDb, cellarEntryToForm, EMPTY_CELLAR_FORM } from '@/types/cellar';
import { spacing, font, radius } from '@/components/ui/tokens';
import type { RootStackParamList } from '@/navigation';

export function AddCellarEntryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddCellarEntry'>>();
  const { entryId, caveId: routeCaveId } = route.params ?? {};
  const { state, dispatch } = useCellarContext();
  const { pickFromLibrary, pickFromCamera, toFullUri } = useImagePicker();
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = entryId !== undefined;
  const existingEntry = isEdit ? state.entries.find((e) => e.id === entryId) : null;
  const initialForm = existingEntry ? cellarEntryToForm(existingEntry) : { ...EMPTY_CELLAR_FORM };

  const defaultCaveId = routeCaveId ?? existingEntry?.cave_id ?? state.caves[0]?.id ?? null;
  const [selectedCaveId, setSelectedCaveId] = useState<number | null>(defaultCaveId);

  const showCavePicker = state.caves.length > 1;

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
      const data = { ...cellarFormToDb({ ...form, photo_uri: photoRelativeUri }), cave_id: selectedCaveId };
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
      headerSlot={
        showCavePicker ? (
          <View style={styles.pickerBlock}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Cave</Text>
            <View style={styles.pickerRow}>
              {state.caves.map((cave) => (
                <TouchableOpacity
                  key={cave.id}
                  style={[
                    styles.caveChip,
                    {
                      backgroundColor:
                        selectedCaveId === cave.id ? colors.primary : colors.surface,
                      borderColor:
                        selectedCaveId === cave.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCaveId(cave.id)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.caveChipText,
                      { color: selectedCaveId === cave.id ? colors.white : colors.text },
                    ]}
                  >
                    {cave.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  pickerBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  pickerLabel: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  caveChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  caveChipText: {
    fontSize: font.sizeMd,
    fontWeight: font.weightMedium,
  },
});
