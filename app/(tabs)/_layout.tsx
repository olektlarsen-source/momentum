import { Tabs } from 'expo-router';
import React from 'react';
import { Appearance } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { themes } from '../../constants/themes';

export default function TabLayout() {
  const systemScheme = Appearance.getColorScheme();
  const activeColor = systemScheme === 'dark' ? themes.dark.primary : themes.light.primary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Momentum',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}