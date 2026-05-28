import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Appearance, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';

export default function CurrentSessionItem({ ex, index, removeFromSession, updateNote }: any) {
  const { pref } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  const [expanded, setExpanded] = useState(true); // Åpen som standard for bedre oversikt
  const [checkedSets, setCheckedSets] = useState<boolean[]>(new Array(ex.sets?.length || 0).fill(false));
  const [intervalChecked, setIntervalChecked] = useState(false);

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const getSetDisplay = (sets: any[], idx: number) => {
    const type = sets[idx].type;
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      if (sets[i].type === type) count++;
    }
    const typeChar = type === 'S' ? 'S' : (pref.lang === 'no' ? 'O' : 'W');
    return `${typeChar}${count}`;
  };

  const toggleSet = (idx: number) => {
    triggerHaptic();
    const newChecked = [...checkedSets];
    newChecked[idx] = !newChecked[idx];
    setCheckedSets(newChecked);
  };

  const toggleInterval = () => {
    triggerHaptic();
    setIntervalChecked(!intervalChecked);
  };

  return (
    <View style={[s.card, { marginBottom: 10, padding: 10 }]}>
      <TouchableOpacity onPress={() => { triggerHaptic(); setExpanded(!expanded); }} style={s.row}>
        <Text style={[s.text, { fontWeight: 'bold' }]}>{index + 1}. {ex.name}</Text>
        <Text style={s.subText}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={{ marginTop: 10 }}>
          {ex.isInterval ? (
            <TouchableOpacity 
              style={[s.row, { paddingVertical: 10, borderBottomWidth: 1, borderColor: activeTheme.border, opacity: intervalChecked ? 0.5 : 1 }]} 
              onPress={toggleInterval}
            >
              <Text style={[s.text, intervalChecked && { textDecorationLine: 'line-through' }]}>{ex.details}</Text>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: intervalChecked ? activeTheme.success : activeTheme.subText, backgroundColor: intervalChecked ? activeTheme.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {intervalChecked && <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
              </View>
            </TouchableOpacity>
          ) : (
            ex.sets.map((set: any, i: number) => (
              <TouchableOpacity 
                key={i} 
                style={[s.row, { paddingVertical: 10, borderBottomWidth: 1, borderColor: activeTheme.border, opacity: checkedSets[i] ? 0.5 : 1 }]} 
                onPress={() => toggleSet(i)}
              >
                <Text style={[s.text, checkedSets[i] && { textDecorationLine: 'line-through' }]}>
                  {t.set} {getSetDisplay(ex.sets, i)}: {set.weight} {set.unit} x {set.reps}
                </Text>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: checkedSets[i] ? activeTheme.success : activeTheme.subText, backgroundColor: checkedSets[i] ? activeTheme.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {checkedSets[i] && <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))
          )}
          
          {ex.timer != null && (
            <Text style={[s.subText, { marginTop: 10, color: activeTheme.primary }]}>⏱ Totaltid: {ex.timer} s</Text>
          )}

          <TextInput 
            style={[s.input, { marginTop: 15, fontSize: 14, padding: 8 }]} 
            placeholder={t.note} placeholderTextColor={activeTheme.subText}
            value={ex.note || ''} onChangeText={(v) => updateNote(ex.id, v)}
          />
          <TouchableOpacity style={{ marginTop: 15, paddingVertical: 5 }} onPress={() => { triggerHaptic(); removeFromSession(ex.id); }}>
            <Text style={{ color: activeTheme.danger, fontWeight: 'bold' }}>✕ Fjern øvelse</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}