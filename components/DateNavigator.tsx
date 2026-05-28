import * as Haptics from 'expo-haptics';
import React from 'react';
import { Appearance, Text, TouchableOpacity, View } from 'react-native';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';

export default function DateNavigator({ customDateOffset, setCustomDateOffset, getCustomDateISO, formatDate }: any) {
  const { pref } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  const triggerHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  return (
    <View style={[s.row, { backgroundColor: activeTheme.card, padding: 10, borderRadius: 8, marginBottom: 15, justifyContent: 'center' }]}>
      <TouchableOpacity onPress={() => { triggerHaptic(); setCustomDateOffset((p: number) => p - 1); }} style={{ paddingHorizontal: 15 }}>
        <Text style={{fontSize: 20, color: activeTheme.primary}}>◀</Text>
      </TouchableOpacity>
      
      <View style={{ alignItems: 'center', width: 180 }}>
        <Text style={[s.subText, {fontSize: 11}]}>{t.date}</Text>
        <Text style={[s.text, {fontWeight: 'bold', color: customDateOffset === 0 ? activeTheme.success : activeTheme.warning}]}>
          {customDateOffset === 0 ? t.today : formatDate(getCustomDateISO(), t, pref.timeFormat, true)}
        </Text>
      </View>

      <TouchableOpacity onPress={() => { if(customDateOffset < 0) { triggerHaptic(); setCustomDateOffset((p: number) => p + 1); } }} style={{ paddingHorizontal: 15 }}>
        <Text style={{fontSize: 20, color: customDateOffset < 0 ? activeTheme.primary : activeTheme.bg}}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}