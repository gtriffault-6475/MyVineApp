import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { searchRestaurants, type RestaurantSuggestion } from '@/services/restaurantSearch';
import { spacing, font, radius } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  containerStyle?: ViewStyle;
}

export function RestaurantAutocomplete({ value, onChangeText, containerStyle }: Props) {
  const { colors, shadow } = useTheme();
  const [suggestions, setSuggestions] = useState<RestaurantSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleChange = useCallback((text: string) => {
    onChangeText(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const results = await searchRestaurants(text, abortRef.current.signal);
        setSuggestions(results);
      } catch {
        // Silently ignore — network errors, missing API key, user aborted
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [onChangeText]);

  const handleSelect = (suggestion: RestaurantSuggestion) => {
    onChangeText(suggestion.name);
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => setSuggestions([]), 150);
  };

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Nom du restaurant</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleChange}
          onBlur={handleBlur}
          placeholder="ex: Le Grand Véfour"
          placeholderTextColor={colors.textLight}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.textMuted} style={styles.spinner} />
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.white, borderColor: colors.border }, shadow.md]}>
          {suggestions.map((s, index) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.suggestion,
                index < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              onPress={() => handleSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionName, { color: colors.text }]} numberOfLines={1}>
                {s.name}
              </Text>
              {s.address ? (
                <Text style={[styles.suggestionAddress, { color: colors.textMuted }]} numberOfLines={1}>
                  {s.address}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: font.sizeLg,
    paddingVertical: spacing.md,
  },
  spinner: {
    marginLeft: spacing.sm,
  },
  dropdown: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  suggestionName: {
    fontSize: font.sizeMd,
    fontWeight: font.weightMedium,
  },
  suggestionAddress: {
    fontSize: font.sizeSm,
    marginTop: 2,
  },
});
