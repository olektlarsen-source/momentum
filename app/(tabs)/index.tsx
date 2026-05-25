import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Appearance, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- UTVIDET ØVELSESDATABASE (Nå med Squat og venner) ---
const defaultDB = [
  { name: 'Benkpress', muscle: 'Bryst' }, { name: 'Bench Press', muscle: 'Bryst' }, { name: 'Skrå Benkpress', muscle: 'Bryst' }, { name: 'Dips', muscle: 'Bryst' }, { name: 'Flyes (Manualer)', muscle: 'Bryst' }, { name: 'Kabel Crossovers', muscle: 'Bryst' }, { name: 'Pec Dec Maskin', muscle: 'Bryst' }, { name: 'Pushups', muscle: 'Bryst' }, { name: 'Decline Benkpress', muscle: 'Bryst' },
  { name: 'Knebøy', muscle: 'Bein' }, { name: 'Squat', muscle: 'Bein' }, { name: 'Frontbøy', muscle: 'Bein' }, { name: 'Benpress', muscle: 'Bein' }, { name: 'Leg Press', muscle: 'Bein' }, { name: 'Bulgarsk Utfall', muscle: 'Bein' }, { name: 'Utfall', muscle: 'Bein' }, { name: 'Lunges', muscle: 'Bein' }, { name: 'Leg Extension', muscle: 'Bein' }, { name: 'Leg Curl', muscle: 'Bein' }, { name: 'Strake Markløft', muscle: 'Bein' }, { name: 'Tåhev', muscle: 'Bein' }, { name: 'Hack Squat', muscle: 'Bein' }, { name: 'Hip Thrust', muscle: 'Bein' }, { name: 'Glute Bridge', muscle: 'Bein' },
  { name: 'Markløft', muscle: 'Rygg' }, { name: 'Deadlift', muscle: 'Rygg' }, { name: 'Pullups', muscle: 'Rygg' }, { name: 'Nedtrekk', muscle: 'Rygg' }, { name: 'Lat Pulldown', muscle: 'Rygg' }, { name: 'Foroverbøyd Roing', muscle: 'Rygg' }, { name: 'Barbell Row', muscle: 'Rygg' }, { name: 'Sittende Kabelroing', muscle: 'Rygg' }, { name: 'T-Bar Roing', muscle: 'Rygg' }, { name: 'Enarms Hantelroing', muscle: 'Rygg' }, { name: 'Facepulls', muscle: 'Rygg' }, { name: 'Rumensk Markløft (RDL)', muscle: 'Rygg' }, { name: 'Straight Arm Pulldown', muscle: 'Rygg' }, { name: 'Shrugs', muscle: 'Rygg' },
  { name: 'Militærpress', muscle: 'Skuldre' }, { name: 'Overhead Press', muscle: 'Skuldre' }, { name: 'Skulderpress (Manualer)', muscle: 'Skuldre' }, { name: 'Sidehev', muscle: 'Skuldre' }, { name: 'Lateral Raises', muscle: 'Skuldre' }, { name: 'Fronthev', muscle: 'Skuldre' }, { name: 'Omvendt Pec Dec', muscle: 'Skuldre' }, { name: 'Arnold Press', muscle: 'Skuldre' }, { name: 'Upright Row', muscle: 'Skuldre' }, { name: 'Kabel Sidehev', muscle: 'Skuldre' },
  { name: 'Biceps Curl (Stang)', muscle: 'Armer' }, { name: 'Biceps Curl (Manualer)', muscle: 'Armer' }, { name: 'Hammer Curls', muscle: 'Armer' }, { name: 'Kabel Curls', muscle: 'Armer' }, { name: 'Franskpress', muscle: 'Armer' }, { name: 'Skullcrushers', muscle: 'Armer' }, { name: 'Triceps Pushdown', muscle: 'Armer' }, { name: 'Overhead Triceps', muscle: 'Armer' }, { name: 'Preacher Curl', muscle: 'Armer' }, { name: 'Smal Benkpress', muscle: 'Armer' },
  { name: 'Planken', muscle: 'Mage' }, { name: 'Crunches', muscle: 'Mage' }, { name: 'Hengende Benhev', muscle: 'Mage' }, { name: 'Cable Crunches', muscle: 'Mage' }, { name: 'Russian Twists', muscle: 'Mage' }, { name: 'Ab Wheel', muscle: 'Mage' }
];

