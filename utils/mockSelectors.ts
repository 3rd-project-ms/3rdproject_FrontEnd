// TODO: API 연동 시 각 함수를 실제 API 호출로 교체 — 이 파일이 API 교체 진입점
import { MOCK_CASE_A, MOCK_CASE_B, MOCK_CASE_C } from '@/constants/mockData';
import { ChatApiResponse } from '@/types/api';
import { DateGroup } from '@/utils/mappers';
import type { ChatMode } from '@/components/report/ReportChatTabs';

export function getDefaultReportResponse(): ChatApiResponse {
  return MOCK_CASE_A;
}

export function getReportResponseByMode(mode: ChatMode, _day?: number): ChatApiResponse {
  // TODO(api): _day 파라미터로 해당 일자 데이터 fetch로 교체
  return mode === '통화' ? MOCK_CASE_B : MOCK_CASE_C;
}

export function getChatReportResponse(): ChatApiResponse {
  return MOCK_CASE_C;
}

export function getVoiceReportResponse(): ChatApiResponse {
  return MOCK_CASE_B;
}

export function getPronunciationResponse(): ChatApiResponse {
  return MOCK_CASE_B;
}

// TODO: review API 연동 시 이 함수를 실제 API 호출로 교체
const MOCK_REVIEW_GROUPS: DateGroup[] = [
  {
    day: 'Day1',
    character: 'Liam',
    items: [
      { id: '1', type: '표현', corrected_sentence: '"In New York, we don\'t really say hello."', translation: '뉴욕에서 우리는 \'hello\'라고 잘 안 해요.', starred: false },
      { id: '2', type: '문법', corrected_sentence: '"That\'s how you order like a local without stressing out."', translation: '이렇게 하면 스트레스 없이 현지인처럼 주문할 수 있어요.', starred: false },
      { id: '3', type: '발음', corrected_sentence: '"Can I get a coffee to go, please?"', translation: '커피 테이크아웃 한 잔 주실 수 있나요?', starred: false },
      { id: '4', type: '문법', corrected_sentence: '"I\'ve been waiting for this for a long time."', translation: '저 이걸 정말 오래 기다려 왔어요.', starred: false },
    ],
  },
  {
    day: 'Day2',
    character: 'June',
    items: [
      { id: '5', type: '발음', corrected_sentence: '"The weather is really nice today, isn\'t it?"', translation: '오늘 날씨 정말 좋죠, 그렇지 않나요?', starred: false },
      { id: '6', type: '표현', corrected_sentence: '"I\'m just browsing, thanks."', translation: '그냥 구경하는 거예요, 감사합니다.', starred: false },
      { id: '7', type: '문법', corrected_sentence: '"Would you mind if I sat here?"', translation: '여기 앉아도 괜찮을까요?', starred: false },
      { id: '8', type: '발음', corrected_sentence: '"Could you speak a little more slowly?"', translation: '조금 더 천천히 말씀해 주실 수 있나요?', starred: false },
    ],
  },
  {
    day: 'Day3',
    character: 'Ian',
    items: [
      { id: '9', type: '표현', corrected_sentence: '"That\'s totally up to you."', translation: '그건 완전히 당신 마음이에요.', starred: false },
      { id: '10', type: '문법', corrected_sentence: '"I should have called you earlier."', translation: '더 일찍 전화했어야 했는데.', starred: false },
      { id: '11', type: '발음', corrected_sentence: '"I\'d like to make a reservation for two."', translation: '두 명으로 예약하고 싶어요.', starred: false },
      { id: '12', type: '표현', corrected_sentence: '"It\'s not really my thing, to be honest."', translation: '솔직히 말하면 제 취향은 아니에요.', starred: false },
    ],
  },
];

export function getMockReviewGroups(): DateGroup[] {
  return MOCK_REVIEW_GROUPS;
}
