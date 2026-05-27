import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Appearance, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- MASSIV, TOSRÅKLIG ØVELSESDATABASE MED SØKETAGS ---
const defaultDB = [
  // Bryst
  { name: 'Benkpress', en: 'Bench Press', muscle: 'Bryst', tags: ['benkpress', 'bench press', 'bryst', 'chest', 'press'] },
  { name: 'Skrå Benkpress (Stang)', en: 'Incline Bench Press', muscle: 'Bryst', tags: ['skrå benkpress', 'incline bench', 'bryst', 'chest', 'upper'] },
  { name: 'Skrå Benkpress (Manualer)', en: 'Incline Dumbbell Press', muscle: 'Bryst', tags: ['skrå', 'hantler', 'manualer', 'incline dumbbell', 'bryst', 'chest'] },
  { name: 'Benkpress (Manualer)', en: 'Dumbbell Press', muscle: 'Bryst', tags: ['benkpress manualer', 'dumbbell press', 'bryst', 'chest'] },
  { name: 'Dips', en: 'Dips', muscle: 'Bryst', tags: ['dips', 'bryst', 'chest', 'triceps'] },
  { name: 'Flyes (Manualer)', en: 'Dumbbell Flyes', muscle: 'Bryst', tags: ['flyes', 'dumbbell flyes', 'bryst', 'chest'] },
  { name: 'Kabel Crossovers', en: 'Cable Crossovers', muscle: 'Bryst', tags: ['kabel', 'cable crossover', 'bryst', 'chest'] },
  { name: 'Pec Dec Maskin', en: 'Pec Deck Machine', muscle: 'Bryst', tags: ['pec dec', 'maskin', 'machine', 'bryst', 'chest'] },
  { name: 'Pushups', en: 'Push-ups', muscle: 'Bryst', tags: ['pushups', 'armhevinger', 'bryst', 'chest'] },
  { name: 'Decline Benkpress', en: 'Decline Bench Press', muscle: 'Bryst', tags: ['decline', 'bryst', 'chest'] },
  // Bein
  { name: 'Knebøy', en: 'Squat', muscle: 'Bein', tags: ['knebøy', 'squat', 'bein', 'legs', 'bøy'] },
  { name: 'Frontbøy', en: 'Front Squat', muscle: 'Bein', tags: ['frontbøy', 'front squat', 'bein', 'legs'] },
  { name: 'Benpress', en: 'Leg Press', muscle: 'Bein', tags: ['benpress', 'leg press', 'bein', 'legs'] },
  { name: 'Bulgarsk Utfall', en: 'Bulgarian Split Squat', muscle: 'Bein', tags: ['bulgarsk', 'utfall', 'bulgarian', 'split squat', 'bein', 'legs'] },
  { name: 'Utfall (Gående)', en: 'Walking Lunges', muscle: 'Bein', tags: ['utfall', 'lunges', 'bein', 'legs'] },
  { name: 'Leg Extension', en: 'Leg Extension', muscle: 'Bein', tags: ['leg extension', 'spark', 'bein', 'legs', 'quads'] },
  { name: 'Leg Curl (Sittende)', en: 'Seated Leg Curl', muscle: 'Bein', tags: ['leg curl', 'hamstrings', 'bein', 'legs'] },
  { name: 'Leg Curl (Liggende)', en: 'Lying Leg Curl', muscle: 'Bein', tags: ['leg curl', 'hamstrings', 'bein', 'legs', 'liggende'] },
  { name: 'Strake Markløft', en: 'Stiff-Leg Deadlift', muscle: 'Bein', tags: ['strake', 'markløft', 'stiff leg', 'deadlift', 'hamstrings', 'bein', 'legs'] },
  { name: 'Tåhev (Stående)', en: 'Standing Calf Raise', muscle: 'Bein', tags: ['tåhev', 'calf raise', 'legger', 'calves', 'bein', 'legs'] },
  { name: 'Tåhev (Sittende)', en: 'Seated Calf Raise', muscle: 'Bein', tags: ['tåhev sittende', 'seated calf', 'legger', 'calves', 'bein', 'legs'] },
  { name: 'Hack Squat', en: 'Hack Squat', muscle: 'Bein', tags: ['hack squat', 'bein', 'legs', 'maskin'] },
  { name: 'Hip Thrust', en: 'Hip Thrust', muscle: 'Bein', tags: ['hip thrust', 'glutes', 'rumpe', 'bein', 'legs'] },
  { name: 'Glute Bridge', en: 'Glute Bridge', muscle: 'Bein', tags: ['glute bridge', 'rumpe', 'bein', 'legs'] },
  // Rygg
  { name: 'Markløft', en: 'Deadlift', muscle: 'Rygg', tags: ['markløft', 'deadlift', 'rygg', 'back', 'base'] },
  { name: 'Pullups', en: 'Pull-ups', muscle: 'Rygg', tags: ['pullups', 'kroppsheving', 'rygg', 'back', 'lats'] },
  { name: 'Chinups', en: 'Chin-ups', muscle: 'Rygg', tags: ['chinups', 'rygg', 'back', 'biceps'] },
  { name: 'Nedtrekk (Bredt grep)', en: 'Lat Pulldown (Wide)', muscle: 'Rygg', tags: ['nedtrekk', 'lat pulldown', 'rygg', 'back', 'lats'] },
  { name: 'Nedtrekk (Smalt grep)', en: 'Lat Pulldown (Close)', muscle: 'Rygg', tags: ['nedtrekk smalt', 'lat pulldown close', 'rygg', 'back'] },
  { name: 'Foroverbøyd Roing (Stang)', en: 'Barbell Row', muscle: 'Rygg', tags: ['foroverbøyd roing', 'barbell row', 'rygg', 'back'] },
  { name: 'Sittende Kabelroing', en: 'Seated Cable Row', muscle: 'Rygg', tags: ['sittende roing', 'cable row', 'rygg', 'back'] },
  { name: 'T-Bar Roing', en: 'T-Bar Row', muscle: 'Rygg', tags: ['t-bar', 'roing', 'rygg', 'back'] },
  { name: 'Enarms Hantelroing', en: 'Dumbbell Row', muscle: 'Rygg', tags: ['hantelroing', 'dumbbell row', 'rygg', 'back', 'manual'] },
  { name: 'Facepulls', en: 'Facepulls', muscle: 'Rygg', tags: ['facepulls', 'rygg', 'back', 'skuldre', 'rear delts'] },
  { name: 'Rumensk Markløft (RDL)', en: 'Romanian Deadlift (RDL)', muscle: 'Rygg', tags: ['rdl', 'rumensk', 'romanian deadlift', 'rygg', 'back', 'hamstrings'] },
  { name: 'Straight Arm Pulldown', en: 'Straight Arm Pulldown', muscle: 'Rygg', tags: ['straight arm', 'lats', 'rygg', 'back'] },
  { name: 'Shrugs (Stang)', en: 'Barbell Shrugs', muscle: 'Rygg', tags: ['shrugs', 'nakke', 'traps', 'rygg', 'back'] },
  { name: 'Shrugs (Manualer)', en: 'Dumbbell Shrugs', muscle: 'Rygg', tags: ['shrugs manualer', 'nakke', 'traps', 'rygg', 'back'] },
  // Skuldre
  { name: 'Militærpress', en: 'Overhead Press', muscle: 'Skuldre', tags: ['militærpress', 'overhead press', 'skuldre', 'shoulders', 'ohp'] },
  { name: 'Skulderpress (Manualer)', en: 'Dumbbell Shoulder Press', muscle: 'Skuldre', tags: ['skulderpress', 'dumbbell press', 'skuldre', 'shoulders'] },
  { name: 'Sidehev (Manualer)', en: 'Lateral Raises', muscle: 'Skuldre', tags: ['sidehev', 'lateral raises', 'skuldre', 'shoulders'] },
  { name: 'Sidehev (Kabel)', en: 'Cable Lateral Raises', muscle: 'Skuldre', tags: ['sidehev kabel', 'cable lateral', 'skuldre', 'shoulders'] },
  { name: 'Fronthev', en: 'Front Raises', muscle: 'Skuldre', tags: ['fronthev', 'front raises', 'skuldre', 'shoulders'] },
  { name: 'Omvendt Pec Dec', en: 'Reverse Pec Deck', muscle: 'Skuldre', tags: ['omvendt pec dec', 'reverse pec deck', 'skuldre', 'shoulders', 'rear delts'] },
  { name: 'Arnold Press', en: 'Arnold Press', muscle: 'Skuldre', tags: ['arnold press', 'skuldre', 'shoulders'] },
  { name: 'Upright Row', en: 'Upright Row', muscle: 'Skuldre', tags: ['upright row', 'stående roing', 'skuldre', 'shoulders'] },
  // Armer
  { name: 'Biceps Curl (Stang)', en: 'Barbell Curl', muscle: 'Armer', tags: ['biceps curl', 'barbell curl', 'armer', 'arms', 'biceps'] },
  { name: 'Biceps Curl (Manualer)', en: 'Dumbbell Curl', muscle: 'Armer', tags: ['biceps manualer', 'dumbbell curl', 'armer', 'arms', 'biceps'] },
  { name: 'Hammer Curls', en: 'Hammer Curls', muscle: 'Armer', tags: ['hammer curls', 'armer', 'arms', 'biceps'] },
  { name: 'Kabel Curls', en: 'Cable Curls', muscle: 'Armer', tags: ['kabel curls', 'cable curls', 'armer', 'arms', 'biceps'] },
  { name: 'Preacher Curl', en: 'Preacher Curl', muscle: 'Armer', tags: ['preacher curl', 'armer', 'arms', 'biceps'] },
  { name: 'Franskpress', en: 'Skullcrushers', muscle: 'Armer', tags: ['franskpress', 'skullcrushers', 'armer', 'arms', 'triceps'] },
  { name: 'Triceps Pushdown (Tau)', en: 'Triceps Pushdown (Rope)', muscle: 'Armer', tags: ['pushdown tau', 'rope pushdown', 'armer', 'arms', 'triceps'] },
  { name: 'Triceps Pushdown (Stang)', en: 'Triceps Pushdown (Bar)', muscle: 'Armer', tags: ['pushdown stang', 'bar pushdown', 'armer', 'arms', 'triceps'] },
  { name: 'Overhead Triceps Extension', en: 'Overhead Triceps Ext', muscle: 'Armer', tags: ['overhead triceps', 'armer', 'arms', 'triceps'] },
  { name: 'Smal Benkpress', en: 'Close Grip Bench Press', muscle: 'Armer', tags: ['smal benkpress', 'close grip', 'armer', 'arms', 'triceps', 'bryst'] },
  // Mage/Kjerne
  { name: 'Planken', en: 'Plank', muscle: 'Mage', tags: ['planken', 'plank', 'mage', 'abs', 'kjerne'] },
  { name: 'Crunches', en: 'Crunches', muscle: 'Mage', tags: ['crunches', 'mage', 'abs', 'kjerne'] },
  { name: 'Hengende Benhev', en: 'Hanging Leg Raises', muscle: 'Mage', tags: ['hengende benhev', 'hanging leg raises', 'mage', 'abs', 'kjerne'] },
  { name: 'Cable Crunches', en: 'Cable Crunches', muscle: 'Mage', tags: ['cable crunches', 'kabel crunches', 'mage', 'abs', 'kjerne'] },
  { name: 'Russian Twists', en: 'Russian Twists', muscle: 'Mage', tags: ['russian twists', 'mage', 'abs', 'kjerne'] },
  { name: 'Ab Wheel Rollout', en: 'Ab Wheel Rollout', muscle: 'Mage', tags: ['ab wheel', 'mage', 'abs', 'kjerne'] }
];

