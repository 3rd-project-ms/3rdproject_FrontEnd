// 인증 상태 관리를 위한 Zustand 스토어

import { create } from 'zustand';

type Gender = 'male' | 'female' | null;

interface AuthState {
  isLoggedIn: boolean;
  nickname: string;
  email: string;
  selectedGender: Gender;
  setAuth: (data: Partial<Omit<AuthState, 'setAuth' | 'logout'>>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  nickname: '',
  email: '',
  selectedGender: null,
  setAuth: (data) => set((state) => ({ ...state, ...data })),
  logout: () =>
    set({
      isLoggedIn: false,
      nickname: '',
      email: '',
      selectedGender: null,
    }),
}));
