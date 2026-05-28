import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Appearance, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { defaultDB } from '../constants/exercises';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';

const MUSCLES = ['Bryst', 'Rygg', 'Bein', 'Skuldre', 'Armer', 'Kjerne'];

export default function ExerciseInput({ onAddExercise, getHistoryFor }: any) {
  const { pref, logs } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  const [exercise, setExercise] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sets, setSets] = useState([{ id: Date.now().toString(), weight: '', reps: '', unit: 'kg', type: 'S' }]);
  
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [muscle, setMuscle] = useState('');

  const weightRefs = useRef<any>([]);
  const repsRefs = useRef<any>([]);

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getCombinedDB = () => {
    const historyNames = Array.from(new Set(logs.flatMap((l: any) => l.exercises?.map((e: any) => e?.name) || [])));
    const custom = historyNames
      .filter(name => name && !defaultDB.some(db => db.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ name, en: name, tags: [name?.toLowerCase()] }));
    return [...defaultDB, ...custom];
  };

  const handleExerciseInput = (text: string) => {
    setExercise(text);
    if (text.length > 0) {
      const combinedDB = getCombinedDB();
      const matches = combinedDB.filter(e => 
        e?.name?.toLowerCase().includes(text.toLowerCase()) || 
        (e?.en && e.en.toLowerCase().includes(text.toLowerCase())) ||
        (e?.tags && e.tags.some((tag: string) => tag.includes(text.toLowerCase())))
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (name: string) => { 
    triggerHaptic(); 
    setExercise(name); 
    setSuggestions([]); 
  };

  const toggleUnit = (index: number) => {
    triggerHaptic();
    const n = [...sets];
    n[index].unit = n[index].unit === 'kg' ? 'lbs' : 'kg';
    setSets(n);
  };

  const getSetDisplay = (allSets: any[], index: number) => {
    const type = allSets[index].type;
    let count = 0;
    for (let i = 0; i <= index; i++) {
      if (allSets[i].type === type) count++;
    }
    const typeChar = type === 'S' ? 'S' : (pref.lang === 'no' ? 'O' : 'W');
    return `${typeChar}${count}`;
  };

  const handleAdd = () => {
    onAddExercise(exercise, sets, isAdvanced ? timer : null, isAdvanced ? muscle : '');
    setExercise('');
    setSuggestions([]);
    setSets([{ id: Date.now().toString(), weight: '', reps: '', unit: sets[sets.length-1]?.unit || 'kg', type: 'S' }]);
    setTimer(0);
    setIsTimerRunning(false);
    setMuscle('');
  };

  const historyData = exercise.trim().length > 0 && getHistoryFor ? getHistoryFor(exercise) : null;

  const handleAutofill = () => {
    triggerHaptic();
    if (!historyData || !historyData.sets) return;
    
    const freshSets = historyData.sets.map((s: any) => ({...s, id: Date.now().toString() + Math.random()}));
    setSets(freshSets);
    
    if (historyData.muscle) {
      setIsAdvanced(true);
      setMuscle(historyData.muscle);
    }
  };

  return (
    <View style={[s.card, { marginTop: 15 }]}>
      
      {/* ADVANCED TOGGLE - NÅ PÅ TOPPEN */}
      <View style={[s.row, { marginBottom: isAdvanced ? 5 : 15, borderBottomWidth: isAdvanced ? 0 : 1, borderColor: activeTheme.border, paddingBottom: isAdvanced ? 0 : 10, justifyContent: 'flex-end' }]}>
        <View style={{ flexDirection: 'row', backgroundColor: activeTheme.bg, borderRadius: 8, padding: 2 }}>
          <TouchableOpacity 
            style={{ paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, backgroundColor: !isAdvanced ? activeTheme.card : 'transparent' }}
            onPress={() => { triggerHaptic(); setIsAdvanced(false); }}
          >
            <Text style={{ fontSize: 13, color: !isAdvanced ? activeTheme.text : activeTheme.subText, fontWeight: !isAdvanced ? 'bold' : 'normal' }}>Basic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, backgroundColor: isAdvanced ? activeTheme.card : 'transparent' }}
            onPress={() => { triggerHaptic(); setIsAdvanced(true); }}
          >
            <Text style={{ fontSize: 13, color: isAdvanced ? activeTheme.text : activeTheme.subText, fontWeight: isAdvanced ? 'bold' : 'normal' }}>Advanced</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ADVANCED-MENY (Før Øvelsesfeltet) */}
      {isAdvanced && (
        <View style={{ backgroundColor: activeTheme.bg, padding: 10, borderRadius: 8, marginBottom: 15 }}>
          
          <View style={[s.row, { marginBottom: 15 }]}>
            <Text style={s.text}>⏱ Totaltid: <Text style={{fontWeight: 'bold', color: activeTheme.primary}}>{formatTime(timer)}</Text></Text>
            <TouchableOpacity onPress={() => { triggerHaptic(); setIsTimerRunning(!isTimerRunning); }}>
              <Text style={{ color: isTimerRunning ? activeTheme.danger : activeTheme.success, fontWeight: 'bold' }}>
                {isTimerRunning ? 'Stopp' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.subText, { marginBottom: 5 }]}>Målrettet muskelgruppe (Analyse):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {MUSCLES.map(m => (
              <TouchableOpacity 
                key={m} 
                style={[s.favBtn, { backgroundColor: muscle === m ? activeTheme.primary : activeTheme.border, marginRight: 8, paddingVertical: 6, paddingHorizontal: 12 }]} 
                onPress={() => { triggerHaptic(); setMuscle(muscle === m ? '' : m); }}
              >
                <Text style={[s.text, { fontSize: 12, color: muscle === m ? '#fff' : activeTheme.text }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>
      )}

      {/* INPUT ØVELSE */}
      <TextInput 
        style={s.input} placeholder={t.addEx} placeholderTextColor={activeTheme.subText} 
        value={exercise} onChangeText={handleExerciseInput} returnKeyType="next"
        onSubmitEditing={() => { if(weightRefs.current[0]) weightRefs.current[0].focus(); }}
      />
      
      {/* AUTOFYLL HISTORIKK */}
      {historyData && (
        <TouchableOpacity onPress={handleAutofill}>
          <Text style={[s.subText, {color: activeTheme.primary, marginBottom: 10, fontStyle: 'italic', textDecorationLine: 'underline'}]}>
            {historyData.label} (Trykk for autofyll)
          </Text>
        </TouchableOpacity>
      )}

      {/* FORSLAG */}
      {suggestions.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {suggestions.map((sug, i) => (
            <TouchableOpacity key={i} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => selectSuggestion(pref.lang === 'en' && sug.en ? sug.en : sug.name)}>
              <Text style={[s.text, { fontSize: 13 }]}>{pref.lang === 'en' && sug.en ? sug.en : sug.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SETT-LISTE */}
      {sets.map((item, i) => (
        <View key={item.id} style={s.row}>
          <TouchableOpacity style={{ width: 35, alignItems: 'center', padding: 5, backgroundColor: item.type === 'S' ? activeTheme.bg : activeTheme.border, borderRadius: 6 }} 
            onPress={() => { 
              triggerHaptic(); 
              const n = [...sets]; 
              n[i].type = n[i].type === 'S' ? (pref.lang === 'no' ? 'O' : 'W') : 'S'; 
              setSets(n); 
            }}>
            <Text style={[s.text, { fontWeight: 'bold', color: item.type === 'S' ? activeTheme.primary : activeTheme.text }]}>{getSetDisplay(sets, i)}</Text>
          </TouchableOpacity>

          <TextInput 
            ref={el => weightRefs.current[i] = el} style={[s.inputSmall, { width: '25%' }]} placeholder={t.weight} placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
            value={item.weight} onChangeText={(v) => { const n = [...sets]; n[i].weight = v; setSets(n); }} 
            returnKeyType="next" onSubmitEditing={() => { if(repsRefs.current[i]) repsRefs.current[i].focus(); }}
          />
          
          <TouchableOpacity style={[s.unitBtn, { paddingHorizontal: 8 }]} onPress={() => toggleUnit(i)}>
            <Text style={[s.text, { fontSize: 12 }]}>{item.unit.toUpperCase()}</Text>
          </TouchableOpacity>

          <TextInput 
            ref={el => repsRefs.current[i] = el} style={[s.inputSmall, { width: '25%' }]} placeholder={t.reps} placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
            value={item.reps} onChangeText={(v) => { const n = [...sets]; n[i].reps = v; setSets(n); }} 
            returnKeyType="next" onSubmitEditing={() => { if(weightRefs.current[i+1]) weightRefs.current[i+1].focus(); }}
          />
          
          <TouchableOpacity onPress={() => { triggerHaptic(); setSets(sets.length > 1 ? sets.filter(x => x.id !== item.id) : sets); }}>
            <Text style={{ color: activeTheme.danger, fontWeight: 'bold', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* LEGG TIL SETT & FULLFØR ØVELSE */}
      <View style={s.row}>
        <TouchableOpacity style={s.textBtn} onPress={() => { triggerHaptic(); setSets([...sets, { id: Date.now().toString(), weight: '', reps: '', unit: sets[sets.length-1].unit, type: sets[sets.length-1].type }]); }}>
          <Text style={s.primaryText}>+ {t.addSet}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={[s.btn, { opacity: exercise.trim() ? 1 : 0.5 }]} onPress={handleAdd} disabled={!exercise.trim()}>
        <Text style={s.btnText}>{t.addEx}</Text>
      </TouchableOpacity>
    </View>
  );
}