// types/api.ts

export interface WordDetail {
  word: string;
  accuracy: number;
  error_type: string | null;
  // TODO(api): word_details.guide / my_pronunciation 최종 필드명 확정 시 동기화
  // TODO(api): IPA 형식/언어별 표기 규칙 확인
  guide?: string;
  my_pronunciation?: string;
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
  translation?: string;               // 유저 직접 작성 해석/코멘트
  is_reviewed?: boolean;              // 복습 완료 여부
}

export interface SystemEvaluation {
  grammar_feedback: string;
  is_penalty: boolean;
  penalty_reason: string | null;
  pronunciation_score: PronunciationScore | null;
  // TODO(api): system_evaluation.corrections는 백엔드 최종 응답 스키마 확인 후 mock과 동기화
  // TODO(api): grammar_feedback 단문 + corrections[] 병행 사용 기준 확인
  corrections?: Correction[];
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
