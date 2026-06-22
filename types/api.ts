// types/api.ts

export interface WordDetail {
  word: string;
  accuracy: number;
  error_type: string | null;
}

export interface PronunciationScore {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
  word_details: WordDetail[];
}

export interface Correction {
  id?: number;                        // BIGINT
  type?: '문법' | '발음' | '표현';
  original_sentence: string;
  corrected_sentence: string;
  corrected_audio_url?: string;
  translation?: string;               // 유저 직접 작성 해석/코멘트
  is_reviewed?: boolean;              // 복습 완료 여부
  grammar_feedback?: string;          // ReportApiResponse: 각 correction 내 포함
}

export interface SystemEvaluation {
  grammar: {
    grammar_feedback: string;
  };
  expression: {
    corrections_json: Correction[];
    detected_invalid_words: string[];
  };
  pronunciation: {
    accuracy: number;
    fluency: number;
    word_details_json: Record<string, any>;
  };
}

export interface ChatResponseData {
  text: string;
  action_description: string;
  audio_url: string | null;
  affinity_delta: number;
  current_total_affinity: number;
  system_evaluation: SystemEvaluation;
  /**
   * STT 인식 결과 — BE FrontendResponse에 포함됨
   * 음성 모드에서 유저가 말한 내용을 텍스트로 표시할 때 사용
   * 텍스트 모드에서는 null 가능
   */
  user_recognized_text?: string;
}

export interface ChatApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: ChatResponseData | null;
}

export interface ReportResponseData {
  session_id: string;
  scenario_id: string;
  average_pronunciation: PronunciationScore;
  corrections: Correction[];
}

export interface ReportApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: ReportResponseData | null;
}

export interface CharacterItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  affinityScore: number;
  mbti: string;
  statAffinity: number;
  statTsundere: number;
  statWit: number;
}

export interface CharacterListApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: CharacterItem[];
}

export interface CharacterStatusItem {
  characterId: string;
  name: string;
  imageUrl?: string;
  affinityScore: number;
  isUnlocked: boolean;
}

export interface CharacterStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: { characters: CharacterStatusItem[] };
}

export interface StageItem {
  stageId: number;
  stageNumber: number;
  stageType: 'regular' | 'date_hidden';
  title: string;
  scenarioId?: string;
  unlockAffinityRatio?: number;
  bestScore?: number | null;
  completed?: boolean;
  unlocked?: boolean;
}

export interface StageListResponse {
  success: boolean;
  code: string;
  message: string;
  data: StageItem[];
}

export interface ProgressUpdateRequest {
  userId: number;
  currentStageId: number;
  score: number;
  passed: boolean;
}

export interface ProgressUpdateData {
  currentStageCompleted: boolean;
  nextStageUnlocked: boolean;
  nextStageId: number | null;
}

export interface ProgressUpdateResponse {
  code: number;
  message: string;
  data: ProgressUpdateData | null;
}

export interface AiRequestDto {
  text: string;
  videoCall: boolean;
  user_id: number;
  character_id: string;
  is_video_call: boolean;
  user_audio_url: string;
  stage_id: number;
  action_description: string;
}

export interface AiPronunciationData {
  pronunciation_score: PronunciationScore;
  text_content?: string;
  action_description?: string;
}

export interface AiResponseDto {
  success: boolean;
  code?: string;
  message?: string;
  data: AiPronunciationData | null;
}
