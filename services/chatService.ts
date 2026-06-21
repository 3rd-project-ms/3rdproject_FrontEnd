// services/chatService.ts
import axios from 'axios';
import { ChatResponseData, ProgressUpdateRequest, ProgressUpdateData } from '@/types/api';

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
  scenarioId?: string;
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
  text: string;
  inputType: 'text' | 'voice';
  characterId: string;
  scenarioId: string;
  targetLanguage?: string;
  stageLevel: number;
  userLevel: string;
  turnCount: number;
  currentAffinity: number;
  userAudioUrl?: string;
  history: { role: string; text: string }[];
}

// ── 활성 세션 조회 ──
export interface ActiveSessionResponse {
  session_id: string;
  is_completed: boolean;
}

// ── API 함수 ──
export const chatService = {

  /** 활성 세션 조회 — 이어하기 플로우용 (없으면 null 반환) */
  getActiveSession: async (userId: number, stageId: number): Promise<ActiveSessionResponse | null> => {
    try {
      const { data } = await api.get('/api/chat/sessions/active', { params: { userId, stageId } });
      return data.data ?? null;
    } catch {
      return null;
    }
  },

  /** 세션 시작 — 화면 진입 시 호출 */
  startSession: async (req: SessionStartRequest): Promise<SessionStartResponse> => {
    const { data } = await api.post('/api/chat/sessions', req);
    return data.data;
  },

  /** 세션 종료 */
  endSession: async (sessionId: string): Promise<void> => {
    await api.post(`/api/sessions/${sessionId}/end`);
  },

  /** 스테이지 진행도 업데이트 및 다음 단계 해금 */
  updateProgress: async (req: ProgressUpdateRequest): Promise<ProgressUpdateData | null> => {
    const { data } = await api.post('/api/characters/progress', req);
    return data.data ?? null;
  },

  /** 세션 히스토리 조회 (이어하기용) */
  getSessionLogs: async (sessionId: string, userId: number): Promise<any[]> => {
    const { data } = await api.get(`/api/chat/sessions/${sessionId}/logs`, { params: { userId } });
    return data.data ?? [];
  },

  /** 텍스트 메시지 전송 */
  sendText: async (req: ChatMessageRequest): Promise<ChatResponseData> => {
    const requestPayload = {
      inputType: 'text',
      text: req.text,
      sessionId: req.sessionId,
      characterId: req.characterId,
      scenarioId: req.scenarioId,
      stageLevel: req.stageLevel,
      userLevel: req.userLevel,
      turnCount: req.turnCount,
      currentAffinity: req.currentAffinity,
      targetLanguage: req.targetLanguage ?? 'English',
      history: req.history,
    };

    const formData = new FormData();
    formData.append('inputType', 'text');

    const { data } = await api.post('/api/chat/message', formData, {
      params: { request: JSON.stringify(requestPayload) },
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (d) => d,
      timeout: 15000,
    });
    return data.data;
  },

  /** 음성 메시지 전송 */
  sendVoice: async (
    audioUri: string,
    req: Omit<ChatMessageRequest, 'textContent' | 'inputType'>
  ): Promise<ChatResponseData> => {
    const formData = new FormData();
    formData.append('audioFile', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const requestPayload = {
      inputType: 'voice',
      text: '',
      sessionId: req.sessionId,
      characterId: req.characterId,
      scenarioId: req.scenarioId,
      stageLevel: req.stageLevel,
      userLevel: req.userLevel,
      turnCount: req.turnCount,
      currentAffinity: req.currentAffinity,
      targetLanguage: req.targetLanguage ?? 'English',
      history: req.history,
    };

    const { data } = await api.post('/api/chat/message', formData, {
      params: { request: JSON.stringify(requestPayload) },
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (d) => d,
      timeout: 30000,
    });
    return data.data;
  },
};