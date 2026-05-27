import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute, NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { colors } from '@/components/ui/tokens';

import { CellarScreen } from '@/screens/CellarScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { WineDetailScreen } from '@/screens/WineDetailScreen';
import { WineEditScreen } from '@/screens/WineEditScreen';
import { AddScreen } from '@/screens/AddScreen';

// ─── Param lists ─────────────────────────────────────────────────────────────

export type MainTabParamList = {
  CellarTab: undefined;
  Search: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  WineDetail: { wineId: number };
  WineEdit: { wineId: number };
  AddWine: undefined;
};

// ─── Navigators ──────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Tab icon ─────────────────────────────────────────────────────────────────

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.55 }}>
      {emoji}
    </Text>
  );
}

// ─── Tab navigator ────────────────────────────────────────────────────────────

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: colors.white },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', fontSize: 18, color: colors.text },
      }}
    >
      <Tab.Screen
        name="CellarTab"
        component={CellarScreen}
        options={{
          title: 'Ma cave',
          tabBarLabel: 'Cave',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Rechercher',
          tabBarLabel: 'Recherche',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Statistiques',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          tabBarLabel: 'Paramètres',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        contentStyle: { backgroundColor: colors.white, flex: 1 },
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="WineDetail"
        component={WineDetailScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
        name="WineEdit"
        component={WineEditScreen}
        options={{ title: 'Modifier' }}
      />
      <RootStack.Screen
        name="AddWine"
        component={AddScreen}
        options={{
          presentation: 'modal',
          title: 'Ajouter un vin',
          headerLeft: () => null,
        }}
      />
    </RootStack.Navigator>
  );
}

// ─── Typed hooks ──────────────────────────────────────────────────────────────

export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useAppRoute<RouteName extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, RouteName>>();
}
