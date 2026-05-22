// store/useChatStore.ts
import { create } from 'zustand';
import { ChatMessage } from '../components/chat/ChatBubble';

// 캐릭터 정의
export type CharacterId = 'A' | 'B' | 'C';
export type CharacterGender = 'M' | 'F';

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  difficulty: '하' | '상' | '최상';
  personality: string;
  emoji: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  A: {
    id: 'A',
    name: '소꿉친구',
    description: '다정한 서퍼 친구',
    difficulty: '하',
    personality: '활발하고 친근함. 실수해도 웃어넘김.',
    emoji: '🤙',
  },
  B: {
    id: 'B',
    name: '학교 선배',
    description: '츤데레 스타일',
    difficulty: '상',
    personality: '까다롭지만 속은 따뜻함. 실수에 예민.',
    emoji: '😤',
  },
  C: {
    id: 'C',
    name: '카페 사장님',
    description: '다정하지만 고급 영어 요구',
    difficulty: '최상',
    personality: '교양 있고 세련됨. 정확한 표현 고집.',
    emoji: '☕',
  },
};

// 교정 팝업 정보
export interface CorrectionPopup {
  visible: boolean;
  correction: string;
  betterExpression: string;
  learningPoint: string;
}

interface ChatState {
  // 선택된 캐릭터
  characterId: CharacterId;
  characterGender: CharacterGender;

  // 대화 이력
  messages: ChatMessage[];

  // 호감도 (0 ~ 100)
  affection: number;

  // 읽씹 여부
  isReadSsip: boolean;

  // 교정 팝업
  correctionPopup: CorrectionPopup;

  // 로딩 상태
  isLoading: boolean;

  // Actions
  setCharacter: (id: CharacterId, gender: CharacterGender) => void;
  addMessage: (msg: ChatMessage) => void;
  addAITyping: () => void;        // 타이핑 중 버블 추가
  removeAITyping: () => void;     // 타이핑 버블 제거
  updateAffection: (delta: number) => void;
  setReadSsip: (val: boolean) => void;
  showCorrectionPopup: (data: Omit<CorrectionPopup, 'visible'>) => void;
  hideCorrectionPopup: () => void;
  setLoading: (val: boolean) => void;
  clearMessages: () => void;
}

const TYPING_MSG_ID = '__typing__';

export const useChatStore = create<ChatState>((set, get) => ({
  characterId: 'A',
  characterGender: 'F',
  messages: [],
  affection: 50,
  isReadSsip: false,
  correctionPopup: {
    visible: false,
    correction: '',
    betterExpression: '',
    learningPoint: '',
  },
  isLoading: false,

  setCharacter: (id, gender) => set({ characterId: id, characterGender: gender }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages.filter((m) => m.id !== TYPING_MSG_ID),
        msg,
      ],
    })),

  addAITyping: () =>
    set((state) => {
      if (state.messages.find((m) => m.id === TYPING_MSG_ID)) return state;
      return {
        messages: [
          ...state.messages,
          {
            id: TYPING_MSG_ID,
            role: 'ai' as const,
            text: '',
            timestamp: '',
            isTyping: true,
            showAvatar: true,
          },
        ],
      };
    }),

  removeAITyping: () =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== TYPING_MSG_ID),
    })),

  updateAffection: (delta) =>
    set((state) => ({
      affection: Math.min(100, Math.max(0, state.affection + delta)),
    })),

  setReadSsip: (val) => set({ isReadSsip: val }),

  showCorrectionPopup: (data) =>
    set({ correctionPopup: { ...data, visible: true } }),

  hideCorrectionPopup: () =>
    set((state) => ({
      correctionPopup: { ...state.correctionPopup, visible: false },
    })),

  setLoading: (val) => set({ isLoading: val }),

  clearMessages: () => set({ messages: [], isReadSsip: false }),
}));
