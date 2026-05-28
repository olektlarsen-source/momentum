import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Appearance, LayoutAnimation, Platform, ScrollView, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Enkel ordbok for å gjette muskelgruppe basert på øvelsesnavn
const muscleMap: { [key: string]: string } = {
  'benkpress': 'Bryst', 'kabelkryss': 'Bryst', 'flyes': 'Bryst', 'pushups': 'Bryst',
  'markløft': 'Rygg', 'pullups': 'Rygg', 'roing': 'Rygg', 'nedtrekk': 'Rygg',
  'knebøy': 'Bein', 'utfall': 'Bein', 'leg press': 'Bein', 'leg extension': 'Bein', 'lårcurl': 'Bein',
  'skulderpress': 'Skuldre', 'sidehev': 'Skuldre', 'militærpress': 'Skuldre',
  'biceps': 'Armer', 'triceps': 'Armer', 'curl': 'Armer', 'pushdown': 'Armer',
  'planke': 'Kjerne', 'situps': 'Kjerne', 'crunch': 'Kjerne'
};

export default function LogTab({ setGoalModal, formatDate }: any) {
  const { pref, logs, removeLog, prs, goals, setGoals } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  const [expandedLogs, setExpandedLogs] = useState<any>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisFilter, setAnalysisFilter] = useState<'session' | '7days' | '30days'>('session');
  
  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const toggleExpand = (setter: any, value: boolean) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setter(value); };

  // --- STREAK LOGIKK ---
  const logDates = logs.map((l: any) => l.date.split('T')[0]);
  const last14Days = Array.from({length: 14}, (_, i) => { 
    const d = new Date(); d.setDate(d.getDate() - (13 - i)); 
    return d.toISOString().split('T')[0]; 
  });

  // --- TRENINGSANALYSE LOGIKK ---
  const getFilteredLogs = () => {
    if (logs.length === 0) return [];
    if (analysisFilter === 'session') return [logs[0]];
    const now = new Date().getTime();
    const days = analysisFilter === '7days' ? 7 : 30;
    return logs.filter((l: any) => (now - new Date(l.date).getTime()) / (1000 * 3600 * 24) <= days);
  };

  const getMuscleData = () => {
    const data = { Bryst: 0, Rygg: 0, Bein: 0, Skuldre: 0, Armer: 0, Kjerne: 0 };
    const filtered = getFilteredLogs();
    
    filtered.forEach((log: any) => {
      log.exercises?.forEach((ex: any) => {
        let group = 'Kjerne'; // Fallback
        
        // 1. Sjekk om sjefen har lagt inn muskelen manuelt via Advanced
        if (ex.muscle && data.hasOwnProperty(ex.muscle as any)) {
          group = ex.muscle;
        } 
        // 2. Hvis ikke, la ordboken prøve å gjette
        else {
          const nameLower = ex.name.toLowerCase();
          for (const [key, val] of Object.entries(muscleMap)) {
            if (nameLower.includes(key)) { group = val; break; }
          }
        }
        
        // Tell arbeidssett (S)
        const workingSets = ex.sets?.filter((st: any) => st.type === 'S').length || 0;
        data[group as keyof typeof data] += workingSets;
      });
    });
    return data;
  };

  const getStagnationWarnings = () => {
    const warnings: string[] = [];
    const exHistory: any = {};
    
    // Samle max vekt per øvelse for de siste 3 gangene den ble trent
    logs.slice().reverse().forEach((log: any) => {
      log.exercises?.forEach((ex: any) => {
        if (!exHistory[ex.name]) exHistory[ex.name] = [];
        const maxWeight = Math.max(...ex.sets?.filter((s: any) => s.type === 'S').map((s: any) => parseFloat(s.weight) || 0) || [0]);
        if (maxWeight > 0) exHistory[ex.name].push(maxWeight);
      });
    });

    for (const [ex, weights] of Object.entries(exHistory)) {
      const w = weights as number[];
      if (w.length >= 3) {
        const last3 = w.slice(-3);
        if (last3[0] === last3[1] && last3[1] === last3[2]) {
          warnings.push(`Du har grodd fast på ${last3[0]} kg i ${ex}. På tide å smelle på litt mer jern?`);
        }
      }
    }
    return warnings.slice(0, 3); // Vis maks 3 advarsler
  };

  // --- SVG EDDERKOPP ---
  const muscleData = getMuscleData();
  const maxVal = Math.max(...Object.values(muscleData), 10); // Minst 10 for skala
  const labels = Object.keys(muscleData);
  const values = Object.values(muscleData);
  
  const size = 220;
  const center = size / 2;
  const radius = (size / 2) - 30;

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const radarPoints = values.map((val, i) => {
    const { x, y } = getCoordinates(val, i, values.length);
    return `${x},${y}`;
  }).join(' ');

  // Grupper logger per måned for historikk
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const d = new Date(log.date);
    const monthStr = `${t.months[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[monthStr]) acc[monthStr] = [];
    acc[monthStr].push(log); 
    return acc;
  }, {});

  const renderSetType = (type: string) => type === 'S' ? 'S' : (pref.lang === 'no' ? 'O' : 'W');

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      
      {/* 1. LÅST STREAK (Kontinuitet) */}
      <View style={[s.card, { marginTop: 10, paddingBottom: 15 }]}>
        <Text style={s.subTitle}>🔥 Kontinuitet Siste 14 Dager</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {last14Days.map((dateStr, i) => {
            const isTrained = logDates.includes(dateStr);
            const isToday = i === 13;
            return (
              <View key={dateStr} style={{ alignItems: 'center' }}>
                <View style={{ 
                  width: 14, height: 14, borderRadius: 7, 
                  backgroundColor: isTrained ? activeTheme.success : activeTheme.border, 
                  marginBottom: 5,
                  borderWidth: isToday ? 2 : 0, borderColor: activeTheme.primary
                }} />
                <Text style={{ fontSize: 10, color: isToday ? activeTheme.text : activeTheme.subText, fontWeight: isToday ? 'bold' : 'normal' }}>
                  {t.days[new Date(dateStr).getDay()].charAt(0)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 2. TRENINGSANALYSE (Den utvidbare sjefs-sprekken) */}
      <View style={s.card}>
        {!showAnalysis ? (
          <TouchableOpacity style={[s.btn, { backgroundColor: activeTheme.card, borderWidth: 1, borderColor: activeTheme.primary }]} onPress={() => { triggerHaptic(); toggleExpand(setShowAnalysis, true); }}>
            <Text style={[s.btnText, { color: activeTheme.primary }]}>📊 Åpne Treningsanalyse</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={[s.subTitle, { textAlign: 'center' }]}>📊 Treningsanalyse</Text>
            
            {/* Filter-knapper */}
            <View style={[s.row, { marginTop: 10, backgroundColor: activeTheme.bg, padding: 4, borderRadius: 8 }]}>
              {[
                { id: 'session', label: 'Siste Økt' },
                { id: '7days', label: 'Siste 7' },
                { id: '30days', label: 'Siste 30' }
              ].map(f => (
                <TouchableOpacity 
                  key={f.id} 
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6, backgroundColor: analysisFilter === f.id ? activeTheme.card : 'transparent' }}
                  onPress={() => { triggerHaptic(); setAnalysisFilter(f.id as any); }}
                >
                  <Text style={{ fontSize: 12, fontWeight: analysisFilter === f.id ? 'bold' : 'normal', color: analysisFilter === f.id ? activeTheme.text : activeTheme.subText }}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Edderkoppdiagram */}
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Svg width={size} height={size}>
                {/* Bakgrunnsnett (Graderinger) */}
                {[0.25, 0.5, 0.75, 1].map(scale => {
                  const pts = values.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
                    const r = radius * scale;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  }).join(' ');
                  return <Polygon key={scale} points={pts} stroke={activeTheme.border} strokeWidth="1" fill="none" />;
                })}
                
                {/* Linjer fra senter */}
                {values.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
                  return <Line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke={activeTheme.border} strokeWidth="1" />;
                })}

                {/* Selve data-fyllet (den stive kurven) */}
                <Polygon points={radarPoints} fill={activeTheme.primary} fillOpacity="0.4" stroke={activeTheme.primary} strokeWidth="2" />

                {/* Tekst (Muskelgrupper) */}
                {labels.map((label, i) => {
                  const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
                  const x = center + (radius + 20) * Math.cos(angle);
                  const y = center + (radius + 15) * Math.sin(angle);
                  return (
                    <SvgText key={i} x={x} y={y} fill={activeTheme.text} fontSize="10" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">
                      {label}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>

            {/* Avansert Info & Innsikt */}
            <View style={{ backgroundColor: activeTheme.bg, padding: 15, borderRadius: 8, marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', color: activeTheme.text, marginBottom: 5 }}>💡 Innsikt</Text>
              {Object.values(muscleData).every(v => v === 0) ? (
                <Text style={[s.subText, { fontStyle: 'italic' }]}>Ingen arbeidssett funnet i denne perioden. Husk å logge sett som 'S' (Arbeidssett).</Text>
              ) : (
                <Text style={s.subText}>Du har pumpet mest volum på <Text style={{fontWeight: 'bold', color: activeTheme.primary}}>{labels[values.indexOf(Math.max(...values))]}</Text> i denne perioden.</Text>
              )}

              {/* Stagnasjonsvarsler */}
              {getStagnationWarnings().map((warn, i) => (
                <View key={i} style={{ marginTop: 10, borderTopWidth: 1, borderColor: activeTheme.border, paddingTop: 10 }}>
                  <Text style={{ color: activeTheme.danger, fontSize: 12 }}>⚠️ {warn}</Text>
                </View>
              ))}
            </View>

            {/* Lukk-knapp */}
            <TouchableOpacity style={[s.btn, { marginTop: 15, backgroundColor: activeTheme.border }]} onPress={() => { triggerHaptic(); toggleExpand(setShowAnalysis, false); }}>
              <Text style={s.text}>Skjul Analyse</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. MÅL & MILEPÆLER (Renset opp) */}
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.subTitle}>🏆 Mål & Milepæler</Text>
          <TouchableOpacity onPress={() => { triggerHaptic(); setGoalModal(true); }}>
            <Text style={s.primaryText}>+ {t.addGoal}</Text>
          </TouchableOpacity>
        </View>
        
        {goals.length === 0 ? (
          <Text style={[s.subText, { fontStyle: 'italic', marginTop: 10 }]}>Du har ingen mål. Sett deg et hårete mål!</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {goals.map((g: any) => {
              let prObj = prs[g.exercise];
              if (typeof prObj === 'number') prObj = { kg: prObj, reps: 0 };
              const current = prObj ? (prObj[g.unit] || 0) : 0;
              const targetVal = parseFloat(g.target) || 1; 
              const pct = Math.min((current / targetVal) * 100, 100) || 0;
              
              return (
                <View key={g.id} style={{ backgroundColor: activeTheme.bg, padding: 15, borderRadius: 8, marginRight: 10, width: 200 }}>
                  <View style={s.row}>
                    <Text style={[s.text, { fontWeight: 'bold' }]} numberOfLines={1}>{g.exercise}</Text>
                    <TouchableOpacity onPress={() => {
                      Alert.alert("Slett mål", t.confirmDel, [
                        { text: t.cancel, style: "cancel" },
                        { text: t.yes, onPress: () => { triggerHaptic(); setGoals(goals.filter((x: any) => x.id !== g.id)); }, style: 'destructive' }
                      ]);
                    }}>
                      <Text style={{ color: activeTheme.danger, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[s.subText, { marginTop: 5 }]}>{current} av {g.target} {g.unit === 'kg' ? 'kg' : 'reps'}</Text>
                  <View style={{ height: 6, backgroundColor: activeTheme.border, borderRadius: 3, marginTop: 10 }}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? activeTheme.success : activeTheme.primary, borderRadius: 3 }} />
                  </View>
                  {pct === 100 && <Text style={{ color: activeTheme.success, fontSize: 10, marginTop: 5, fontWeight: 'bold' }}>Mål Nådd! 🎉</Text>}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* 4. HISTORIKK (MED LBS TIL KG OMREGNING) */}
      {Object.entries(groupedLogs).map(([month, monthLogs]: any) => (
        <View key={month}>
          <Text style={[s.subTitle, { marginTop: 10, marginBottom: 10 }]}>{month.toUpperCase()}</Text>
          {monthLogs.map((log: any) => (
            <View key={log.id} style={s.card}>
              <TouchableOpacity onPress={() => { triggerHaptic(); setExpandedLogs((p: any) => ({...p, [log.id]: !p[log.id]})); }} style={s.row}>
                <Text style={[s.text, { fontWeight: 'bold' }]}>{formatDate(log.date, t, pref.timeFormat)}</Text>
                <Text style={s.subText}>{expandedLogs[log.id] ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {expandedLogs[log.id] && (
                <View style={{marginTop: 10, borderTopWidth: 1, borderColor: activeTheme.border, paddingTop: 10}}>
                  {log.exercises && log.exercises.map((ex: any, i: number) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                      <Text style={[s.text, { fontWeight: 'bold' }]}>{ex.name}</Text>
                      {ex.muscle ? <Text style={{fontSize: 10, color: activeTheme.primary, marginBottom: 4}}>💪 {ex.muscle}</Text> : null}
                      {ex.isInterval ?
                        <Text style={s.subText}>{ex.details}</Text> : 
                        ex.sets.map((st: any, si: number) => {
                          // MAGIEN: Sjekker om enheten er lbs, og dytter inn omregning!
                          const lbsInKg = st.unit === 'lbs' && st.weight ? ` (~${(parseFloat(st.weight) / 2.20462).toFixed(1)} kg)` : '';
                          return (
                            <Text key={si} style={s.subText}>
                              {t.set} {renderSetType(st.type)}{si+1}: {st.weight} {st.unit || 'kg'} x {st.reps} reps{lbsInKg}
                            </Text>
                          );
                        })
                      }
                      {ex.timer != null && <Text style={[s.subText, { color: activeTheme.primary }]}>⏱ {ex.timer} s</Text>}
                      {ex.note ? <Text style={[s.subText, { fontStyle: 'italic', marginTop: 2 }]}>"{ex.note}"</Text> : null}
                    </View>
                  ))}
                  <TouchableOpacity style={{marginTop: 5}} onPress={() => {
                    Alert.alert("Slett", t.confirmDel, [
                      { text: t.cancel, style: "cancel" },
                      { text: t.yes, onPress: () => { triggerHaptic(); removeLog(log.id); }, style: 'destructive' }
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
  );
}