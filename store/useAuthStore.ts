// 인증 상태 관리를 위한 Zustand 스토어
// 백엔드는 토큰을 발급하지 않으므로 user_id를 SecureStore에 저장해 세션을 유지한다.

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const USER_ID_KEY    = 'auth.userId';
const GENDER_KEY     = 'auth.gender';

type Gender = 'male' | 'female' | null;
export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface AuthState {
  userId: number | null;
  isLoggedIn: boolean;
  nickname: string;
  email: string;
  selectedGender: Gender;
  selectedEnglishLevel: EnglishLevel | null;
  setAuth: (
    data: Partial<
      Omit<AuthState, 'setAuth' | 'logout' | 'resetOnboarding' | 'restoreSession'>
    >
  ) => void;
  /** 앱 시작 시 저장된 user_id로 로그인 상태를 복원한다. */
  restoreSession: () => Promise<void>;
  resetOnboarding: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoggedIn: false,
  nickname: '',
  email: '',
  selectedGender: null,
  selectedEnglishLevel: null,
  setAuth: (data) => {
    if (data.userId != null) {
      SecureStore.setItemAsync(USER_ID_KEY, String(data.userId)).catch(() => {});
    }
    if (data.selectedGender != null) {
      SecureStore.setItemAsync(GENDER_KEY, data.selectedGender).catch(() => {});
    }
    set((state) => ({ ...state, ...data }));
  },
  restoreSession: async () => {
    try {
      const [storedId, storedGender] = await Promise.all([
        SecureStore.getItemAsync(USER_ID_KEY),
        SecureStore.getItemAsync(GENDER_KEY),
      ]);
      if (storedId) {
        set({
          userId: Number(storedId),
          isLoggedIn: true,
          selectedGender: (storedGender as Gender) ?? null,
        });
      }
    } catch {
      // 복원 실패는 무시하고 비로그인 상태로 시작
    }
  },
  resetOnboarding: () =>
    set({
      nickname: '',
      selectedGender: null,
      selectedEnglishLevel: null,
    }),
  logout: () => {
    SecureStore.deleteItemAsync(USER_ID_KEY).catch(() => {});
    SecureStore.deleteItemAsync(GENDER_KEY).catch(() => {});
    set({
      userId: null,
      isLoggedIn: false,
      nickname: '',
      email: '',
      selectedGender: null,
      selectedEnglishLevel: null,
    });
  },
}));
