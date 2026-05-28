import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Appearance, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { defaultDB } from '../../constants/exercises';
import { createStyles, themes } from '../../constants/themes';
import { dict } from '../../constants/translations';
import { useStore } from '../../hooks/useStore';

import BodyTab from '../../components/BodyTab';
import LogTab from '../../components/LogTab';
import WorkoutTab from '../../components/WorkoutTab';

export default function Index() {
  const { pref, updatePref, bodyLogs, session, clearSession, addLog, goals, setGoals, plans, setPlans } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  // Navigasjon & UI States
  const [tab, setTab] = useState('workout');
  const [customDateOffset, setCustomDateOffset] = useState(0);
  
  // Modaler
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [intervalModal, setIntervalModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [planBuilderModal, setPlanBuilderModal] = useState(false);

  // Modal Data
  const [intData, setIntData] = useState({ name: '', work: '', rest: '', rounds: '' });
  const [goalData, setGoalData] = useState({ exercise: '', target: '', unit: 'kg' });
  const [goalSuggestions, setGoalSuggestions] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState({ name: '', exercises: [] as any[] });
  const [planExercise, setPlanExercise] = useState('');
  const [planSuggestions, setPlanSuggestions] = useState<any[]>([]);

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // --- HJELPERE FOR DATO ---
  const getCustomDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + customDateOffset);
    return d;
  };
  const getCustomDateISO = () => getCustomDate().toISOString();

  const formatDate = (iso: string, langDict: any, timeFormat: string, hideTime = false) => {
    const d = new Date(iso);
    const dayName = langDict.days[d.getDay()];
    const date = d.getDate();
    const monthName = langDict.months[d.getMonth()];
    if (hideTime) return `${dayName}, ${date}. ${monthName} ${d.getFullYear()}`;
    let hours = d.getHours();
    let mins = d.getMinutes().toString().padStart(2, '0');
    let ampm = timeFormat === '12h' ? (hours >= 12 ? ' PM' : ' AM') : '';
    if (timeFormat === '12h') hours = hours % 12 || 12;
    else hours = hours.toString().padStart(2, '0');
    return `${dayName}, ${date}. ${monthName} kl ${hours}:${mins}${ampm}`;
  };

  // --- GLOBALE HANDLINGER ---
  const finishWorkout = () => {
    triggerHaptic();
    if (session.length === 0) return;
    const newLog = { id: Date.now().toString(), date: getCustomDateISO(), exercises: session };
    addLog(newLog);
    clearSession();
    setCustomDateOffset(0);
    setTab('log');
  };

  // --- MODAL HANDLINGER ---
  const handleAddInterval = () => {
    triggerHaptic();
    if (!intData.name) return;
    const newEx = {
      id: Date.now().toString(),
      name: intData.name,
      isInterval: true,
      details: `${intData.work}s arbeid, ${intData.rest}s hvile, ${intData.rounds} runder`,
      sets: [],
      note: ''
    };
    useStore.getState().setSession([...session, newEx]);
    setIntData({ name: '', work: '', rest: '', rounds: '' });
    setIntervalModal(false);
  };

  const handleSaveGoal = () => {
    triggerHaptic();
    if (!goalData.exercise || !goalData.target) return;
    const newGoal = { id: Date.now().toString(), exercise: goalData.exercise, target: goalData.target, unit: goalData.unit };
    setGoals([...goals, newGoal]);
    setGoalData({ exercise: '', target: '', unit: 'kg' });
    setGoalModal(false);
  };

  // --- PLAN-BYGGER LOGIKK ---
  const handleAddPlanEx = (text: string) => {
    setPlanExercise(text);
    if (text.length > 0) {
      setPlanSuggestions(defaultDB.filter(e => e.name.toLowerCase().includes(text.toLowerCase())).slice(0, 5));
    } else setPlanSuggestions([]);
  };

  const selectPlanSuggestion = (name: string) => {
    triggerHaptic();
    setNewPlan({
      ...newPlan,
      exercises: [...newPlan.exercises, { 
        id: Date.now().toString() + Math.random(), 
        name: name, 
        sets: [{ id: Date.now().toString(), weight: '', reps: '', type: 'S', unit: 'kg' }] 
      }]
    });
    setPlanExercise('');
    setPlanSuggestions([]);
  };

  const updatePlanSet = (exIndex: number, setIndex: number, field: string, value: string) => {
    const updated = [...newPlan.exercises];
    updated[exIndex].sets[setIndex][field] = value;
    setNewPlan({ ...newPlan, exercises: updated });
  };

  const addPlanSet = (exIndex: number) => {
    triggerHaptic();
    const updated = [...newPlan.exercises];
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    updated[exIndex].sets.push({
      id: Date.now().toString() + Math.random(),
      weight: lastSet ? lastSet.weight : '',
      reps: lastSet ? lastSet.reps : '',
      type: lastSet ? lastSet.type : 'S',
      unit: lastSet ? lastSet.unit : 'kg'
    });
    setNewPlan({ ...newPlan, exercises: updated });
  };

  const removePlanSet = (exIndex: number, setIndex: number) => {
    triggerHaptic();
    const updated = [...newPlan.exercises];
    updated[exIndex].sets.splice(setIndex, 1);
    setNewPlan({ ...newPlan, exercises: updated });
  };

  const handleSavePlan = () => {
    triggerHaptic();
    if (!newPlan.name || newPlan.exercises.length === 0) return;
    const planToSave = { id: Date.now().toString(), name: newPlan.name, exercises: newPlan.exercises };
    setPlans([...plans, planToSave]);
    setNewPlan({ name: '', exercises: [] });
    setPlanBuilderModal(false);
  };

  const loadPlan = (plan: any) => {
    triggerHaptic();
    const pExercises = plan.exercises.map((ex: any) => {
      const isOldFormat = typeof ex === 'string';
      return {
        id: Date.now().toString() + Math.random(),
        name: isOldFormat ? ex : (ex?.name || 'Ukjent'),
        isInterval: false,
        sets: isOldFormat 
          ? [{ id: Date.now().toString(), weight: '', reps: '', type: 'S', unit: 'kg' }]
          : (ex?.sets || []).map((s: any) => ({ ...s, id: Date.now().toString() + Math.random() })),
        note: '',
        muscle: '' 
      };
    });
    
    useStore.getState().setSession([...session, ...pExercises]);
    setPlanModal(false);
    setTab('workout');
  };

  const handleGoalExInput = (text: string) => {
    setGoalData({ ...goalData, exercise: text });
    if (text.length > 0) {
      setGoalSuggestions(defaultDB.filter(e => e.name.toLowerCase().includes(text.toLowerCase())).slice(0, 5));
    } else setGoalSuggestions([]);
  };

  // --- BACKUP / RESTORE ---
  const exportData = async () => {
    try {
      const state = useStore.getState();
      const jsonString = JSON.stringify(state);
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'momentum_backup.json', 'application/json');
          await FileSystem.writeAsStringAsync(uri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
          Alert.alert("Suksess", "Sikkerhetskopien er lagret trygt på telefonen din.");
        } else {
          Alert.alert("Avbrutt", "Du må gi appen tilgang til en mappe for å lagre.");
        }
      } else {
        const fileUri = FileSystem.documentDirectory + 'momentum_backup.json';
        await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { dialogTitle: 'Lagre Momentum Sikkerhetskopi' });
      }
    } catch (error: any) { 
      Alert.alert("Feil under lagring", error.message || "Kunne ikke opprette sikkerhetskopi."); 
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(fileContent);
      
      if (!parsed.logs) { 
        Alert.alert("Feil", "Dette ser ikke ut som en gyldig Momentum-fil."); 
        return; 
      }

      Alert.alert("Overskriv Data?", "Dette vil slette alt du har nå og erstatte det med filen. Er du sikker?", [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Gjenopprett", style: "destructive",
          onPress: () => { 
            useStore.setState(parsed); 
            Alert.alert("Suksess!", "Loggen din er gjenoppstått fra de døde."); 
          } 
        }
      ]);
    } catch (error: any) { 
      Alert.alert("Feil under lesing", error.message || "Kunne ikke lese filen."); 
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* STARTUP / QUICK GUIDE MODAL */}
      <Modal visible={!pref.hasSeenStartup} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { flex: 0.9, justifyContent: 'center' }]}>
             <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[s.title, {textAlign: 'center', marginBottom: 20}]}>{t.quickGuideTitle}</Text>
                <Text style={[s.text, {lineHeight: 24, marginBottom: 20}]}>{t.manualText}</Text>
                <View style={{backgroundColor: activeTheme.bg, padding: 15, borderRadius: 8, marginBottom: 30}}>
                  <Text style={[s.subTitle, {color: activeTheme.danger}]}>{t.disclaimer}</Text>
                  <Text style={[s.subText, {fontStyle: 'italic'}]}>{t.disclaimerText}</Text>
                </View>
                <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.success}]} onPress={() => updatePref({hasSeenStartup: true})}>
                  <Text style={s.btnText}>Start Momentum</Text>
                </TouchableOpacity>
              </ScrollView>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={[s.title, { letterSpacing: 2 }]}>MOMENTUM</Text>
          <Text style={[s.subText, { fontSize: 13, marginTop: -2, fontWeight: 'bold' }]}>
            Kroppsvekt: {bodyLogs.length > 0 && bodyLogs[0].data.weight ? `${bodyLogs[0].data.weight} kg` : '--'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => { triggerHaptic(); setSettingsOpen(true); }}>
          {pref.profilePic ? <Image source={{ uri: pref.profilePic }} style={s.profileIcon} /> : <Text style={{ fontSize: 28 }}>⚙️</Text>}
        </TouchableOpacity>
      </View>

      {/* NAVIGATION TABS */}
      <View style={s.nav}>
        {['workout', 'log', 'body'].map(tabName => (
          <TouchableOpacity key={tabName} style={[s.tab, tab === tabName && s.activeTab]} onPress={() => { triggerHaptic(); setTab(tabName); }}>
            <Text style={[s.tabText, tab === tabName && s.activeTabText]}>{t[tabName as keyof typeof t].toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FANER */}
      {tab === 'workout' && (
        <WorkoutTab 
          customDateOffset={customDateOffset} setCustomDateOffset={setCustomDateOffset}
          getCustomDateISO={getCustomDateISO} formatDate={formatDate}
          setIntervalModal={setIntervalModal} setPlanModal={setPlanModal} finishWorkout={finishWorkout}
        />
      )}
      
      {tab === 'log' && (
        <LogTab setGoalModal={setGoalModal} formatDate={formatDate} />
      )}
      
      {tab === 'body' && (
        <BodyTab 
          customDateOffset={customDateOffset} setCustomDateOffset={setCustomDateOffset}
          getCustomDateISO={getCustomDateISO} formatDate={formatDate}
        />
      )}

      {/* INTERVALL MODAL */}
      <Modal visible={intervalModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.title}>{t.addIntervalBtn}</Text>
            <TextInput style={s.input} placeholder="Navn (f.eks. Mølle)" placeholderTextColor={activeTheme.subText} value={intData.name} onChangeText={v => setIntData({...intData, name: v})} />
            <View style={s.row}>
              <TextInput style={[s.input, {width: '30%'}]} placeholder="Arbeid (s)" placeholderTextColor={activeTheme.subText} keyboardType="numeric" value={intData.work} onChangeText={v => setIntData({...intData, work: v})} />
              <TextInput style={[s.input, {width: '30%'}]} placeholder="Hvile (s)" placeholderTextColor={activeTheme.subText} keyboardType="numeric" value={intData.rest} onChangeText={v => setIntData({...intData, rest: v})} />
              <TextInput style={[s.input, {width: '30%'}]} placeholder="Runder" placeholderTextColor={activeTheme.subText} keyboardType="numeric" value={intData.rounds} onChangeText={v => setIntData({...intData, rounds: v})} />
            </View>
            <View style={s.row}>
              <TouchableOpacity style={[s.btn, {flex: 1, backgroundColor: activeTheme.border, marginRight: 5}]} onPress={() => { triggerHaptic(); setIntervalModal(false); }}><Text style={s.text}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, {flex: 1, marginLeft: 5}]} onPress={handleAddInterval}><Text style={s.btnText}>{t.addEx}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* PLAN MODAL (Oversikt over lagrede planer) */}
      <Modal visible={planModal} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { flex: 0.8 }]}>
            <Text style={s.title}>{t.plans}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 15 }}>
              {plans.length === 0 ? <Text style={s.subText}>Ingen planer opprettet enda.</Text> : 
                plans.map((p: any) => (
                  <View key={p.id} style={[s.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.text, { fontWeight: 'bold' }]}>{p.name}</Text>
                      <Text style={s.subText}>{p.exercises.map((e: any) => typeof e === 'string' ? e : (e?.name || '')).join(', ')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => loadPlan(p)} style={{ backgroundColor: activeTheme.primary, padding: 10, borderRadius: 8, marginRight: 10 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { triggerHaptic(); setPlans(plans.filter((x: any) => x.id !== p.id)); }} style={{ padding: 10 }}>
                        <Text style={{ color: activeTheme.danger, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              }
            </ScrollView>
            <TouchableOpacity style={[s.btn, { marginBottom: 10 }]} onPress={() => { triggerHaptic(); setPlanBuilderModal(true); }}>
              <Text style={s.btnText}>+ Lag ny plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border }]} onPress={() => { triggerHaptic(); setPlanModal(false); }}>
              <Text style={s.text}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PLAN BUILDER MODAL (Nå med hardt forspill for sett og reps) */}
      <Modal visible={planBuilderModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modalContent, { flex: 0.8 }]}>
            <Text style={s.title}>Ny Plan</Text>
            <TextInput style={s.input} placeholder="Navn på plan (f.eks. Leg Day)" placeholderTextColor={activeTheme.subText} value={newPlan.name} onChangeText={v => setNewPlan({...newPlan, name: v})} />
            
            <View style={{ marginTop: 15 }}>
              <TextInput style={s.input} placeholder="Søk etter øvelse..." placeholderTextColor={activeTheme.subText} value={planExercise} onChangeText={handleAddPlanEx} />
              {planSuggestions.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                  {planSuggestions.map((sug: any, i: number) => (
                    <TouchableOpacity key={i} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => selectPlanSuggestion(sug.name)}>
                      <Text style={[s.text, { fontSize: 13 }]}>{sug.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <ScrollView style={{ marginVertical: 10 }} keyboardShouldPersistTaps="handled">
              {newPlan.exercises.map((ex, exIndex) => (
                <View key={ex.id || exIndex} style={[s.card, { backgroundColor: activeTheme.bg, padding: 10, borderRadius: 8, marginBottom: 10, shadowOpacity: 0 }]}>
                  <View style={[s.row, { marginBottom: 10, borderBottomWidth: 1, borderColor: activeTheme.border, paddingBottom: 5 }]}>
                    <Text style={[s.text, { fontWeight: 'bold' }]}>{ex.name || ex}</Text>
                    <TouchableOpacity onPress={() => { triggerHaptic(); setNewPlan({...newPlan, exercises: newPlan.exercises.filter((_, idx) => idx !== exIndex)}); }}>
                      <Text style={{ color: activeTheme.danger, fontWeight: 'bold' }}>✕ Fjern</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {ex.sets?.map((set: any, setIndex: number) => (
                    <View key={set.id || setIndex} style={[s.row, { marginBottom: 8 }]}>
                      <TouchableOpacity 
                        style={{ width: 35, alignItems: 'center', backgroundColor: set.type === 'S' ? activeTheme.card : activeTheme.border, padding: 4, borderRadius: 4 }}
                        onPress={() => updatePlanSet(exIndex, setIndex, 'type', set.type === 'S' ? (pref.lang === 'no' ? 'O' : 'W') : 'S')}
                      >
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: set.type === 'S' ? activeTheme.primary : activeTheme.text }}>{set.type}</Text>
                      </TouchableOpacity>
                      
                      <TextInput 
                        style={[s.inputSmall, { width: '25%', padding: 4, height: 35, minHeight: 35 }]} 
                        placeholder="Kg" placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
                        value={set.weight} onChangeText={v => updatePlanSet(exIndex, setIndex, 'weight', v)} 
                      />
                      
                      <TouchableOpacity onPress={() => { triggerHaptic(); updatePlanSet(exIndex, setIndex, 'unit', set.unit === 'kg' ? 'lbs' : 'kg'); }}>
                        <Text style={{ fontSize: 12, color: activeTheme.text }}>{set.unit?.toUpperCase()}</Text>
                      </TouchableOpacity>
                      
                      <TextInput 
                        style={[s.inputSmall, { width: '25%', padding: 4, height: 35, minHeight: 35 }]} 
                        placeholder="Reps" placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
                        value={set.reps} onChangeText={v => updatePlanSet(exIndex, setIndex, 'reps', v)} 
                      />
                      
                      <TouchableOpacity onPress={() => removePlanSet(exIndex, setIndex)}>
                        <Text style={{ color: activeTheme.danger, fontWeight: 'bold', fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity style={{ marginTop: 5, alignItems: 'center' }} onPress={() => addPlanSet(exIndex)}>
                    <Text style={{ color: activeTheme.primary, fontSize: 14, fontWeight: 'bold' }}>+ Legg til sett</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={s.row}>
              <TouchableOpacity style={[s.btn, {flex: 1, backgroundColor: activeTheme.border, marginRight: 5}]} onPress={() => { triggerHaptic(); setPlanBuilderModal(false); }}><Text style={s.text}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, {flex: 1, marginLeft: 5}]} onPress={handleSavePlan}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* GOAL MODAL */}
      <Modal visible={goalModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.title}>{t.addGoal}</Text>
            <TextInput style={s.input} placeholder="Øvelse (f.eks. Benkpress)" placeholderTextColor={activeTheme.subText} value={goalData.exercise} onChangeText={handleGoalExInput} />
            {goalSuggestions.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                  {goalSuggestions.map((sug: any, i: number) => (
                    <TouchableOpacity key={i} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => { triggerHaptic(); setGoalData({...goalData, exercise: sug.name}); setGoalSuggestions([]); }}>
                      <Text style={[s.text, { fontSize: 13 }]}>{sug.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
            )}
            <View style={s.row}>
              <TextInput style={[s.input, {width: '60%'}]} placeholder="Mål (f.eks. 100)" placeholderTextColor={activeTheme.subText} keyboardType="numeric" value={goalData.target} onChangeText={v => setGoalData({...goalData, target: v})} />
              <TouchableOpacity style={[s.btn, {width: '35%', backgroundColor: activeTheme.border}]} onPress={() => { triggerHaptic(); setGoalData({...goalData, unit: goalData.unit === 'kg' ? 'reps' : 'kg'}); }}>
                <Text style={s.text}>{goalData.unit.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.row}>
              <TouchableOpacity style={[s.btn, {flex: 1, backgroundColor: activeTheme.border, marginRight: 5}]} onPress={() => { triggerHaptic(); setGoalModal(false); }}><Text style={s.text}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, {flex: 1, marginLeft: 5}]} onPress={handleSaveGoal}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* INNSTILLINGER MODAL */}
      <Modal visible={settingsOpen} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modalContent, { flex: 0.9 }]}>
            <TouchableOpacity style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 10 }} onPress={() => { triggerHaptic(); setSettingsOpen(false); }}>
              <Text style={{ fontSize: 24, color: activeTheme.text, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.title}>{t.settings}</Text>
              
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <TouchableOpacity onPress={async () => { triggerHaptic(); let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 }); if (!r.canceled) updatePref({ profilePic: r.assets[0].uri }); }}>
                  {pref.profilePic ? <Image source={{ uri: pref.profilePic }} style={s.profileImageLarge} /> : <View style={[s.profileImageLarge, { backgroundColor: activeTheme.border, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 40 }}>⚙️</Text></View>}
                </TouchableOpacity>
              </View>

              <Text style={s.subTitle}>{t.yourName}</Text>
              <TextInput style={s.input} placeholder={t.yourName} placeholderTextColor={activeTheme.subText} value={pref.name} onChangeText={v => updatePref({ name: v })} />

              <Text style={[s.subTitle, {marginTop: 20}]}>{t.lang}</Text>
              <View style={s.row}>
                <TouchableOpacity style={[s.settingBtn, {width: '48%'}, pref.lang === 'no' && s.settingBtnActive]} onPress={() => { triggerHaptic(); updatePref({ lang: 'no' }); }}><Text style={[s.text, pref.lang === 'no' && {color: '#fff'}]}>Norsk</Text></TouchableOpacity>
                <TouchableOpacity style={[s.settingBtn, {width: '48%'}, pref.lang === 'en' && s.settingBtnActive]} onPress={() => { triggerHaptic(); updatePref({ lang: 'en' }); }}><Text style={[s.text, pref.lang === 'en' && {color: '#fff'}]}>English</Text></TouchableOpacity>
              </View>

              <Text style={[s.subTitle, {marginTop: 20}]}>{t.theme}</Text>
              <View style={s.row}>
                {['light', 'dark', 'system'].map(th => (
                  <TouchableOpacity key={th} style={[s.settingBtn, pref.theme === th && s.settingBtnActive]} onPress={() => { triggerHaptic(); updatePref({ theme: th }); }}><Text style={[s.text, pref.theme === th && {color: '#fff'}]}>{t[th as keyof typeof t]}</Text></TouchableOpacity>
                ))}
              </View>

              <Text style={[s.subTitle, {marginTop: 20}]}>Data & Support</Text>
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); exportData(); }}><Text style={s.text}>{t.backup}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); importData(); }}><Text style={s.text}>{t.restore}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); setManualOpen(true); }}><Text style={s.text}>{t.manual}</Text></TouchableOpacity>
              
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.primary }]} onPress={() => { triggerHaptic(); Linking.openURL('mailto:olektlarsen@gmail.com?subject=Feedback%20Momentum%20App'); }}><Text style={s.btnText}>{t.feedback}</Text></TouchableOpacity>

              <View style={{marginTop: 30, padding: 15, backgroundColor: activeTheme.bg, borderRadius: 8}}>
                <Text style={[s.subTitle, {color: activeTheme.danger, fontSize: 13}]}>{t.disclaimer}</Text>
                <Text style={[s.subText, {fontSize: 11, fontStyle: 'italic'}]}>{t.disclaimerText}</Text>
              </View>
              <View style={{height: 60}} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* BRUKERMANUAL MODAL */}
      <Modal visible={manualOpen} animationType="fade" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { flex: 0.85 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.title}>{t.manual}</Text>
              <Text style={[s.text, { marginTop: 20, lineHeight: 24 }]}>{t.manualText}</Text>
              <TouchableOpacity style={[s.btn, {marginTop: 40, backgroundColor: activeTheme.primary}]} onPress={() => { triggerHaptic(); setManualOpen(false); }}><Text style={s.btnText}>{t.cancel}</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}