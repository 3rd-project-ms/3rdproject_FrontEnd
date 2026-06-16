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
  grammar_feedback: string;
  penalty: boolean;
  penalty_reason?: string | null;
  pronunciation_feedback: string | null;
  corrections_json?: Correction[];
  user_recognized_text?: string;
  model_info?: string;
  ipa_guides?: string;
}

export interface ChatResponseData {
  message_id: string;
  turn_count: number;
  role: 'assistant';
  text_content: string;
  action_description: string;
  audio_url: string | null;
  affinity_delta: number;
  current_total_affinity: number;
  remaining_penalties: number;
  system_evaluation: SystemEvaluation;
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
  data: CharacterStatusItem[];
}

export interface StageItem {
  id: number;
  stageLabel: string;
  title: string;
  hint: string;
  isSpecial: boolean;
  unlockAt?: number;
  isLocked: boolean;
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
  isPassed: boolean;
}

export interface ProgressUpdateData {
  isCurrentStageCompleted: boolean;
  isNextStageUnlocked: boolean;
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
