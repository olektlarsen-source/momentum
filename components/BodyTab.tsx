import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Appearance, Dimensions, Image, LayoutAnimation, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { createStyles, themes } from '../constants/themes';
import { dict } from '../constants/translations';
import { useStore } from '../hooks/useStore';
import DateNavigator from './DateNavigator';

// Gjør at utvidelsen glir mykt og deilig (spesielt på Android)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BodyTab({ customDateOffset, setCustomDateOffset, getCustomDateISO, formatDate }: any) {
  const { pref, bodyLogs, setBodyLogs } = useStore();
  const t = dict[pref.lang as keyof typeof dict] || dict['no'];
  const systemScheme = Appearance.getColorScheme();
  const activeTheme = pref.theme === 'system' ? themes[systemScheme || 'dark'] : themes[pref.theme as keyof typeof themes];
  const s = createStyles(activeTheme);

  // States for det progressive grensesnittet
  const [isAdding, setIsAdding] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const [bodyData, setBodyData] = useState<any>({ weight: '', shoulders: '', chest: '', waist: '', hips: '', upperArm: '', lowerArm: '', thigh: '', calf: '', image: null });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const bodyRefs = useRef<any>([]);

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const toggleExpand = (setter: any, value: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(value);
  };

  const handleSave = () => {
    triggerHaptic();
    const newLog = { id: Date.now().toString(), date: getCustomDateISO(), data: { ...bodyData } };
    const newBodyLogs = [newLog, ...bodyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBodyLogs(newBodyLogs);
    setBodyData({ weight: '', shoulders: '', chest: '', waist: '', hips: '', upperArm: '', lowerArm: '', thigh: '', calf: '', image: null });
    setCustomDateOffset(0);
    
    // Lukker hele sprekken og trekker seg tilbake
    toggleExpand(setIsAdding, false);
    setShowMeasurements(false);
  };

  const pickImage = async () => {
    triggerHaptic();
    let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setBodyData({...bodyData, image: r.assets[0].uri});
  };

  // Trend-logikk: Henter ut de 5 siste vektene og snur dem slik at den eldste er først på grafen
  const trendLogs = bodyLogs.filter((l: any) => l.data?.weight).slice(0, 5).reverse();

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <DateNavigator 
        customDateOffset={customDateOffset} setCustomDateOffset={setCustomDateOffset} 
        getCustomDateISO={getCustomDateISO} formatDate={formatDate} 
      />

      {/* TREND FANE MED BØLGEDIAGRAM */}
      <View style={[s.card, { paddingVertical: 10 }]}>
        <TouchableOpacity style={s.row} onPress={() => { triggerHaptic(); toggleExpand(setShowTrend, !showTrend); }}>
          <Text style={[s.subTitle, { marginBottom: 0 }]}>📈 Trend (De 5 siste målingene)</Text>
          <Text style={s.subText}>{showTrend ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {showTrend && (
          <View style={{ marginTop: 15, borderTopWidth: 1, borderColor: activeTheme.border, paddingTop: 10, alignItems: 'center' }}>
            {trendLogs.length < 2 ? (
              <Text style={[s.subText, { textAlign: 'center', marginTop: 10 }]}>Du må ha minst to føringer med vekt for å se den stige!</Text>
            ) : (
              <LineChart
                data={{
                  labels: trendLogs.map((l: any) => formatDate(l.date, t, pref.timeFormat).split(',')[0]),
                  datasets: [{ data: trendLogs.map((l: any) => parseFloat(l.data.weight)) }]
                }}
                width={Dimensions.get("window").width - 60} 
                height={220}
                chartConfig={{
                  backgroundColor: activeTheme.bg,
                  backgroundGradientFrom: activeTheme.bg,
                  backgroundGradientTo: activeTheme.bg,
                  decimalPlaces: 1,
                  color: (opacity = 1) => activeTheme.primary,
                  labelColor: (opacity = 1) => activeTheme.subText,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "6", strokeWidth: "2", stroke: activeTheme.card }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            )}
          </View>
        )}
      </View>

      {/* PROGRESSIV REGISTRERING */}
      <View style={s.card}>
        {!isAdding ? (
          <TouchableOpacity 
            style={[s.btn, { backgroundColor: activeTheme.primary }]} 
            onPress={() => { triggerHaptic(); toggleExpand(setIsAdding, true); }}
          >
            <Text style={s.btnText}>+ Legg til ny måling</Text>
          </TouchableOpacity>
        ) : (
          <View>
            {/* Nivå 1: Vekt og Bilde */}
            <View style={s.row}>
              <Text style={s.text}>{t.weight || 'Vekt'}:</Text>
              <TextInput 
                style={[s.inputSmall, {width: '40%'}]} keyboardType="numeric" 
                placeholder="Vekt (kg)" placeholderTextColor={activeTheme.subText} 
                value={bodyData.weight} onChangeText={v => setBodyData({...bodyData, weight: v})} 
              />
            </View>

            <TouchableOpacity style={[s.btn, {backgroundColor: activeTheme.border, marginTop: 10}]} onPress={pickImage}>
              <Text style={s.text}>{bodyData.image ? '📸 Bilde lagt til (Trykk for å bytte)' : '📸 Last opp bilde'}</Text>
            </TouchableOpacity>

            {/* Nivå 2: Mål i CM */}
            {!showMeasurements ? (
              <TouchableOpacity style={{ marginTop: 15, alignItems: 'center', paddingVertical: 10 }} onPress={() => { triggerHaptic(); toggleExpand(setShowMeasurements, true); }}>
                <Text style={s.primaryText}>+ Legg til Mål (cm) ▼</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ marginTop: 15, borderTopWidth: 1, borderColor: activeTheme.border, paddingTop: 15 }}>
                {['shoulders', 'chest', 'waist', 'hips', 'upperArm', 'lowerArm', 'thigh', 'calf'].map((key, i) => {
                  const label = t[key as keyof typeof t] || (key === 'shoulders' ? 'Skuldre' : key.charAt(0).toUpperCase() + key.slice(1));
                  return (
                    <View key={key} style={s.row}>
                      <Text style={s.text}>{label}:</Text>
                      <TextInput 
                        ref={el => bodyRefs.current[i] = el} style={[s.inputSmall, {width: '40%'}]} keyboardType="numeric" 
                        placeholder={`${label} (cm)`} placeholderTextColor={activeTheme.subText} 
                        value={bodyData[key]} onChangeText={v => setBodyData({...bodyData, [key]: v})} 
                        returnKeyType="next" onSubmitEditing={() => { if(bodyRefs.current[i+1]) bodyRefs.current[i+1].focus(); }}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Felles Lagre-knapp */}
            <TouchableOpacity style={[s.btn, {marginTop: 20, backgroundColor: activeTheme.success}]} onPress={handleSave}>
              <Text style={s.btnText}>{t.save || 'Lagre'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => { toggleExpand(setIsAdding, false); setShowMeasurements(false); }}>
              <Text style={{ color: activeTheme.subText }}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* HISTORIKK */}
      {bodyLogs.map((b: any, i: number) => {
        const prevLog = bodyLogs[i + 1]?.data;
        return (
          <View key={b.id} style={s.card}>
            <View style={s.row}>
              <Text style={[s.text, {fontWeight: 'bold'}]}>{formatDate(b.date, t, pref.timeFormat).split(' kl')[0]}</Text>
              <TouchableOpacity onPress={() => {
                Alert.alert("Slett", t.confirmDel, [
                  { text: t.cancel, style: "cancel" },
                  { text: t.yes, onPress: () => { triggerHaptic(); setBodyLogs(bodyLogs.filter((l: any) => l.id !== b.id)); }, style: 'destructive' }
                ]);
              }}><Text style={{color: activeTheme.danger, fontWeight: 'bold'}}>{t.delete}</Text></TouchableOpacity>
            </View>
            
            {b.data.image && (
              <TouchableOpacity onPress={() => { triggerHaptic(); setFullScreenImage(b.data.image); }}>
                <Image source={{uri: b.data.image}} style={{width: '100%', height: 200, borderRadius: 8, marginVertical: 10}} />
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {['weight', 'shoulders', 'chest', 'waist', 'hips', 'upperArm', 'lowerArm', 'thigh', 'calf'].map(key => {
                const label = t[key as keyof typeof t] || (key === 'shoulders' ? 'Skuldre' : key.charAt(0).toUpperCase() + key.slice(1));
                return b.data[key] ? (
                  <Text key={key} style={[s.subText, { width: '50%', marginBottom: 5 }]}>
                    {label}: {b.data[key]} {key === 'weight' ? 'kg' : 'cm'}
                    {prevLog?.[key] && parseFloat(b.data[key]) !== parseFloat(prevLog[key]) && (
                      <Text style={{color: parseFloat(b.data[key]) > parseFloat(prevLog[key]) ? activeTheme.success : activeTheme.danger, fontSize: 11}}>
                        {` (${parseFloat(b.data[key]) > parseFloat(prevLog[key]) ? '+' : ''}${(parseFloat(b.data[key]) - parseFloat(prevLog[key])).toFixed(1)})`}
                      </Text>
                    )}
                  </Text>
                ) : null;
              })}
            </View>
          </View>
        );
      })}
      <View style={{height: 50}} />

      {/* FULLSKJERM BILDE MODAL */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={{uri: fullScreenImage || undefined}} style={{width: '100%', height: '80%', resizeMode: 'contain'}} />
          <TouchableOpacity style={[s.btn, {position: 'absolute', bottom: 50, backgroundColor: activeTheme.card}]} onPress={() => { triggerHaptic(); setFullScreenImage(null); }}>
            <Text style={{color: activeTheme.text, fontWeight: 'bold'}}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </ScrollView>
  );
}