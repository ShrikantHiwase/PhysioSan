/**
 * Tab layout with horizontal swipe animation using react-native-tab-view
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors } from '../../src/constants/physioTheme';

import DashboardScreen from './index';
import DailyExercisesScreen from './daily-exercises';
import ProgressScreen from './progress';
import ProfileScreen from './profile';

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ROUTES = [
  { key: 'index', title: 'Dashboard', icon: 'home' as TabIconName, iconOutline: 'home-outline' as TabIconName },
  { key: 'daily-exercises', title: 'Exercises', icon: 'fitness' as TabIconName, iconOutline: 'fitness-outline' as TabIconName },
  { key: 'progress', title: 'Progress', icon: 'stats-chart' as TabIconName, iconOutline: 'stats-chart-outline' as TabIconName },
  { key: 'profile', title: 'Profile', icon: 'person' as TabIconName, iconOutline: 'person-outline' as TabIconName },
];

const SCREENS = [DashboardScreen, DailyExercisesScreen, ProgressScreen, ProfileScreen];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState(0);

  // Don't use router.replace - it causes Expo Router to re-render and reset to Dashboard.
  // TabView state is the single source of truth for tab selection.
  const onIndexChange = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      const i = TAB_ROUTES.findIndex((r) => r.key === route.key);
      const Screen = SCREENS[i];
      return Screen ? (
        <View style={styles.sceneContainer}>
          <Screen />
        </View>
      ) : null;
    },
    []
  );

  const renderTabBar = useCallback(
    () => (
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
        {TAB_ROUTES.map((tab, i) => (
          <Pressable
            key={tab.key}
            onPress={() => onIndexChange(i)}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              {index === i && <View style={[styles.activeIndicator, { backgroundColor: PhysioColors.primary }]} />}
              <Ionicons
                name={index === i ? tab.icon : tab.iconOutline}
                size={24}
                color={index === i ? PhysioColors.primary : PhysioColors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, index === i && styles.tabLabelActive]}>{tab.title}</Text>
          </Pressable>
        ))}
      </View>
    ),
    [index, onIndexChange, insets.bottom]
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes: TAB_ROUTES }}
        renderScene={renderScene}
        onIndexChange={onIndexChange}
        renderTabBar={renderTabBar}
        initialLayout={{ width }}
        swipeEnabled={true}
        animationEnabled={true}
        tabBarPosition="bottom"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  sceneContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: PhysioColors.surface,
    borderTopWidth: 1,
    borderTopColor: PhysioColors.cardBorder,
    paddingTop: 8,
    elevation: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    color: PhysioColors.textMuted,
  },
  tabLabelActive: {
    color: PhysioColors.primary,
  },
});
