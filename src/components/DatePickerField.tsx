import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, font, radius } from './ui/tokens';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function parseDate(value: string): Date {
  if (!value) return new Date();
  const d = new Date(value + 'T12:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const d = new Date(value + 'T12:00:00');
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePickerField({ label = 'Date', value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const handleOpen = () => {
    setTempDate(parseDate(value));
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(toISODate(tempDate));
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, !!error && styles.fieldError]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : 'Sélectionner une date'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleCancel}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearBtn}>Effacer</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Date de dégustation</Text>
              <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.confirmBtn}>Confirmer</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => { if (date) setTempDate(date); }}
              maximumDate={new Date()}
              locale="fr-FR"
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  fieldError: {
    borderColor: colors.error,
  },
  valueText: {
    fontSize: font.sizeMd,
    color: colors.text,
  },
  placeholder: {
    color: colors.textLight,
  },
  chevron: {
    fontSize: 20,
    color: colors.textLight,
    lineHeight: 22,
    transform: [{ rotate: '90deg' }],
  },
  errorText: {
    fontSize: font.sizeSm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
    color: colors.text,
  },
  clearBtn: {
    fontSize: font.sizeMd,
    color: colors.textMuted,
  },
  confirmBtn: {
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
    color: colors.primary,
  },
  picker: {
    marginHorizontal: spacing.md,
  },
});
