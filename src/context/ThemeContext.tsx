import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import RNFS from 'react-native-fs';
import {
  Colors,
  ShadowSet,
  lightColors,
  darkColors,
  lightShadow,
  darkShadow,
} from '@/components/ui/tokens';

export type AppearanceMode = 'auto' | 'light' | 'dark';

export type SerifStyle = {
  fontFamily: string;
  fontWeight: '600' | '700';
};

interface ThemeValue {
  colors: Colors;
  shadow: ShadowSet;
  isDark: boolean;
  /** Spread into a Text style to get the serif wine-name look (SemiBold). undefined in light mode. */
  serifFontWine: SerifStyle | undefined;
  /** Spread into a Text style to get the serif KPI look (Bold). undefined in light mode. */
  serifFontKpi: SerifStyle | undefined;
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
}

const SERIF_FAMILY = 'CormorantGaramond';

const PREFS_PATH = () => `${RNFS.DocumentDirectoryPath}/.myvine_prefs.json`;

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<AppearanceMode>('auto');

  useEffect(() => {
    (async () => {
      try {
        const path = PREFS_PATH();
        const exists = await RNFS.exists(path);
        if (exists) {
          const raw = await RNFS.readFile(path, 'utf8');
          const data = JSON.parse(raw);
          if (data.appearance && ['auto', 'light', 'dark'].includes(data.appearance)) {
            setAppearanceState(data.appearance as AppearanceMode);
          }
        }
      } catch {}
    })();
  }, []);

  const setAppearance = useCallback((mode: AppearanceMode) => {
    setAppearanceState(mode);
    RNFS.writeFile(PREFS_PATH(), JSON.stringify({ appearance: mode }), 'utf8').catch(() => {});
  }, []);

  const isDark =
    appearance === 'dark' ||
    (appearance === 'auto' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;
  const shadow = isDark ? darkShadow : lightShadow;
  const serifFontWine: SerifStyle | undefined = isDark
    ? { fontFamily: SERIF_FAMILY, fontWeight: '600' }
    : undefined;
  const serifFontKpi: SerifStyle | undefined = isDark
    ? { fontFamily: SERIF_FAMILY, fontWeight: '700' }
    : undefined;

  return (
    <ThemeContext.Provider
      value={{ colors, shadow, isDark, serifFontWine, serifFontKpi, appearance, setAppearance }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
