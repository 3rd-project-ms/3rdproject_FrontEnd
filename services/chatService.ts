// services/chatService.ts
import axios from 'axios';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://3rdprojectbackend-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 세션 시작 ──
export interface SessionStartRequest {
  userId: number;
  stageId: number;
  characterId: string;
}

export interface SessionStartResponse {
  sessionId: string;
  firstMessage: {
    textContent: string;
    actionDescription: string;
    audioUrl: string;
  };
}

// ── 메시지 전송 ──
export interface ChatMessageRequest {
  sessionId: string;
  textContent: string;
  inputType: 'text' | 'voice';
  characterId: string;
  scenarioId: string;       // TODO: 백엔드에 어디서 받는지 확인 필요
  stageLevel: number;
  userLevel: string;
  turnCount: number;        // TODO: 백엔드에 프론트가 카운트해서 올리는지 확인 필요
  currentAffinity: number;
  history: any[];           // TODO: 백엔드에 배열 내부 형식 확인 필요
}

export interface PronunciationScore {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
  word_details: {
    word: string;
    accuracy: number;
    error_type: string;
  }[];
}

export interface ChatMessageResponse {
  text_content: string;
  action_description: string;
  affinity_delta: number;
  is_active: boolean;
  audio_url: string;        // voice 모드 시 TTS 결과
  system_evaluation: {
    grammar_feedback: string;
    is_penalty: boolean;
    pronunciation_score: PronunciationScore;
  };
  current_affinity: number;
}

// ── API 함수 ──
export const chatService = {

  /** 세션 시작 — 화면 진입 시 호출 */
  startSession: async (req: SessionStartRequest): Promise<SessionStartResponse> => {
    const { data } = await api.post('/api/chat/sessions', req);
    return data.data;
  },

  /** 텍스트 메시지 전송 */
  sendText: async (req: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const { data } = await api.post('/api/chat/message', {
      ...req,
      inputType: 'text',
    });
    return data.data;
  },

  /** 음성 메시지 전송 */
  sendVoice: async (
    audioUri: string,
    req: Omit<ChatMessageRequest, 'textContent' | 'inputType'>
  ): Promise<ChatMessageResponse> => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('inputType', 'voice');
    formData.append('sessionId', req.sessionId);
    formData.append('characterId', req.characterId);
    formData.append('scenarioId', req.scenarioId);
    formData.append('stageLevel', String(req.stageLevel));
    formData.append('userLevel', req.userLevel);
    formData.append('turnCount', String(req.turnCount));
    formData.append('currentAffinity', String(req.currentAffinity));

    const { data } = await api.post('/api/chat/message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};