import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- DEN FOTFORMEDE TILSTANDEN (STATE) ---
      session: [],
      logs: [],
      prs: {},
      goals: [],
      plans: [],
      bodyLogs: [],
      pref: { theme: 'dark', lang: 'no', timeFormat: '24h', profilePic: null, name: '', hasSeenStartup: false },

      // --- HANDLINGER (ACTIONS FOR Å PUMPE INN DATA) ---
      setSession: (session: any) => set({ session }),
      
      addLog: (log: any) => set((state: any) => ({ 
        logs: [log, ...state.logs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
      })),
      
      removeLog: (id: string) => set((state: any) => ({
        logs: state.logs.filter((l: any) => l.id !== id)
      })),

      setPrs: (prs: any) => set({ prs }),
      
      setGoals: (goals: any) => set({ goals }),
      
      setPlans: (plans: any) => set({ plans }),
      
      setBodyLogs: (bodyLogs: any) => set({ bodyLogs }),
      
      updatePref: (newPref: any) => set((state: any) => ({ 
        pref: { ...state.pref, ...newPref } 
      })),
      
      clearSession: () => set({ session: [] }),
    }),
    {
      name: 'momentum-storage', // Det magiske hullet hvor alt lagres permanent
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);