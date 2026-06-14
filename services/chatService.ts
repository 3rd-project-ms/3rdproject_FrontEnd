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

// ── API 함수 ──
export const chatService = {

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
  getSessionLogs: async (sessionId: string): Promise<any[]> => {
    const { data } = await api.get(`/api/chat/sessions/${sessionId}/logs`);
    return data.data ?? [];
  },

  /** 텍스트 메시지 전송 */
  sendText: async (req: ChatMessageRequest): Promise<ChatResponseData> => {
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
  ): Promise<ChatResponseData> => {
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