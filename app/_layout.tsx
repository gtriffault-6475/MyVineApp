import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { WineProvider } from '@/context/WineContext';
import { runMigrations } from '@/db/migrations';
import { DB_NAME } from '@/db/schema';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      onInit={runMigrations}
      useSuspense
    >
      <WineProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: false,
            headerTintColor: '#722F37',
            headerTitleStyle: { fontWeight: '600', color: '#1A1A1A' },
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add"
            options={{
              presentation: 'modal',
              title: 'Nouveau vin',
              headerLeft: () => null,
            }}
          />
          <Stack.Screen name="wine/[id]" options={{ title: '' }} />
          <Stack.Screen name="wine/[id]/edit" options={{ title: 'Modifier' }} />
        </Stack>
      </WineProvider>
    </SQLiteProvider>
  );
}
