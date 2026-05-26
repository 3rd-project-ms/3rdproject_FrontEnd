// 인증 상태 관리를 위한 Zustand 스토어

import { create } from 'zustand';

type Gender = 'male' | 'female' | null;
export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface AuthState {
  isLoggedIn: boolean;
  nickname: string;
  email: string;
  selectedGender: Gender;
  selectedEnglishLevel: EnglishLevel | null;
  setAuth: (
    data: Partial<Omit<AuthState, 'setAuth' | 'logout' | 'resetOnboarding'>>
  ) => void;
  resetOnboarding: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  nickname: '',
  email: '',
  selectedGender: null,
  selectedEnglishLevel: null,
  setAuth: (data) => set((state) => ({ ...state, ...data })),
  resetOnboarding: () =>
    set({
      nickname: '',
      selectedGender: null,
      selectedEnglishLevel: null,
    }),
  logout: () =>
    set({
      isLoggedIn: false,
      nickname: '',
      email: '',
      selectedGender: null,
      selectedEnglishLevel: null,
    }),
}));
