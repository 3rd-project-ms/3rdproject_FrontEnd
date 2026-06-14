// services/levelTestService.ts
// 레벨 테스트 문항 조회 / 답변 제출 / 결과 저장 / 현재 레벨 조회 API
import { api, unwrap, CommonResponse } from './api';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LevelTestType = 'select' | 'test';
// Swagger 기준 소문자 enum 사용 (voice / text)
export type AnswerType = 'voice' | 'text';

// ── 응답/요청 타입 (swagger 기준, camelCase) ──
export interface QuestionDto {
  questionId: number;
  questionText: string;
  difficultyLevel: string;
  category: string;
}

export interface SubmitAnswerRequest {
  userId: number;
  questionId: number;
  answerText: string;
  answerType: AnswerType;
}

export interface SaveLevelTestRequest {
  userId: number;
  levelTestType: LevelTestType;
  cefrLevelType: CefrLevel;
  testScore: number;
}

export interface LevelStatusResponse {
  userId: number;
  currentLevel: CefrLevel;
}

export const levelTestService = {
  /** 레벨 테스트 문항 목록 조회 */
  getQuestions: (): Promise<QuestionDto[]> =>
    unwrap(
      api.get<CommonResponse<{ questions: QuestionDto[] }>>(
        '/api/level-tests/questions'
      )
    ).then((data) => data.questions),

  /** 개별 문항 답변 제출 */
  submitAnswer: (req: SubmitAnswerRequest): Promise<void> =>
    unwrap(api.post<CommonResponse<void>>('/api/level-tests/answer', req)),

  /** 레벨 테스트 결과(선택 또는 테스트) 저장 */
  saveResult: (req: SaveLevelTestRequest): Promise<void> =>
    unwrap(api.post<CommonResponse<void>>('/api/level-tests', req)),

  /** 사용자의 현재 레벨 상태 조회 */
  getStatus: (userId: number): Promise<LevelStatusResponse> =>
    unwrap(
      api.get<CommonResponse<LevelStatusResponse>>('/api/level-tests/status', {
        params: { userId },
      })
    ),
};
