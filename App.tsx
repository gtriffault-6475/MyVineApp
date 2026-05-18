import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WineProvider } from '@/context/WineContext';
import { RootNavigator } from '@/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <WineProvider>
          <RootNavigator />
        </WineProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
