import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { spacing, font, radius } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  label?: string;
  modalTitle?: string;
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

export function DatePickerField({ label = 'Date', modalTitle, value, onChange, error }: Props) {
  const { colors } = useTheme();
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
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: colors.white, borderColor: error ? colors.error : colors.border },
        ]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, { color: value ? colors.text : colors.textLight }]}>
          {value ? formatDisplay(value) : 'Sélectionner une date'}
        </Text>
        <Text style={[styles.chevron, { color: colors.textLight }]}>›</Text>
      </TouchableOpacity>
      {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
          <View style={[styles.sheet, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>Effacer</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {modalTitle ?? 'Sélectionner une date'}
              </Text>
              <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.confirmBtn, { color: colors.primary }]}>Confirmer</Text>
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
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  valueText: {
    fontSize: font.sizeMd,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
    transform: [{ rotate: '90deg' }],
  },
  errorText: {
    fontSize: font.sizeSm,
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
  },
  sheetTitle: {
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
  },
  clearBtn: {
    fontSize: font.sizeMd,
  },
  confirmBtn: {
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
  },
  picker: {
    marginHorizontal: spacing.md,
  },
});