const dict = {
  no: { workout: 'Trening', log: 'Logg', body: 'Kropp', pr: 'Skrytetavle & Mål', settings: 'Innstillinger', save: 'Lagre', cancel: 'Lukk', weight: 'Vekt', reps: 'Reps', count: 'Antall', addSet: 'Legg til sett', addEx: 'Legg til øvelse', finish: 'Fullfør økt', chest: 'Bryst', waist: 'Midje', hips: 'Hofter', upperArm: 'Overarm', lowerArm: 'Underarm', thigh: 'Lår', calf: 'Legg', theme: 'Tema', lang: 'Språk', light: 'Lys', dark: 'Mørk', system: 'System', today: 'Dagens Økt', delete: 'Slett', interval: 'Intervall', work: 'Jobb (s)', rest: 'Hvile (s)', rounds: 'Runder', intName: 'Navn', confirmDel: 'Sikker på at du vil slette?', yes: 'Ja', set: 'sett', addIntervalBtn: '⏱ Intervall', timeFormat: 'Tidsformat', backup: 'Sikkerhetskopi', restore: 'Gjenopprett', note: 'Notat for øvelsen...', goalTarget: 'Mål', newGoal: 'Nytt Mål', addGoal: 'Legg til Mål', favs: 'Favoritter', suggestions: 'Forslag', muscleDist: 'Muskelgrupper', streak: 'Aktivitet siste 14 dager', tonnage: 'Totalt vekt denne uken', manual: 'Brukermanual', feedback: 'Gi Feedback', yourName: 'Ditt navn', days: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'], months: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'], manualText: "Velkommen til Momentum!\n\nTRENING:\nVelg øvelser og legg til sett med vekt og reps. Trykk 'Fullfør økt' for å lagre historikken i loggen.\n\nENHETER (KG/LBS):\nDu kan bytte mellom kg og lbs ved å trykke på enhetsknappen når du logger et sett. Appen kalkulerer automatisk lbs om til kg i det du lagrer, så historikken din alltid er konsistent og i kilo.\n\nLOGG:\nHer ser du historikken din, aktivitetsnivå og ukens totale løft. Totalvekten nullstilles automatisk hver mandag. Du kan slette gamle økter hvis du la inn feil.\n\nKROPP:\nLogg vekt og mål i cm. Legg gjerne til formbilder for å spore fremgangen visuelt. Trykk på bildet i loggen for å se det i fullskjerm.\n\nMÅL:\nSett deg mål for spesifikke øvelser (enten i kilo eller antall). Fremdriften fylles automatisk når du setter nye personlige rekorder under treningen. Du får beskjed når du knuser et mål!\n\nINNSTILLINGER:\nBytt språk, tema og ta sikkerhetskopi av dataene. Det er anbefalt å ta backup (eksport) jevnlig." },
  en: { workout: 'Workout', log: 'Log', body: 'Body', pr: 'PRs & Goals', settings: 'Settings', save: 'Save', cancel: 'Close', weight: 'Weight', reps: 'Reps', count: 'Count', addSet: 'Add set', addEx: 'Add exercise', finish: 'Finish Workout', chest: 'Chest', waist: 'Waist', hips: 'Hips', upperArm: 'Biceps', lowerArm: 'Forearm', thigh: 'Thigh', calf: 'Calf', theme: 'Theme', lang: 'Language', light: 'Light', dark: 'Dark', system: 'System', today: 'Today', delete: 'Delete', interval: 'Interval', work: 'Work (s)', rest: 'Rest (s)', rounds: 'Rounds', intName: 'Name', confirmDel: 'Sure?', yes: 'Yes', set: 'set', addIntervalBtn: '⏱ Interval', timeFormat: 'Time Format', backup: 'Backup', restore: 'Restore', note: 'Note...', goalTarget: 'Target', newGoal: 'New Goal', addGoal: 'Add Goal', favs: 'Favorites', suggestions: 'Suggestions', muscleDist: 'Muscles', streak: '14-day Activity', tonnage: 'Total weight this week', manual: 'User Manual', feedback: 'Send Feedback', yourName: 'Your Name', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], manualText: "Welcome to Momentum!\n\nWORKOUT:\nSelect exercises and add sets with weight and reps. Press 'Finish Workout' to save your history.\n\nUNITS (KG/LBS):\nYou can toggle between kg and lbs when logging a set. The app automatically converts lbs to kg upon saving, keeping your history consistent.\n\nLOG:\nView your history, activity level, and this week's total lifted weight. The total weight resets automatically every Monday.\n\nBODY:\nLog weight and measurements. Add progress pictures to track changes visually. Tap a picture in the log to view it full screen.\n\nGOALS:\nSet goals for specific exercises (in kg or count). Progress fills automatically when you hit new PRs during workouts.\n\nSETTINGS:\nChange language, theme, and backup your data. Regular backups are recommended." }
};

const themes = {
  light: { bg: '#F2F2F7', card: '#FFFFFF', text: '#000000', subText: '#8E8E93', border: '#C6C6C8', primary: '#007AFF', danger: '#FF3B30', success: '#34C759' },
  dark: { bg: '#000000', card: '#1C1C1E', text: '#FFFFFF', subText: '#EBEBF5', border: '#38383A', primary: '#0A84FF', danger: '#FF453A', success: '#30D158' }
};

const formatDate = (iso, langDict, timeFormat) => {
  const d = new Date(iso);
  const dayName = langDict.days[d.getDay()];
  const date = d.getDate();
  const monthName = langDict.months[d.getMonth()];
  let hours = d.getHours();
  let mins = d.getMinutes().toString().padStart(2, '0');
  let ampm = timeFormat === '12h' ? (hours >= 12 ? ' PM' : ' AM') : '';
  if (timeFormat === '12h') hours = hours % 12 || 12;
  else hours = hours.toString().padStart(2, '0');
  return `${dayName}, ${date}. ${monthName} kl ${hours}:${mins}${ampm}`;
};

const triggerHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const CurrentSessionItem = ({ ex, index, removeFromSession, updateNote, s, t, theme }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[s.card, { marginBottom: 10, padding: 10 }]}>
      <TouchableOpacity onPress={() => { triggerHaptic(); setExpanded(!expanded); }} style={s.row}>
        <Text style={[s.text, { fontWeight: 'bold' }]}>{index + 1}. {ex.name}</Text>
        <Text style={s.subText}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={{ marginTop: 10 }}>
          {ex.isInterval ? <Text style={s.text}>{ex.details}</Text> : ex.sets.map((set, i) => (
            <Text key={i} style={s.text}>{t.set} {i + 1}: {set.weight} kg x {set.reps}</Text>
          ))}
          <TextInput 
            style={[s.input, { marginTop: 10, fontSize: 14, padding: 5 }]} 
            placeholder={t.note} placeholderTextColor={theme.subText}
            value={ex.note || ''} onChangeText={(v) => updateNote(ex.id, v)}
          />
          <TouchableOpacity style={{ marginTop: 10 }} onPress={() => { triggerHaptic(); removeFromSession(ex.id); }}>
            <Text style={{ color: theme.danger, fontWeight: 'bold' }}>{t.delete}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function Index() {
  const [tab, setTab] = useState('workout');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState([{ id: '1', weight: '', reps: '', unit: 'kg' }]);
  const [session, setSession] = useState([]);
  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState({});
  const [goals, setGoals] = useState([]);
  const [bodyLogs, setBodyLogs] = useState([]);
  const [exerciseDB, setExerciseDB] = useState(defaultDB);
  const [suggestions, setSuggestions] = useState([]);
  const [goalSuggestions, setGoalSuggestions] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [fullScreenImage, setFullScreenImage] = useState(null);
  
  const [bodyData, setBodyData] = useState({ weight: '', chest: '', waist: '', hips: '', upperArm: '', lowerArm: '', thigh: '', calf: '', image: null });
  const [intData, setIntData] = useState({ name: '', work: '', rest: '', rounds: '' });
  const [goalData, setGoalData] = useState({ exercise: '', target: '', unit: 'kg' });
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [intervalModal, setIntervalModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  
  const [pref, setPref] = useState({ theme: 'dark', lang: 'no', timeFormat: '24h', profilePic: null, name: '' });
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  const bodyRefs = useRef([]);
  const exRef = useRef(null);
  const weightRefs = useRef([]);
  const repsRefs = useRef([]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    loadAllData();
    return () => sub.remove();
  }, []);

  const loadAllData = async () => {
    const keys = ['logs_v3', 'session_v3', 'prs_v3', 'body_v3', 'settings_v3', 'db_v3', 'goals_v3'];
    const data = await AsyncStorage.multiGet(keys.map(k => `@momentum_${k}`));
    const parsed = data.reduce((acc, [key, val]) => { acc[key.replace('@momentum_', '')] = val ? JSON.parse(val) : null; return acc; }, {});

    if (parsed.logs_v3) setLogs(parsed.logs_v3);
    if (parsed.session_v3) setSession(parsed.session_v3);
    if (parsed.prs_v3) setPrs(parsed.prs_v3);
    if (parsed.body_v3) setBodyLogs(parsed.body_v3);
    if (parsed.settings_v3) setPref({ ...pref, ...parsed.settings_v3 });
    if (parsed.db_v3) setExerciseDB(parsed.db_v3);
    if (parsed.goals_v3) setGoals(parsed.goals_v3);
  };

  const saveData = async (key, val) => { await AsyncStorage.setItem(`@momentum_${key}`, JSON.stringify(val)); };
  const savePref = (key, val) => { const n = { ...pref, [key]: val }; setPref(n); saveData('settings_v3', n); };

  const t = dict[pref.lang] || dict['no'];
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme];
  const s = createStyles(activeTheme);

  const handleExerciseInput = (text) => {
    setExercise(text);
    if (text.length > 0) {
      const matches = exerciseDB.filter(e => e.name.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleGoalExerciseInput = (text) => {
    setGoalData({...goalData, exercise: text});
    if (text.length > 0) {
      const matches = exerciseDB.filter(e => e.name.toLowerCase().includes(text.toLowerCase()));
      setGoalSuggestions(matches.slice(0, 5));
    } else {
      setGoalSuggestions([]);
    }
  };

  const getHistoryFor = (exName) => {
    for (const log of logs) {
      const found = log.exercises?.find(e => e.name.toLowerCase() === exName.toLowerCase());
      if (found && found.sets) {
        return `Sist: ${found.sets.map(st => `${st.weight}x${st.reps}`).join(' | ')} (${formatDate(log.date, t, pref.timeFormat).split(' kl')[0]})`;
      }
    }
    return null;
  };

  const selectSuggestion = (name) => { triggerHaptic(); setExercise(name); setSuggestions([]); };

  const addExercise = () => {
    triggerHaptic();
    if (!exercise.trim()) return;
    const validSets = sets.filter(x => x.weight !== '' || x.reps !== '').map(x => ({
      weight: x.unit === 'lbs' ? (parseFloat(x.weight.replace(',', '.')) / 2.20462).toFixed(1) : (x.weight.replace(',', '.') || '0'),
      reps: x.reps || '0'
    }));
    if (validSets.length === 0) return;

    const exName = exercise.trim();
    if (!exerciseDB.some(e => e.name.toLowerCase() === exName.toLowerCase())) {
      const newDB = [...exerciseDB, { name: exName, muscle: 'Annet' }];
      setExerciseDB(newDB); saveData('db_v3', newDB);
    }

    const currentPr = prs[exName] || { kg: 0, reps: 0 };
    let prObj = typeof currentPr === 'number' ? { kg: currentPr, reps: 0 } : { ...currentPr };
    
    const maxW = Math.max(...validSets.map(x => parseFloat(x.weight) || 0));
    const maxR = Math.max(...validSets.map(x => parseInt(x.reps) || 0));
    
    let newPr = false;
    if (maxW > prObj.kg || maxR > prObj.reps) {
      prObj.kg = Math.max(prObj.kg, maxW);
      prObj.reps = Math.max(prObj.reps, maxR);
      const newPrs = { ...prs, [exName]: prObj };
      setPrs(newPrs); saveData('prs_v3', newPrs);
      newPr = true;
    }

    if (newPr) {
      const matchedGoal = goals.find(g => g.exercise.toLowerCase() === exName.toLowerCase());
      if (matchedGoal) {
        const target = parseFloat(matchedGoal.target);
        if ((matchedGoal.unit === 'kg' && prObj.kg >= target) || (matchedGoal.unit === 'reps' && prObj.reps >= target)) {
          setTimeout(() => {
            Alert.alert("🏆 Mål nådd!", `Fantastisk levert! Du smadret målet ditt på ${target} ${matchedGoal.unit} i ${exName}. Solid fremgang!`);
          }, 500);
        }
      }
    }

    const newSession = [...session, { id: Date.now().toString(), name: exName, sets: validSets, isInterval: false, note: '' }];
    setSession(newSession); saveData('session_v3', newSession);
    
    setExercise(''); setSuggestions([]); setSets([{ id: Date.now().toString(), weight: '', reps: '', unit: 'kg' }]);
  };

  const addInterval = () => {
    triggerHaptic();
    if (!intData.name || !intData.work || !intData.rest || !intData.rounds) return;
    const details = `${intData.rounds} ${t.rounds.toLowerCase()}: ${intData.work}s ${t.work.split(' ')[0].toLowerCase()} / ${intData.rest}s ${t.rest.split(' ')[0].toLowerCase()}`;
    const newSession = [...session, { id: Date.now().toString(), name: intData.name.trim(), isInterval: true, details, note: '' }];
    setSession(newSession); saveData('session_v3', newSession);
    setIntData({ name: '', work: '', rest: '', rounds: '' }); setIntervalModal(false);
  };

  const finishWorkout = () => {
    triggerHaptic();
    if (session.length === 0) return;
    const newLog = { id: Date.now().toString(), date: new Date().toISOString(), exercises: session };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs); saveData('logs_v3', newLogs);
    setSession([]); AsyncStorage.removeItem('@momentum_session_v3');
    setTab('log');
  };

  const deleteWorkoutLog = (id) => {
    triggerHaptic();
    Alert.alert("Slett økt", t.confirmDel, [
      { text: t.cancel, style: "cancel" },
      { text: t.yes, onPress: () => { triggerHaptic(); const newLogs = logs.filter(l => l.id !== id); setLogs(newLogs); saveData('logs_v3', newLogs); }, style: 'destructive' }
    ]);
  };

  const deleteBodyLog = (id) => {
    triggerHaptic();
    Alert.alert("Slett måling", t.confirmDel, [
      { text: t.cancel, style: "cancel" },
      { text: t.yes, onPress: () => { triggerHaptic(); const newLogs = bodyLogs.filter(l => l.id !== id); setBodyLogs(newLogs); saveData('body_v3', newLogs); }, style: 'destructive' }
    ]);
  };

  const pickBodyImage = async () => {
    triggerHaptic();
    let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setBodyData({...bodyData, image: r.assets[0].uri});
  };

  const last14Days = Array.from({length: 14}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split('T')[0]; });
  const logDates = logs.map(l => l.date.split('T')[0]);
  const muscleCount = logs.flatMap(l => l.exercises).reduce((acc, ex) => {
    const dbHit = exerciseDB.find(d => d.name === ex.name);
    const m = dbHit ? dbHit.muscle : 'Annet';
    acc[m] = (acc[m] || 0) + 1; return acc;
  }, {});
  const totalExercises = Object.values(muscleCount).reduce((a,b)=>a+b, 0) || 1;

  const thisMonday = getMonday(new Date());
  const currentWeekLogs = logs.filter(l => new Date(l.date) >= thisMonday);
  let totalTonnage = 0;
  currentWeekLogs.forEach(l => l.exercises?.forEach(ex => ex.sets?.forEach(st => totalTonnage += (parseFloat(st.weight)||0) * (parseInt(st.reps)||0))));

  const groupedLogs = logs.reduce((acc, log) => {
    const d = new Date(log.date);
    const monthStr = `${t.months[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[monthStr]) acc[monthStr] = [];
    acc[monthStr].push(log); return acc;
  }, {});

  const getBodyDiff = (current, prev, key) => {
    if (!current || !prev) return null;
    const diff = parseFloat(current) - parseFloat(prev);
    if (diff === 0 || isNaN(diff)) return null;
    const sign = diff > 0 ? '+' : '';
    const color = diff > 0 ? activeTheme.success : activeTheme.danger; 
    const unit = key === 'weight' ? 'kg' : 'cm';
    return <Text style={{fontSize: 12, color: color}}> ({sign}{diff.toFixed(1)} {unit})</Text>;
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

      <View style={s.nav}>
        {['workout', 'log', 'body'].map(tabName => (
          <TouchableOpacity key={tabName} style={[s.tab, tab === tabName && s.activeTab]} onPress={() => { triggerHaptic(); setTab(tabName); }}>
            <Text style={[s.tabText, tab === tabName && s.activeTabText]}>{t[tabName].toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TRENING */}
      {tab === 'workout' && (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary, marginBottom: 15 }]} onPress={() => { triggerHaptic(); setIntervalModal(true); }}>
            <Text style={[s.btnText, { color: activeTheme.primary }]}>{t.addIntervalBtn}</Text>
          </TouchableOpacity>

          <Text style={[s.subText, { marginBottom: 5 }]}>{t.favs}:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {exerciseDB.slice(0, 6).map(ex => (
              <TouchableOpacity key={ex.name} style={s.favBtn} onPress={() => { triggerHaptic(); setExercise(ex.name); }}>
                <Text style={s.text}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.card}>
            <TextInput 
              ref={exRef} style={s.input} placeholder={t.addEx} placeholderTextColor={activeTheme.subText} 
              value={exercise} onChangeText={handleExerciseInput} returnKeyType="next"
              onSubmitEditing={() => { if(weightRefs.current[0]) weightRefs.current[0].focus(); }}
            />
            
            {exercise.trim().length > 0 && getHistoryFor(exercise) && (
              <Text style={[s.subText, {color: activeTheme.primary, marginBottom: 10, fontStyle: 'italic'}]}>{getHistoryFor(exercise)}</Text>
            )}

            {suggestions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {suggestions.map(sug => (
                  <TouchableOpacity key={sug.name} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => selectSuggestion(sug.name)}>
                    <Text style={[s.text, { fontSize: 13 }]}>{sug.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {sets.map((item, i) => (
              <View key={item.id} style={s.row}>
                <Text style={s.text}>S{i + 1}</Text>
                <TextInput 
                  ref={el => weightRefs.current[i] = el} style={s.inputSmall} placeholder={t.weight} placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
                  value={item.weight} onChangeText={(v) => { const n = [...sets]; n[i].weight = v; setSets(n); }} 
                  returnKeyType="next" onSubmitEditing={() => { if(repsRefs.current[i]) repsRefs.current[i].focus(); }}
                />
                <TouchableOpacity style={s.unitBtn} onPress={() => { triggerHaptic(); const n = [...sets]; n[i].unit = n[i].unit === 'kg' ? 'lbs' : 'kg'; setSets(n); }}>
                  <Text style={s.text}>{item.unit}</Text>
                </TouchableOpacity>
                <TextInput 
                  ref={el => repsRefs.current[i] = el} style={s.inputSmall} placeholder={t.reps} placeholderTextColor={activeTheme.subText} keyboardType="numeric" 
                  value={item.reps} onChangeText={(v) => { const n = [...sets]; n[i].reps = v; setSets(n); }} 
                  returnKeyType="next" onSubmitEditing={() => { if(weightRefs.current[i+1]) weightRefs.current[i+1].focus(); }}
                />
                <TouchableOpacity onPress={() => { triggerHaptic(); setSets(sets.length > 1 ? sets.filter(x => x.id !== item.id) : sets); }}>
                  <Text style={{ color: activeTheme.danger, fontWeight: 'bold' }}>{t.delete}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={s.textBtn} onPress={() => { triggerHaptic(); setSets([...sets, { id: Date.now().toString(), weight: '', reps: '', unit: 'kg' }]); }}>
              <Text style={s.primaryText}>+ {t.addSet}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btn} onPress={addExercise}><Text style={s.btnText}>{t.addEx}</Text></TouchableOpacity>
          </View>

          {session.length > 0 && (
            <View style={[s.card, { backgroundColor: 'transparent', shadowOpacity: 0, padding: 0 }]}>
              <Text style={[s.subTitle, { marginBottom: 10 }]}>{t.today}:</Text>
              {session.map((ex, i) => (
                <CurrentSessionItem key={ex.id} ex={ex} index={i} s={s} t={t} theme={activeTheme} 
                  removeFromSession={(id) => setSession(session.filter(x => x.id !== id))} 
                  updateNote={(id, note) => setSession(session.map(x => x.id === id ? {...x, note} : x))} 
                />
              ))}
              <TouchableOpacity style={[s.btn, { marginTop: 15, backgroundColor: activeTheme.primary }]} onPress={finishWorkout}>
                <Text style={s.btnText}>{t.finish}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* LOGG */}
      {tab === 'log' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={s.card}>
            <Text style={s.subTitle}>💪 {t.tonnage}</Text>
            <Text style={[s.text, {fontSize: 24, fontWeight: 'bold', color: activeTheme.primary, marginTop: 5}]}>{totalTonnage} kg</Text>
          </View>

          <View style={s.card}>
            <Text style={s.subTitle}>🔥 {t.streak}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {last14Days.map(dateStr => {
                const isTrained = logDates.includes(dateStr);
                return (
                  <View key={dateStr} style={{ alignItems: 'center' }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isTrained ? activeTheme.success : activeTheme.border, marginBottom: 5 }} />
                    <Text style={{ fontSize: 10, color: activeTheme.subText }}>{t.days[new Date(dateStr).getDay()].charAt(0)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.subTitle}>🏆 {t.pr}</Text>
              <TouchableOpacity onPress={() => { triggerHaptic(); setGoalModal(true); }}><Text style={s.primaryText}>+ {t.addGoal}</Text></TouchableOpacity>
            </View>
            {goals.map(g => {
              let prObj = prs[g.exercise];
              if (typeof prObj === 'number') prObj = { kg: prObj, reps: 0 };
              const current = prObj ? prObj[g.unit] || 0 : 0;
              const pct = Math.min((current / parseFloat(g.target)) * 100, 100) || 0;
              
              return (
                <View key={g.id} style={{ marginBottom: 15, marginTop: 10 }}>
                  <View style={s.row}>
                    <Text style={s.text}>{g.exercise}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={s.subText}>{current} / {g.target} {g.unit === 'kg' ? 'kg' : 'reps'}</Text>
                      <TouchableOpacity onPress={() => {
                        Alert.alert("Slett mål", t.confirmDel, [
                          { text: t.cancel, style: "cancel" },
                          { text: t.yes, onPress: () => { triggerHaptic(); const n = goals.filter(x => x.id !== g.id); setGoals(n); saveData('goals_v3', n); }, style: 'destructive' }
                        ]);
                      }} style={{marginLeft: 10}}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text></TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ height: 8, backgroundColor: activeTheme.border, borderRadius: 4, marginTop: 5 }}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? activeTheme.success : activeTheme.primary, borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
          </View>

          {Object.entries(groupedLogs).map(([month, monthLogs]) => (
            <View key={month}>
              <Text style={[s.subTitle, { marginTop: 10, marginBottom: 10 }]}>{month.toUpperCase()}</Text>
              {monthLogs.map(log => (
                <View key={log.id} style={s.card}>
                  <TouchableOpacity onPress={() => { triggerHaptic(); setExpandedLogs(p => ({...p, [log.id]: !p[log.id]})); }} style={s.row}>
                    <Text style={[s.text, { fontWeight: 'bold' }]}>{formatDate(log.date, t, pref.timeFormat)}</Text>
                    <Text style={s.subText}>{expandedLogs[log.id] ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  
                  {expandedLogs[log.id] && (
                    <View style={{marginTop: 10, borderTopWidth: 1, borderColor: activeTheme.border, paddingTop: 10}}>
                      {log.exercises && log.exercises.map((ex, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                          <Text style={[s.text, { fontWeight: 'bold' }]}>{ex.name}</Text>
                          {ex.isInterval ? <Text style={s.subText}>{ex.details}</Text> : 
                            ex.sets.map((st, si) => <Text key={si} style={s.subText}>{t.set} {si+1}: {st.weight} kg x {st.reps}</Text>)
                          }
                          {ex.note ? <Text style={[s.subText, { fontStyle: 'italic', marginTop: 2 }]}>"{ex.note}"</Text> : null}
                        </View>
                      ))}
                      <TouchableOpacity style={{marginTop: 5}} onPress={() => deleteWorkoutLog(log.id)}>
                        <Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* KROPP */}
      {tab === 'body' && (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {bodyLogs.length > 1 && (
            <View style={s.card}>
              <Text style={s.subTitle}>📈 Vektutvikling</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', height: 120, marginTop: 15, justifyContent: 'space-between'}}>
                 {bodyLogs.slice(0, 7).reverse().map((b) => {
                    const maxW = Math.max(...bodyLogs.slice(0,7).map(x => parseFloat(x.data.weight) || 0));
                    const minW = Math.min(...bodyLogs.slice(0,7).map(x => parseFloat(x.data.weight) || 0)) * 0.9;
                    const w = parseFloat(b.data.weight) || 0;
                    const hPct = maxW === minW ? 50 : ((w - minW) / (maxW - minW)) * 100;
                    return (
                      <View key={b.id} style={{alignItems: 'center', flex: 1}}>
                         <Text style={{fontSize: 10, color: activeTheme.text, marginBottom: 5}}>{w}</Text>
                         <View style={{width: 25, height: `${hPct}%`, minHeight: 15, backgroundColor: activeTheme.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4}} />
                      </View>
                    )
                 })}
              </View>
            </View>
          )}

          <View style={s.card}>
            {['weight', 'chest', 'waist', 'hips', 'upperArm', 'lowerArm', 'thigh', 'calf'].map((key, i) => (
              <View key={key} style={s.row}>
                <Text style={s.text}>{t[key]}:</Text>
                <TextInput 
                  ref={el => bodyRefs.current[i] = el} style={[s.inputSmall, {width: '40%'}]} keyboardType="numeric" 
                  placeholder={`${t[key]} ${key === 'weight' ? '(kg)' : '(cm)'}`} placeholderTextColor={activeTheme.subText} 
                  value={bodyData[key]} onChangeText={v => setBodyData({...bodyData, [key]: v})} 
                  returnKeyType="next" onSubmitEditing={() => { if(bodyRefs.current[i+1]) bodyRefs.current[i+1].focus(); }}
                />
              </View>
            ))}
            <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.border, marginTop: 10}]} onPress={pickBodyImage}>
              <Text style={s.text}>{bodyData.image ? '📸 Bilde lagt til (Trykk for å bytte)' : '📸 Legg ved bilde'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, {marginTop: 15}]} onPress={() => {
              triggerHaptic();
              const newLog = { id: Date.now().toString(), date: new Date().toISOString(), data: { ...bodyData } };
              const newBodyLogs = [newLog, ...bodyLogs];
              setBodyLogs(newBodyLogs); saveData('body_v3', newBodyLogs);
              setBodyData({ weight: '', chest: '', waist: '', hips: '', upperArm: '', lowerArm: '', thigh: '', calf: '', image: null });
            }}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
          </View>

          {bodyLogs.map((b, i) => {
            const prevLog = bodyLogs[i + 1]?.data;
            return (
              <View key={b.id} style={s.card}>
                <View style={s.row}>
                  <Text style={[s.text, {fontWeight: 'bold'}]}>{formatDate(b.date, t, pref.timeFormat).split(' kl')[0]}</Text>
                  <TouchableOpacity onPress={() => deleteBodyLog(b.id)}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text></TouchableOpacity>
                </View>
                
                {b.data.image && (
                  <TouchableOpacity onPress={() => { triggerHaptic(); setFullScreenImage(b.data.image); }}>
                    <Image source={{uri: b.data.image}} style={{width: '100%', height: 200, borderRadius: 8, marginVertical: 10}} />
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                  {['weight', 'chest', 'waist', 'hips', 'upperArm', 'lowerArm', 'thigh', 'calf'].map(key => b.data[key] ? (
                    <Text key={key} style={[s.subText, { width: '50%', marginBottom: 5 }]}>
                      {t[key]}: {b.data[key]} {key === 'weight' ? 'kg' : 'cm'}
                      {getBodyDiff(b.data[key], prevLog?.[key], key)}
                    </Text>
                  ) : null)}
                </View>
              </View>
            );
          })}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* FULLSKJERM BILDE MODAL */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={{uri: fullScreenImage}} style={{width: '100%', height: '80%', resizeMode: 'contain'}} />
          <TouchableOpacity style={[s.btn, {position: 'absolute', bottom: 50, backgroundColor: activeTheme.card}]} onPress={() => { triggerHaptic(); setFullScreenImage(null); }}>
            <Text style={{color: activeTheme.text, fontWeight: 'bold'}}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity onPress={async () => { triggerHaptic(); let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 }); if (!r.canceled) savePref('profilePic', r.assets[0].uri); }}>
                  {pref.profilePic ? <Image source={{ uri: pref.profilePic }} style={s.profileImageLarge} /> : <View style={[s.profileImageLarge, { backgroundColor: activeTheme.border, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 40 }}>⚙️</Text></View>}
                </TouchableOpacity>
              </View>

              <Text style={s.subTitle}>{t.yourName}</Text>
              <TextInput style={s.input} placeholder={t.yourName} placeholderTextColor={activeTheme.subText} value={pref.name} onChangeText={v => savePref('name', v)} />

              <Text style={[s.subTitle, {marginTop: 20}]}>{t.lang}</Text>
              <View style={s.row}>
                <TouchableOpacity style={[s.settingBtn, {width: '48%'}, pref.lang === 'no' && s.settingBtnActive]} onPress={() => { triggerHaptic(); savePref('lang', 'no'); }}><Text style={[s.text, pref.lang === 'no' && {color: '#fff'}]}>Norsk</Text></TouchableOpacity>
                <TouchableOpacity style={[s.settingBtn, {width: '48%'}, pref.lang === 'en' && s.settingBtnActive]} onPress={() => { triggerHaptic(); savePref('lang', 'en'); }}><Text style={[s.text, pref.lang === 'en' && {color: '#fff'}]}>English</Text></TouchableOpacity>
              </View>

              <Text style={[s.subTitle, {marginTop: 20}]}>{t.theme}</Text>
              <View style={s.row}>
                {['light', 'dark', 'system'].map(th => (
                  <TouchableOpacity key={th} style={[s.settingBtn, pref.theme === th && s.settingBtnActive]} onPress={() => { triggerHaptic(); savePref('theme', th); }}><Text style={[s.text, pref.theme === th && {color: '#fff'}]}>{t[th]}</Text></TouchableOpacity>
                ))}
              </View>

              <Text style={[s.subTitle, {marginTop: 20}]}>Data & Support</Text>
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); exportData(); }}><Text style={s.text}>{t.backup}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); importData(); }}><Text style={s.text}>{t.restore}</Text></TouchableOpacity>
              
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.border, marginBottom: 10 }]} onPress={() => { triggerHaptic(); setManualOpen(true); }}><Text style={s.text}>{t.manual}</Text></TouchableOpacity>
              
              <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.primary }]} onPress={() => { 
                triggerHaptic(); 
                Linking.openURL('mailto:olektlarsen@gmail.com?subject=Feedback%20Momentum%20App'); 
              }}><Text style={s.btnText}>{t.feedback}</Text></TouchableOpacity>

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
              <TouchableOpacity style={[s.btn, {marginTop: 40, backgroundColor: activeTheme.primary}]} onPress={() => { triggerHaptic(); setManualOpen(false); }}>
                <Text style={s.btnText}>{t.cancel}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MÅL MODAL */}
      <Modal visible={goalModal} animationType="fade" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.title}>{t.newGoal}</Text>
            <TextInput style={s.input} placeholder={t.intName} placeholderTextColor={activeTheme.subText} value={goalData.exercise} onChangeText={handleGoalExerciseInput} />
            
            {goalSuggestions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {goalSuggestions.map(sug => (
                  <TouchableOpacity key={sug.name} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => { triggerHaptic(); setGoalData({...goalData, exercise: sug.name}); setGoalSuggestions([]); }}>
                    <Text style={[s.text, { fontSize: 13 }]}>{sug.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[s.row, {marginTop: 10}]}>
               <TextInput style={[s.input, {flex: 1, marginRight: 10}]} placeholder={t.goalTarget} placeholderTextColor={activeTheme.subText} keyboardType="numeric" value={goalData.target} onChangeText={v => setGoalData({...goalData, target: v})} />
               <TouchableOpacity style={[s.settingBtn, goalData.unit === 'kg' && s.settingBtnActive, {width: '25%'}]} onPress={() => { triggerHaptic(); setGoalData({...goalData, unit: 'kg'}); }}><Text style={[s.text, goalData.unit === 'kg' && {color: '#fff'}]}>Kg</Text></TouchableOpacity>
               <TouchableOpacity style={[s.settingBtn, goalData.unit === 'reps' && s.settingBtnActive, {width: '25%', marginLeft: 5}]} onPress={() => { triggerHaptic(); setGoalData({...goalData, unit: 'reps'}); }}><Text style={[s.text, goalData.unit === 'reps' && {color: '#fff'}]}>{t.count}</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.btn, { marginTop: 10 }]} onPress={() => {
              triggerHaptic();
              if(!goalData.exercise || !goalData.target) return;
              const n = [...goals, { id: Date.now().toString(), exercise: goalData.exercise, target: goalData.target, unit: goalData.unit }];
              setGoals(n); saveData('goals_v3', n); setGoalModal(false); setGoalData({exercise:'', target:'', unit: 'kg'}); setGoalSuggestions([]);
            }}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: 'transparent', marginTop: 5 }]} onPress={() => { triggerHaptic(); setGoalModal(false); setGoalSuggestions([]); }}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.cancel}</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* INTERVALL MODAL */}
      <Modal visible={intervalModal} animationType="fade" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.title}>{t.interval}</Text>
            <TextInput style={s.input} placeholder={t.intName} placeholderTextColor={activeTheme.subText} value={intData.name} onChangeText={v => setIntData({...intData, name: v})} />
            <View style={s.row}><Text style={s.text}>{t.work}</Text><TextInput style={s.inputSmall} keyboardType="numeric" value={intData.work} onChangeText={v => setIntData({...intData, work: v})} /></View>
            <View style={s.row}><Text style={s.text}>{t.rest}</Text><TextInput style={s.inputSmall} keyboardType="numeric" value={intData.rest} onChangeText={v => setIntData({...intData, rest: v})} /></View>
            <View style={s.row}><Text style={s.text}>{t.rounds}</Text><TextInput style={s.inputSmall} keyboardType="numeric" value={intData.rounds} onChangeText={v => setIntData({...intData, rounds: v})} /></View>
            <TouchableOpacity style={[s.btn, { marginTop: 20 }]} onPress={addInterval}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: 'transparent' }]} onPress={() => { triggerHaptic(); setIntervalModal(false); }}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.cancel}</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: theme.text },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 5 },
  text: { color: theme.text, fontSize: 15 },
  subText: { color: theme.subText, fontSize: 13 },
  primaryText: { color: theme.primary, fontWeight: 'bold' },
  profileIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: theme.border },
  profileImageLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: theme.primary },
  nav: { flexDirection: 'row', marginBottom: 20, backgroundColor: theme.card, borderRadius: 10, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: theme.bg },
  tabText: { fontSize: 13, color: theme.subText, fontWeight: 'bold' },
  activeTabText: { color: theme.text },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  input: { borderBottomWidth: 1, borderColor: theme.border, color: theme.text, fontSize: 16, paddingVertical: 8, marginBottom: 10 },
  inputSmall: { borderBottomWidth: 1, borderColor: theme.border, color: theme.text, fontSize: 16, paddingVertical: 8, width: '22%', textAlign: 'center' },
  unitBtn: { backgroundColor: theme.bg, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  btn: { backgroundColor: theme.text, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: theme.bg, fontWeight: 'bold', fontSize: 16 },
  textBtn: { paddingVertical: 10, marginBottom: 10 },
  favBtn: { backgroundColor: theme.card, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: theme.border },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.card, padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  settingBtn: { padding: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 8, alignItems: 'center', width: '30%' },
  settingBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary }
});