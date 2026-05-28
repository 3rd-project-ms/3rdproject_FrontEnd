// constants/mockData.ts

import { ChatApiResponse } from '@/types/api';

// 케이스 A: 정상 텍스트 모드 (페널티 없음, 발음 점수 없음)
export const MOCK_CASE_A: ChatApiResponse = {
  success: true,
  code: 'SUCCESS',
  message: 'AI 캐릭터의 답변이 수신되었습니다.',
  data: {
    message_id: 'uuid-1234-abcd',
    turn_count: 5,
    role: 'assistant',
    text_content: "Morning, love! Your usual Americano? Coming right up. Don't you worry, we'll get you sorted in no time.",
    action_description:
      '커피 머신을 닦다가 유저를 발견하고는, 하던 일을 멈추고 부드럽게 미소 지으며 가볍게 목례한다.',
    audio_url: null,
    current_affinity: 45,
    remaining_penalties: 3,
    system_evaluation: {
      grammar_feedback:
        "완벽한 문장입니다! 자연스러운 영국식 인사인 'Lovely morning, isn't it?'을 덧붙여봐도 좋아요.",
      is_penalty: false,
      penalty_reason: null,
      pronunciation_score: null,
    },
  },
};

// 케이스 B: 통화 모드 (호감도 높음 + 발음 점수 포함)
export const MOCK_CASE_B: ChatApiResponse = {
  success: true,
  code: 'SUCCESS',
  message: 'AI 캐릭터의 답변이 수신되었습니다.',
  data: {
    message_id: 'uuid-5678-efgh',
    turn_count: 6,
    role: 'assistant',
    text_content:
      "You always know exactly how to make my heart race, don't you? Stay a bit longer today... please?",
    action_description:
      '유저를 향해 상체를 완전히 틀고, 카운터에 턱을 괸 채 나른하고 달콤한 미소를 짓는다. 깊은 눈빛으로 유저를 응시하며 귓바퀴가 붉어진다.',
    audio_url: 'https://your-azure-blob.blob.core.windows.net/audio/liam_voice_123.wav',
    current_affinity: 85,
    remaining_penalties: 3,
    system_evaluation: {
      grammar_feedback: '아주 좋은 표현입니다!',
      is_penalty: false,
      penalty_reason: null,
      pronunciation_score: {
        accuracy: 90,
        fluency: 85,
        completeness: 95,
        prosody: 88,
        word_details: [
          { word: 'You', accuracy: 95, error_type: null },
          { word: 'always', accuracy: 88, error_type: null },
          { word: 'know', accuracy: 92, error_type: null },
          { word: 'exactly', accuracy: 85, error_type: null },
          { word: 'make', accuracy: 90, error_type: null },
          { word: 'heart', accuracy: 78, error_type: 'r 발음 약화' },
          { word: 'race', accuracy: 72, error_type: "'r' 누락" },
          { word: 'longer', accuracy: 80, error_type: null },
        ],
      },
    },
  },
};

// 케이스 C: 한국어 혼용 (페널티 적용)
export const MOCK_CASE_C: ChatApiResponse = {
  success: true,
  code: 'SUCCESS',
  message: 'AI 캐릭터의 답변이 수신되었습니다.',
  data: {
    message_id: 'uuid-9012-ijkl',
    turn_count: 7,
    role: 'assistant',
    text_content:
      "Oh no, you look so exhausted! Don't worry, a slice of cake is on its way to save your day! ✨",
    action_description:
      '귀엽게 눈을 동그랗게 뜨며 걱정해 주다가, 이내 환하게 웃으며 쇼케이스에서 딸기 케이크를 꺼낸다.',
    audio_url: null,
    current_affinity: 42,
    remaining_penalties: 2,
    system_evaluation: {
      grammar_feedback:
        "한국어를 섞어 쓰셨네요! '너무 피곤해'는 'I am so exhausted'로 표현하는 것이 더 자연스럽습니다.",
      is_penalty: true,
      penalty_reason: 'korean_used',
      pronunciation_score: null,
    },
  },
};

// 케이스 D: 욕설 감지 강제 차단 (에러)
export const MOCK_CASE_D: ChatApiResponse = {
  success: false,
  code: 'ERR_ABUSIVE_WORDS',
  message: '[SYSTEM] 부적절한 언어가 감지되었습니다. 올바른 표현으로 다시 입력해 주세요.',
  data: null,
};
