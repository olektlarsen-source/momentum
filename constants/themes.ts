// constants/themes.ts
import { StyleSheet } from 'react-native';

export const themes = {
  light: { bg: '#F2F2F7', card: '#FFFFFF', text: '#000000', subText: '#8E8E93', border: '#C6C6C8', primary: '#007AFF', danger: '#FF3B30', success: '#34C759', warning: '#FF9500' },
  dark: { bg: '#000000', card: '#1C1C1E', text: '#FFFFFF', subText: '#EBEBF5', border: '#38383A', primary: '#0A84FF', danger: '#FF453A', success: '#30D158', warning: '#FF9F0A' }
};

export const createStyles = (theme: any) => StyleSheet.create({
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