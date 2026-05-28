import * as Haptics from 'expo-haptics';
import React from 'react';
import { Appearance, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';
import CurrentSessionItem from './CurrentSessionItem';
import DateNavigator from './DateNavigator';
import ExerciseInput from './ExerciseInput';

export default function WorkoutTab({ 
  customDateOffset, setCustomDateOffset, getCustomDateISO, formatDate,
  setIntervalModal, setPlanModal, finishWorkout 
}: any) {
  const { pref, session, setSession, logs } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const getHistoryFor = (exName: string) => {
    if (!logs || !exName) return null;
    
    for (const log of logs) {
      if (!log || !log.exercises) continue;
      
      // Trygg graving i historikken
      const found = log.exercises.find((e: any) => e && e.name && e.name.toLowerCase() === exName.toLowerCase());
      
      if (found && found.sets) {
        return {
          label: `Sist: ${found.sets.map((st: any) => `${st?.weight || 0} ${st?.unit || 'kg'} x ${st?.reps || 0}`).join(' | ')}`,
          sets: found.sets,
          muscle: found?.muscle || ''
        };
      }
    }
    return null;
  };

  const handleAddExercise = (name: string, sets: any[], timer: number | null, muscle: string) => {
    const validSets = sets.filter(x => x.weight !== '' || x.reps !== '');
    if (validSets.length === 0) return;
    
    const newSession = [...session, { 
      id: Date.now().toString(), 
      name: name.trim(), 
      sets: validSets, 
      isInterval: false, 
      note: '',
      timer: timer,
      muscle: muscle || ''
    }];
    setSession(newSession);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <DateNavigator 
        customDateOffset={customDateOffset} setCustomDateOffset={setCustomDateOffset} 
        getCustomDateISO={getCustomDateISO} formatDate={formatDate} 
      />

      <View style={s.row}>
        <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary, marginRight: 5 }]} onPress={() => { triggerHaptic(); setIntervalModal(true); }}>
          <Text style={[s.btnText, { color: activeTheme.primary }]}>{t.addIntervalBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary, marginLeft: 5 }]} onPress={() => { triggerHaptic(); setPlanModal(true); }}>
          <Text style={[s.btnText, { color: activeTheme.primary }]}>📋 {t.plans}</Text>
        </TouchableOpacity>
      </View>

      <ExerciseInput onAddExercise={handleAddExercise} getHistoryFor={getHistoryFor} />

      {session.length > 0 && (
        <View style={[s.card, { backgroundColor: 'transparent', shadowOpacity: 0, padding: 0, marginTop: 15 }]}>
          <Text style={[s.subTitle, { marginBottom: 10 }]}>{t.today}:</Text>
          {session.map((ex: any, i: number) => (
            <CurrentSessionItem 
              key={ex.id} ex={ex} index={i} 
              removeFromSession={(id: string) => setSession(session.filter((x: any) => x.id !== id))} 
              updateNote={(id: string, note: string) => setSession(session.map((x: any) => x.id === id ? {...x, note} : x))} 
            />
          ))}
          <TouchableOpacity style={[s.btn, { marginTop: 15, backgroundColor: activeTheme.primary }]} onPress={finishWorkout}>
            <Text style={s.btnText}>{t.finish}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{height: 50}} />
    </ScrollView>
  );
}