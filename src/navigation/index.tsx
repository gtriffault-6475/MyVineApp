import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute, NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/context/ThemeContext';

import { CellarScreen } from '@/screens/CellarScreen';
import { DegustationsScreen } from '@/screens/DegustationsScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { WineDetailScreen } from '@/screens/WineDetailScreen';
import { WineEditScreen } from '@/screens/WineEditScreen';
import { AddScreen } from '@/screens/AddScreen';
import { CellarDetailScreen } from '@/screens/CellarDetailScreen';
import { AddCellarEntryScreen } from '@/screens/AddCellarEntryScreen';

// ─── Param lists ─────────────────────────────────────────────────────────────

export type MainTabParamList = {
  CellarTab: undefined;
  DegustationsTab: undefined;
  Search: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  WineDetail: { wineId: number };
  WineEdit: { wineId: number };
  AddWine: { cellarId?: number } | undefined;
  CellarDetail: { cellarId: number };
  AddCellarEntry: { entryId?: number };
};

// ─── Navigators ──────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Tab icon — outline inactive, filled active ────────────────────────────

type TabIconProps = {
  name: string;
  nameFilled: string;
  focused: boolean;
  color: string;
  size: number;
};

function TabIcon({ name, nameFilled, focused, color, size }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? nameFilled : name}
      size={size}
      color={color}
    />
  );
}

// ─── Tab navigator ────────────────────────────────────────────────────────────

function MainTabNavigator() {
  const { colors, isDark } = useTheme();
  const activeTint = isDark ? colors.scoreGold : colors.primary;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: isDark ? colors.textLight : colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: colors.background },
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
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="albums-outline" nameFilled="albums" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DegustationsTab"
        component={DegustationsScreen}
        options={{
          title: 'Dégustations',
          tabBarLabel: 'Dégustations',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="wine-outline" nameFilled="wine" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Rechercher',
          tabBarLabel: 'Recherche',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="search-outline" nameFilled="search" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Statistiques',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="bar-chart-outline" nameFilled="bar-chart" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          tabBarLabel: 'Paramètres',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="settings-outline" nameFilled="settings" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        contentStyle: { backgroundColor: colors.background, flex: 1 },
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
          title: 'Ajouter une dégustation',
          headerLeft: () => null,
        }}
      />
      <RootStack.Screen
        name="CellarDetail"
        component={CellarDetailScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
        name="AddCellarEntry"
        component={AddCellarEntryScreen}
        options={({ route }) => ({
          presentation: 'modal',
          title: route.params?.entryId ? 'Modifier la bouteille' : 'Ajouter à la cave',
          headerLeft: () => null,
        })}
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
