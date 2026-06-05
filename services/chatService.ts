// services/chatService.ts
// 백엔드 FastAPI와 통신하는 서비스 레이어
import axios from 'axios';

// TODO: 백엔드 URL 확정 후 변경
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 텍스트 채팅 요청/응답 타입 ──
export interface TextChatRequest {
  character_id: string;
  gender: string;
  user_message: string;
  mode?: 'provoke' | 'mumble' | 'normal';
}

export interface TextChatResponse {
  character_reply: string;
  correction: string;
  better_expression: string;
  learning_point: string;
  affection_change: number;
  is_read_ssip: boolean;
}

// ── 음성 채팅 요청/응답 타입 ──
export interface VoiceChatResponse {
  stt_result: string;
  pronunciation_score: number;        // 0~100
  character_reply: string;
  tts_audio_url: string;
  correction: string;
  affection_change: number;
}

// ── API 함수 ──
export const chatService = {
  /** 텍스트 모드 대화 전송 */
  sendText: async (req: TextChatRequest): Promise<TextChatResponse> => {
    const { data } = await api.post<TextChatResponse>('/chat/text', req);
    return data;
  },

  /** 음성 모드 — 오디오 Blob 전송 */
  sendVoice: async (
    audioUri: string,
    characterId: string,
    gender: string
  ): Promise<VoiceChatResponse> => {
    const formData = new FormData();

    // React Native에서 파일을 FormData에 첨부하는 방식
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('character_id', characterId);
    formData.append('gender', gender);

    const { data } = await api.post<VoiceChatResponse>('/chat/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
