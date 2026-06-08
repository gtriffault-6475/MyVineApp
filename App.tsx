import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/context/ThemeContext';
import { WineProvider } from '@/context/WineContext';
import { CellarProvider } from '@/context/CellarContext';
import { RootNavigator } from '@/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <WineProvider>
            <CellarProvider>
              <RootNavigator />
            </CellarProvider>
          </WineProvider>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
