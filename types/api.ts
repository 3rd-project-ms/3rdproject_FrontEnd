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

export interface SystemEvaluation {
  grammar_feedback: string;
  is_penalty: boolean;
  penalty_reason: string | null;
  pronunciation_score: PronunciationScore | null;
}

export interface ChatResponseData {
  message_id: string;
  turn_count: number;
  role: 'assistant';
  text_content: string;
  action_description: string;
  audio_url: string | null;
  current_affinity: number;
  remaining_penalties: number;
  system_evaluation: SystemEvaluation;
}

export interface ChatApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: ChatResponseData | null;
}
