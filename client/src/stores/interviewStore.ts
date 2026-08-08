import { create } from 'zustand';
import api from '@/lib/api';
import type { Interview, InterviewStats, Certificate } from '@/types';

interface InterviewState {
  interviews: Interview[];
  currentInterview: Interview | null;
  stats: InterviewStats | null;
  certificates: Certificate[];
  loading: boolean;

  fetchInterviews: () => Promise<void>;
  fetchInterview: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCertificates: () => Promise<void>;
  clearCurrent: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],
  currentInterview: null,
  stats: null,
  certificates: [],
  loading: false,

  fetchInterviews: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/interviews/me/');
      set({ interviews: res.data });
    } catch {} finally {
      set({ loading: false });
    }
  },

  fetchInterview: async (id: string) => {
    set({ loading: true });
    try {
      const res = await api.get(`/interviews/${id}/`);
      set({ currentInterview: res.data });
    } catch {} finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/interviews/stats/');
      set({ stats: res.data });
    } catch {}
  },

  fetchCertificates: async () => {
    try {
      const res = await api.get('/interviews/certificates/');
      set({ certificates: res.data });
    } catch {}
  },

  clearCurrent: () => set({ currentInterview: null }),
}));