const dict = {
  no: { 
    workout: 'Trening', log: 'Logg', body: 'Kropp', pr: 'Skrytetavle & Mål', settings: 'Innstillinger', save: 'Lagre', cancel: 'Lukk', 
    weight: 'Vekt', reps: 'Reps', count: 'Antall', addSet: 'Legg til sett', addEx: 'Legg til øvelse', finish: 'Fullfør økt', 
    chest: 'Bryst', waist: 'Midje', hips: 'Hofter', upperArm: 'Overarm', lowerArm: 'Underarm', thigh: 'Lår', calf: 'Legg', 
    theme: 'Tema', lang: 'Språk', light: 'Lys', dark: 'Mørk', system: 'System', today: 'Dagens Økt', delete: 'Slett', 
    interval: 'Intervall', work: 'Jobb (s)', rest: 'Hvile (s)', rounds: 'Runder', intName: 'Navn', confirmDel: 'Sikker på at du vil slette?', 
    yes: 'Ja', set: 'sett', addIntervalBtn: '⏱ Intervall', timeFormat: 'Tidsformat', backup: 'Sikkerhetskopi', restore: 'Gjenopprett', 
    note: 'Notat for øvelsen...', goalTarget: 'Mål', newGoal: 'Nytt Mål', addGoal: 'Legg til Mål', favs: 'Favoritter', 
    suggestions: 'Forslag', muscleDist: 'Muskelgrupper', streak: 'Aktivitet siste 14 dager', tonnage: 'Total arbeidsvekt denne uken', 
    manual: 'Brukermanual', feedback: 'Gi Feedback', yourName: 'Ditt navn', days: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'], 
    months: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'], 
    warmUp: 'O', workSet: 'S', plans: 'Planlagte økter', addPlan: 'Ny Plan', loadPlan: 'Bruk Plan', planName: 'Navn på plan', 
    disclaimer: 'Ansvarsfraskrivelse', disclaimerText: 'Bruk av Momentum skjer på eget ansvar. Rådfør deg med lege før du starter et treningsprogram. Utvikleren er ikke ansvarlig for skader eller tap av data.', 
    quickGuideTitle: 'Velkommen til Momentum', date: 'Dato', changeDate: 'Endre dato (Legg inn tidligere)',
    manualText: "TRENING & O/S-SETT:\nVelg øvelser og legg til sett. Trykk på 'S' for å veksle til 'O' (Oppvarming). Kun S-sett (Arbeidssett) teller mot ukens totale løft. Trykk 'Fullfør økt' for å lagre.\n\nMANUELL REGISTRERING:\nHvis du har glemt å logge en økt eller en kroppsmåling, kan du trykke på 'Dato'-knappen øverst på skjermen for å rulle tilbake tiden og lagre historikken på riktig dag.\n\nPLANLAGTE ØKTER:\nTrykk på 'Planlagte økter' for å bygge ferdige rutiner. Da slipper du å legge inn øvelsene manuelt hver gang du trener.\n\nENHETER (KG/LBS):\nDu kan bytte mellom kg og lbs på farten. Appen kalkulerer automatisk lbs om til kg i det du lagrer, så historikken forblir ryddig.\n\nSIKKERHET:\nTa jevnlig sikkerhetskopi (eksport) av dataene dine i Innstillinger for å unngå tap av logg." 
  },
  en: { 
    workout: 'Workout', log: 'Log', body: 'Body', pr: 'PRs & Goals', settings: 'Settings', save: 'Save', cancel: 'Close', 
    weight: 'Weight', reps: 'Reps', count: 'Count', addSet: 'Add set', addEx: 'Add exercise', finish: 'Finish Workout', 
    chest: 'Chest', waist: 'Waist', hips: 'Hips', upperArm: 'Biceps', lowerArm: 'Forearm', thigh: 'Thigh', calf: 'Calf', 
    theme: 'Theme', lang: 'Language', light: 'Light', dark: 'Dark', system: 'System', today: 'Today', delete: 'Delete', 
    interval: 'Interval', work: 'Work (s)', rest: 'Rest (s)', rounds: 'Rounds', intName: 'Name', confirmDel: 'Are you sure?', 
    yes: 'Yes', set: 'set', addIntervalBtn: '⏱ Interval', timeFormat: 'Time Format', backup: 'Backup', restore: 'Restore', 
    note: 'Note...', goalTarget: 'Target', newGoal: 'New Goal', addGoal: 'Add Goal', favs: 'Favorites', 
    suggestions: 'Suggestions', muscleDist: 'Muscles', streak: '14-day Activity', tonnage: 'Working weight this week', 
    manual: 'User Manual', feedback: 'Send Feedback', yourName: 'Your Name', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
    warmUp: 'W', workSet: 'S', plans: 'Workout Plans', addPlan: 'New Plan', loadPlan: 'Load Plan', planName: 'Plan Name', 
    disclaimer: 'Disclaimer', disclaimerText: 'Use of Momentum is at your own risk. Consult a doctor before starting any exercise program. The developer is not liable for injuries or data loss.', 
    quickGuideTitle: 'Welcome to Momentum', date: 'Date', changeDate: 'Change Date (Log past history)',
    manualText: "WORKOUT & W/S-SETS:\nSelect exercises and add sets. Tap 'S' to toggle to 'W' (Warm-up). Only S-sets (Working sets) count towards your weekly tonnage. Press 'Finish Workout' to save.\n\nMANUAL LOGGING:\nIf you forgot to log a session or body measurement, tap the 'Date' button at the top to roll back time and save history on the correct day.\n\nWORKOUT PLANS:\nTap 'Workout Plans' to build routines. Load them to skip adding exercises manually during your workout.\n\nUNITS (KG/LBS):\nToggle between kg and lbs on the fly. The app auto-converts lbs to kg upon saving for a consistent history.\n\nSECURITY:\nRegularly backup (export) your data in Settings to prevent history loss." 
  }
};

const themes = {
  light: { bg: '#F2F2F7', card: '#FFFFFF', text: '#000000', subText: '#8E8E93', border: '#C6C6C8', primary: '#007AFF', danger: '#FF3B30', success: '#34C759', warning: '#FF9500' },
  dark: { bg: '#000000', card: '#1C1C1E', text: '#FFFFFF', subText: '#EBEBF5', border: '#38383A', primary: '#0A84FF', danger: '#FF453A', success: '#30D158', warning: '#FF9F0A' }
};

const formatDate = (iso, langDict, timeFormat, hideTime = false) => {
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

const triggerHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// --- HJELPEFUNKSJON FOR SETT-NUMMERERING ---
const getSetDisplay = (sets, index, lang) => {
  const type = sets[index].type;
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (sets[i].type === type) count++;
  }
  const typeChar = type === 'S' ? 'S' : (lang === 'no' ? 'O' : 'W');
  return `${typeChar}${count}`;
};

// --- KOMPONENTER ---
const CurrentSessionItem = ({ ex, index, removeFromSession, updateNote, s, t, theme, lang }) => {
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
            <Text key={i} style={s.text}>{t.set} {getSetDisplay(ex.sets, i, lang)}: {set.weight} kg x {set.reps}</Text>
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
  const [sets, setSets] = useState([{ id: '1', weight: '', reps: '', unit: 'kg', type: 'S' }]);
  const [session, setSession] = useState([]);
  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState({});
  const [goals, setGoals] = useState([]);
  const [plans, setPlans] = useState([]);
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
  const [planModal, setPlanModal] = useState(false);
  const [planBuilderModal, setPlanBuilderModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', exercises: [] });

  // Tidsmaskin States
  const [customDateOffset, setCustomDateOffset] = useState(0); // 0 = i dag, -1 = i går, etc.

  // Startup States
  const [startupStep, setStartupStep] = useState(0); // 0 = hidden, 1 = lang, 2 = guide
  const [pref, setPref] = useState({ theme: 'dark', lang: 'no', timeFormat: '24h', profilePic: null, name: '', hasSeenStartup: false });
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
    try {
      const keys = ['logs_v3', 'session_v3', 'prs_v3', 'body_v3', 'settings_v3', 'db_v3', 'goals_v3', 'plans_v3'];
      const data = await AsyncStorage.multiGet(keys.map(k => `@momentum_${k}`));
      const parsed = data.reduce((acc, [key, val]) => { 
        try { acc[key.replace('@momentum_', '')] = val ? JSON.parse(val) : null; } 
        catch(e) { acc[key.replace('@momentum_', '')] = null; }
        return acc; 
      }, {});

      if (parsed.logs_v3) setLogs(parsed.logs_v3);
      if (parsed.session_v3) setSession(parsed.session_v3);
      if (parsed.prs_v3) setPrs(parsed.prs_v3);
      if (parsed.body_v3) setBodyLogs(parsed.body_v3);
      if (parsed.db_v3) setExerciseDB(parsed.db_v3);
      if (parsed.goals_v3) setGoals(parsed.goals_v3);
      if (parsed.plans_v3) setPlans(parsed.plans_v3);
      
      let loadedPref = { ...pref };
      if (parsed.settings_v3) {
        loadedPref = { ...loadedPref, ...parsed.settings_v3 };
        setPref(loadedPref);
      }
      
      if (!loadedPref.hasSeenStartup) {
        setStartupStep(1);
      }
    } catch (error) {
      console.log("Feil ved lasting av data:", error);
    }
  };

  const saveData = async (key, val) => { 
    try { await AsyncStorage.setItem(`@momentum_${key}`, JSON.stringify(val)); } 
    catch (error) { console.log("Feil ved lagring:", error); }
  };

  const savePref = (key, val) => { const n = { ...pref, [key]: val }; setPref(n); saveData('settings_v3', n); };

  // --- BACKUP/RESTORE ---
  const exportData = async () => {
    try {
      const keys = ['logs_v3', 'session_v3', 'prs_v3', 'body_v3', 'settings_v3', 'db_v3', 'goals_v3', 'plans_v3'];
      const data = await AsyncStorage.multiGet(keys.map(k => `@momentum_${k}`));
      const exportObj = data.reduce((acc, [key, val]) => { 
        if (val) { try { acc[key.replace('@momentum_', '')] = JSON.parse(val); } catch(e) {} }
        return acc; 
      }, {});

      const jsonString = JSON.stringify(exportObj);
      const fileUri = FileSystem.documentDirectory + 'momentum_backup.json';
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Lagre Momentum Sikkerhetskopi' });
      } else {
        Alert.alert("Feil", "Deling er ikke tilgjengelig på denne telefonen.");
      }
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke opprette sikkerhetskopi.");
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(fileContent);

      if (typeof parsed !== 'object' || (!parsed.logs_v3 && !parsed.settings_v3)) {
        Alert.alert("Feil", "Dette ser ikke ut som en gyldig sikkerhetskopi for Momentum.");
        return;
      }

      Alert.alert(
        "Gjenopprett Data", 
        "Dette vil overskrive alt innholdet i appen akkurat nå. Er du sikker?", 
        [
          { text: "Avbryt", style: "cancel" },
          { 
            text: "Gjenopprett", 
            style: "destructive",
            onPress: async () => {
              const multiSetData = [];
              for (const key of Object.keys(parsed)) {
                if(parsed[key]) { multiSetData.push([`@momentum_${key}`, JSON.stringify(parsed[key])]); }
              }
              await AsyncStorage.multiSet(multiSetData);
              loadAllData();
              Alert.alert("Suksess!", "Dataene ble gjenopprettet.");
            } 
          }
        ]
      );
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke lese filen.");
    }
  };

  const t = dict[pref.lang] || dict['no'];
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme];
  const s = createStyles(activeTheme);

  // --- HJELPERE FOR DATO ---
  const getCustomDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + customDateOffset);
    return d;
  };
  const getCustomDateISO = () => getCustomDate().toISOString();

  const handleExerciseInput = (text) => {
    setExercise(text);
    if (text.length > 0) {
      const matches = exerciseDB.filter(e => 
        e.name.toLowerCase().includes(text.toLowerCase()) || 
        (e.en && e.en.toLowerCase().includes(text.toLowerCase())) ||
        (e.tags && e.tags.some(tag => tag.includes(text.toLowerCase())))
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
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
    
    // Konverter og valider
    const validSets = sets.filter(x => x.weight !== '' || x.reps !== '').map(x => ({
      weight: x.unit === 'lbs' ? (parseFloat(x.weight.replace(',', '.')) / 2.20462).toFixed(1) : (x.weight.replace(',', '.') || '0'),
      reps: x.reps || '0',
      type: x.type || 'S'
    }));
    if (validSets.length === 0) return;

    // Sjekk Database
    const exName = exercise.trim();
    const existingDbItem = exerciseDB.find(e => 
      e.name.toLowerCase() === exName.toLowerCase() || 
      (e.en && e.en.toLowerCase() === exName.toLowerCase())
    );
    const finalName = existingDbItem ? (pref.lang === 'en' && existingDbItem.en ? existingDbItem.en : existingDbItem.name) : exName;

    if (!existingDbItem) {
      const newDB = [...exerciseDB, { name: finalName, en: finalName, muscle: 'Annet', tags: [finalName.toLowerCase()] }];
      setExerciseDB(newDB); saveData('db_v3', newDB);
    }

    // PR Logikk (Kun for Arbeidssett - S)
    const workSets = validSets.filter(s => s.type === 'S');
    let newPr = false;
    let prObj = { ...((prs[finalName] && typeof prs[finalName] === 'object') ? prs[finalName] : { kg: typeof prs[finalName] === 'number' ? prs[finalName] : 0, reps: 0 }) };
    
    if (workSets.length > 0) {
      const maxW = Math.max(...workSets.map(x => parseFloat(x.weight) || 0));
      const maxR = Math.max(...workSets.map(x => parseInt(x.reps) || 0));
      
      if (maxW > prObj.kg || maxR > prObj.reps) {
        prObj.kg = Math.max(prObj.kg, maxW);
        prObj.reps = Math.max(prObj.reps, maxR);
        const newPrs = { ...prs, [finalName]: prObj };
        setPrs(newPrs); saveData('prs_v3', newPrs);
        newPr = true;
      }
    }

    if (newPr) {
      const matchedGoal = goals.find(g => g.exercise.toLowerCase() === finalName.toLowerCase());
      if (matchedGoal) {
        const target = parseFloat(matchedGoal.target);
        if ((matchedGoal.unit === 'kg' && prObj.kg >= target) || (matchedGoal.unit === 'reps' && prObj.reps >= target)) {
          setTimeout(() => Alert.alert("🏆 Mål nådd!", `Fantastisk levert! Du smadret målet ditt på ${target} ${matchedGoal.unit} i ${finalName}.`), 500);
        }
      }
    }

    const newSession = [...session, { id: Date.now().toString(), name: finalName, sets: validSets, isInterval: false, note: '' }];
    setSession(newSession); saveData('session_v3', newSession);
    
    setExercise(''); setSuggestions([]); setSets([{ id: Date.now().toString(), weight: '', reps: '', unit: 'kg', type: 'S' }]);
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
    const newLog = { id: Date.now().toString(), date: getCustomDateISO(), exercises: session };
    const newLogs = [newLog, ...logs];
    // Sorter logs i tilfelle vi la til en gammel dato
    newLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLogs(newLogs); saveData('logs_v3', newLogs);
    setSession([]); AsyncStorage.removeItem('@momentum_session_v3');
    setCustomDateOffset(0); // Reset time machine
    setTab('log');
  };

  // --- PLANLAGTE ØKTER LOGIKK ---
  const savePlan = () => {
    if (!newPlan.name || newPlan.exercises.length === 0) return;
    const newPlans = [...plans, { id: Date.now().toString(), ...newPlan }];
    setPlans(newPlans); saveData('plans_v3', newPlans);
    setPlanBuilderModal(false); setNewPlan({ name: '', exercises: [] });
  };

  const loadPlanToSession = (plan) => {
    const loadedSession = plan.exercises.map((ex, i) => ({
      id: `${Date.now()}_${i}`,
      name: ex.name,
      sets: ex.sets.map((s, j) => ({ id: `${Date.now()}_${i}_${j}`, weight: '', reps: s.reps, unit: 'kg', type: s.type })),
      isInterval: false, note: ''
    }));
    const newSession = [...session, ...loadedSession];
    setSession(newSession); saveData('session_v3', newSession);
    setPlanModal(false);
  };

  // UI Beregninger
  const logDates = logs.map(l => l.date.split('T')[0]);
  const last14Days = Array.from({length: 14}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split('T')[0]; });

  const thisMonday = getMonday(new Date());
  const currentWeekLogs = logs.filter(l => new Date(l.date) >= thisMonday);
  let totalTonnage = 0;
  // KUN ARBEIDSSETT (S) TELLER PÅ TONNAGE
  currentWeekLogs.forEach(l => l.exercises?.forEach(ex => ex.sets?.forEach(st => {
    if (st.type === 'S') totalTonnage += (parseFloat(st.weight)||0) * (parseInt(st.reps)||0);
  })));

  const groupedLogs = logs.reduce((acc, log) => {
    const d = new Date(log.date);
    const monthStr = `${t.months[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[monthStr]) acc[monthStr] = [];
    acc[monthStr].push(log); return acc;
  }, {});

  // Date Navigator UI
  const DateNavigator = () => (
    <View style={[s.row, { backgroundColor: activeTheme.card, padding: 10, borderRadius: 8, marginBottom: 15, justifyContent: 'center' }]}>
      <TouchableOpacity onPress={() => { triggerHaptic(); setCustomDateOffset(p => p - 1); }} style={{ paddingHorizontal: 15 }}><Text style={{fontSize: 20, color: activeTheme.primary}}>◀</Text></TouchableOpacity>
      <View style={{ alignItems: 'center', width: 180 }}>
        <Text style={[s.subText, {fontSize: 11}]}>{t.date}</Text>
        <Text style={[s.text, {fontWeight: 'bold', color: customDateOffset === 0 ? activeTheme.success : activeTheme.warning}]}>
          {customDateOffset === 0 ? t.today : formatDate(getCustomDateISO(), t, pref.timeFormat, true)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => { if(customDateOffset < 0) { triggerHaptic(); setCustomDateOffset(p => p + 1); } }} style={{ paddingHorizontal: 15 }}>
        <Text style={{fontSize: 20, color: customDateOffset < 0 ? activeTheme.primary : activeTheme.bg}}>▶</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* STARTUP / QUICK GUIDE MODAL */}
      <Modal visible={startupStep > 0} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { flex: 0.9, justifyContent: 'center' }]}>
            {startupStep === 1 ? (
              <View>
                <Text style={[s.title, {textAlign: 'center', marginBottom: 30}]}>Choose Language / Velg Språk</Text>
                <TouchableOpacity style={[s.btn, {marginBottom: 15, backgroundColor: activeTheme.primary}]} onPress={() => { savePref('lang', 'en'); setStartupStep(2); }}>
                  <Text style={s.btnText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.primary}]} onPress={() => { savePref('lang', 'no'); setStartupStep(2); }}>
                  <Text style={s.btnText}>Norsk</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[s.title, {textAlign: 'center', marginBottom: 20}]}>{t.quickGuideTitle}</Text>
                <Text style={[s.text, {lineHeight: 24, marginBottom: 20}]}>{t.manualText}</Text>
                <View style={{backgroundColor: activeTheme.bg, padding: 15, borderRadius: 8, marginBottom: 30}}>
                  <Text style={[s.subTitle, {color: activeTheme.danger}]}>{t.disclaimer}</Text>
                  <Text style={[s.subText, {fontStyle: 'italic'}]}>{t.disclaimerText}</Text>
                </View>
                <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.success}]} onPress={() => { 
                  savePref('hasSeenStartup', true); 
                  setStartupStep(0); 
                }}>
                  <Text style={s.btnText}>Start Momentum</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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

      {/* NAVIGATION */}
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
          <DateNavigator />

          <View style={s.row}>
            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary, marginRight: 5 }]} onPress={() => { triggerHaptic(); setIntervalModal(true); }}>
              <Text style={[s.btnText, { color: activeTheme.primary }]}>{t.addIntervalBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary, marginLeft: 5 }]} onPress={() => { triggerHaptic(); setPlanModal(true); }}>
              <Text style={[s.btnText, { color: activeTheme.primary }]}>📋 {t.plans}</Text>
            </TouchableOpacity>
          </View>

          <View style={[s.card, { marginTop: 15 }]}>
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
                {suggestions.map((sug, i) => (
                  <TouchableOpacity key={i} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => selectSuggestion(pref.lang === 'en' && sug.en ? sug.en : sug.name)}>
                    <Text style={[s.text, { fontSize: 13 }]}>{pref.lang === 'en' && sug.en ? sug.en : sug.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {sets.map((item, i) => (
              <View key={item.id} style={s.row}>
                <TouchableOpacity style={{ width: 35, alignItems: 'center', padding: 5, backgroundColor: item.type === 'S' ? activeTheme.bg : activeTheme.border, borderRadius: 6 }} 
                  onPress={() => { triggerHaptic(); const n = [...sets]; n[i].type = n[i].type === 'S' ? (pref.lang === 'no' ? 'O' : 'W') : 'S'; setSets(n); }}>
                  <Text style={[s.text, { fontWeight: 'bold', color: item.type === 'S' ? activeTheme.primary : activeTheme.text }]}>{getSetDisplay(sets, i, pref.lang)}</Text>
                </TouchableOpacity>

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
            <TouchableOpacity style={s.textBtn} onPress={() => { triggerHaptic(); setSets([...sets, { id: Date.now().toString(), weight: '', reps: '', unit: 'kg', type: sets[sets.length-1].type }]); }}>
              <Text style={s.primaryText}>+ {t.addSet}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btn} onPress={addExercise}><Text style={s.btnText}>{t.addEx}</Text></TouchableOpacity>
          </View>

          {session.length > 0 && (
            <View style={[s.card, { backgroundColor: 'transparent', shadowOpacity: 0, padding: 0 }]}>
              <Text style={[s.subTitle, { marginBottom: 10 }]}>{t.today}:</Text>
              {session.map((ex, i) => (
                <CurrentSessionItem key={ex.id} ex={ex} index={i} s={s} t={t} theme={activeTheme} lang={pref.lang}
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
            <Text style={[s.subText, {fontSize: 11, marginTop: 5}]}>* Regner kun S-sett (Arbeidssett)</Text>
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
                            ex.sets.map((st, si) => <Text key={si} style={s.subText}>{t.set} {getSetDisplay(ex.sets, si, pref.lang)}: {st.weight} kg x {st.reps}</Text>)
                          }
                          {ex.note ? <Text style={[s.subText, { fontStyle: 'italic', marginTop: 2 }]}>"{ex.note}"</Text> : null}
                        </View>
                      ))}
                      <TouchableOpacity style={{marginTop: 5}} onPress={() => {
                        Alert.alert("Slett", t.confirmDel, [
                          { text: t.cancel, style: "cancel" },
                          { text: t.yes, onPress: () => { triggerHaptic(); const newLogs = logs.filter(l => l.id !== log.id); setLogs(newLogs); saveData('logs_v3', newLogs); }, style: 'destructive' }
                        ]);
                      }}>
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
          
          <DateNavigator />

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
            <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.border, marginTop: 10}]} onPress={async () => {
              triggerHaptic();
              let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
              if (!r.canceled) setBodyData({...bodyData, image: r.assets[0].uri});
            }}>
              <Text style={s.text}>{bodyData.image ? '📸 Bilde lagt til (Trykk for å bytte)' : '📸 Legg ved bilde'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, {marginTop: 15}]} onPress={() => {
              triggerHaptic();
              const newLog = { id: Date.now().toString(), date: getCustomDateISO(), data: { ...bodyData } };
              const newBodyLogs = [newLog, ...bodyLogs];
              newBodyLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
              setBodyLogs(newBodyLogs); saveData('body_v3', newBodyLogs);
              setBodyData({ weight: '', chest: '', waist: '', hips: '', upperArm: '', lowerArm: '', thigh: '', calf: '', image: null });
              setCustomDateOffset(0);
            }}><Text style={s.btnText}>{t.save}</Text></TouchableOpacity>
          </View>

          {bodyLogs.map((b, i) => {
            const prevLog = bodyLogs[i + 1]?.data;
            return (
              <View key={b.id} style={s.card}>
                <View style={s.row}>
                  <Text style={[s.text, {fontWeight: 'bold'}]}>{formatDate(b.date, t, pref.timeFormat).split(' kl')[0]}</Text>
                  <TouchableOpacity onPress={() => {
                    Alert.alert("Slett", t.confirmDel, [
                      { text: t.cancel, style: "cancel" },
                      { text: t.yes, onPress: () => { triggerHaptic(); const n = bodyLogs.filter(l => l.id !== b.id); setBodyLogs(n); saveData('body_v3', n); }, style: 'destructive' }
                    ]);
                  }}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text></TouchableOpacity>
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
                      {prevLog?.[key] && parseFloat(b.data[key]) !== parseFloat(prevLog[key]) && (
                        <Text style={{color: parseFloat(b.data[key]) > parseFloat(prevLog[key]) ? (key==='weight' ? activeTheme.danger : activeTheme.success) : (key==='weight' ? activeTheme.success : activeTheme.danger), fontSize: 11}}>
                          {` (${parseFloat(b.data[key]) > parseFloat(prevLog[key]) ? '+' : ''}${(parseFloat(b.data[key]) - parseFloat(prevLog[key])).toFixed(1)})`}
                        </Text>
                      )}
                    </Text>
                  ) : null)}
                </View>
              </View>
            );
          })}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* MODALER */}

      {/* PLANLAGTE ØKTER MODAL */}
      <Modal visible={planModal} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { flex: 0.85 }]}>
            <View style={s.row}>
              <Text style={s.title}>{t.plans}</Text>
              <TouchableOpacity onPress={() => { triggerHaptic(); setPlanModal(false); }}><Text style={{ fontSize: 24, color: activeTheme.text }}>✕</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.primary, marginVertical: 15 }]} onPress={() => { triggerHaptic(); setPlanBuilderModal(true); setPlanModal(false); }}>
              <Text style={s.btnText}>+ {t.addPlan}</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {plans.length === 0 ? <Text style={s.subText}>Ingen planlagte økter opprettet ennå.</Text> : 
                plans.map(p => (
                  <View key={p.id} style={[s.card, {backgroundColor: activeTheme.bg}]}>
                    <View style={s.row}>
                      <Text style={[s.text, {fontWeight: 'bold', fontSize: 18}]}>{p.name}</Text>
                      <TouchableOpacity onPress={() => {
                        Alert.alert("Slett Plan", t.confirmDel, [
                          { text: t.cancel, style: "cancel" },
                          { text: t.yes, onPress: () => { triggerHaptic(); const n = plans.filter(x => x.id !== p.id); setPlans(n); saveData('plans_v3', n); }, style: 'destructive' }
                        ]);
                      }}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text></TouchableOpacity>
                    </View>
                    {p.exercises.map((ex, i) => (
                      <Text key={i} style={s.subText}>- {ex.name} ({ex.sets.length} {t.set})</Text>
                    ))}
                    <TouchableOpacity style={[s.btn, {marginTop: 15, paddingVertical: 10, backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary}]} onPress={() => loadPlanToSession(p)}>
                      <Text style={[s.btnText, {color: activeTheme.primary}]}>{t.loadPlan}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* OPPRETT PLAN MODAL */}
      <Modal visible={planBuilderModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modalContent, { flex: 0.9 }]}>
            <View style={s.row}>
              <Text style={s.title}>{t.addPlan}</Text>
              <TouchableOpacity onPress={() => { triggerHaptic(); setPlanBuilderModal(false); setPlanModal(true); }}><Text style={{ fontSize: 24, color: activeTheme.text }}>✕</Text></TouchableOpacity>
            </View>

            <TextInput style={s.input} placeholder={t.planName} placeholderTextColor={activeTheme.subText} value={newPlan.name} onChangeText={v => setNewPlan({...newPlan, name: v})} />

            <ScrollView showsVerticalScrollIndicator={false} style={{marginVertical: 10}}>
              {newPlan.exercises.map((ex, i) => (
                <View key={i} style={[s.card, {backgroundColor: activeTheme.bg}]}>
                  <View style={s.row}>
                    <Text style={[s.text, {fontWeight: 'bold'}]}>{i+1}. {ex.name}</Text>
                    <TouchableOpacity onPress={() => { const n = [...newPlan.exercises]; n.splice(i, 1); setNewPlan({...newPlan, exercises: n}); }}><Text style={{color: activeTheme.danger}}>✕</Text></TouchableOpacity>
                  </View>
                  <View style={s.row}>
                    <TouchableOpacity style={[s.btn, {padding: 8, flex: 1, marginRight: 5}]} onPress={() => { const n = [...newPlan.exercises]; n[i].sets.push({reps: '10', type: 'S'}); setNewPlan({...newPlan, exercises: n}); }}><Text style={[s.text, {fontSize: 12}]}>+ Arbeidssett (S)</Text></TouchableOpacity>
                    <TouchableOpacity style={[s.btn, {padding: 8, flex: 1, marginLeft: 5, backgroundColor: activeTheme.border}]} onPress={() => { const n = [...newPlan.exercises]; n[i].sets.unshift({reps: '10', type: pref.lang === 'no' ? 'O' : 'W'}); setNewPlan({...newPlan, exercises: n}); }}><Text style={[s.text, {fontSize: 12}]}>+ Oppvarming ({pref.lang === 'no' ? 'O' : 'W'})</Text></TouchableOpacity>
                  </View>
                  {ex.sets.map((st, j) => (
                    <View key={j} style={[s.row, {marginTop: 5, justifyContent: 'flex-start'}]}>
                      <Text style={[s.subText, {width: 40}]}>{getSetDisplay(ex.sets, j, pref.lang)}</Text>
                      <TextInput style={[s.inputSmall, {width: 60}]} placeholder={t.reps} keyboardType="numeric" value={st.reps} onChangeText={v => { const n = [...newPlan.exercises]; n[i].sets[j].reps = v; setNewPlan({...newPlan, exercises: n}); }} />
                      <Text style={[s.subText, {marginLeft: 5}]}>{t.reps}</Text>
                      <TouchableOpacity style={{marginLeft: 20}} onPress={() => { const n = [...newPlan.exercises]; n[i].sets.splice(j, 1); setNewPlan({...newPlan, exercises: n}); }}><Text style={{color: activeTheme.danger}}>✕</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}

              <TextInput style={[s.input, {marginTop: 20}]} placeholder={t.addEx} placeholderTextColor={activeTheme.subText} value={exercise} onChangeText={handleExerciseInput} />
              {suggestions.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                  {suggestions.map((sug, i) => (
                    <TouchableOpacity key={i} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => { 
                      triggerHaptic(); 
                      const eName = pref.lang === 'en' && sug.en ? sug.en : sug.name;
                      setNewPlan({...newPlan, exercises: [...newPlan.exercises, { name: eName, sets: [{reps: '10', type: 'S'}] }]}); 
                      setExercise(''); setSuggestions([]); 
                    }}>
                      <Text style={[s.text, { fontSize: 13 }]}>{pref.lang === 'en' && sug.en ? sug.en : sug.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.success, marginTop: 10 }]} onPress={savePlan}>
              <Text style={s.btnText}>{t.save}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

              {/* JURIDISK OG SIGNATUR */}
              <View style={{marginTop: 30, padding: 15, backgroundColor: activeTheme.bg, borderRadius: 8}}>
                <Text style={[s.subTitle, {color: activeTheme.danger, fontSize: 13}]}>{t.disclaimer}</Text>
                <Text style={[s.subText, {fontSize: 11, fontStyle: 'italic'}]}>{t.disclaimerText}</Text>
              </View>

              <Text style={{ color: activeTheme.subText, fontStyle: 'italic', textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                Produsert av Ole Kristian Larsen
              </Text>

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
            <TextInput style={s.input} placeholder={t.intName} placeholderTextColor={activeTheme.subText} value={goalData.exercise} onChangeText={(text) => {
              setGoalData({...goalData, exercise: text});
              if (text.length > 0) {
                const matches = exerciseDB.filter(e => e.name.toLowerCase().includes(text.toLowerCase()) || (e.en && e.en.toLowerCase().includes(text.toLowerCase())));
                setGoalSuggestions(matches.slice(0, 5));
              } else { setGoalSuggestions([]); }
            }} />
            
            {goalSuggestions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {goalSuggestions.map(sug => (
                  <TouchableOpacity key={sug.name} style={[s.favBtn, { backgroundColor: activeTheme.border, marginBottom: 5 }]} onPress={() => { triggerHaptic(); setGoalData({...goalData, exercise: pref.lang === 'en' && sug.en ? sug.en : sug.name}); setGoalSuggestions([]); }}>
                    <Text style={[s.text, { fontSize: 13 }]}>{pref.lang === 'en' && sug.en ? sug.en : sug.name}</Text>
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