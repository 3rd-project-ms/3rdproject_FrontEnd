// 스테이지별 미션 정의 및 클리어 조건 평가

export interface MissionItem {
  id: number;
  label: string;
  mode?: 'text' | 'voice' | 'both';
}

export interface StageData {
  stageName: string;
  missions: MissionItem[];
  hint: { english: string; korean: string };
}

// 클리어 조건 평가에 필요한 누적 카운터 (chat 화면에서 useRef로 관리)
export interface MissionCounters {
  perfectSentenceCount: number;   // is_penalty: false 누적 횟수
  highScoreCount: number;         // pronunciation_score 기준 초과 횟수
  highScoreThreshold: number;     // 해당 스테이지 점수 기준
  totalAffinityGained: number;    // 세션 내 affinity_delta 누적
}

export interface MissionCheckParams {
  userText: string;
  isPenalty: boolean;
  pronunciationScore: number;
  affinityDelta: number;
  counters: MissionCounters;
}

type MissionCheckFn = (params: MissionCheckParams) => boolean;

interface MissionDef extends MissionItem {
  check: MissionCheckFn;
}

interface StageDefInternal {
  stageName: string;
  hint: { english: string; korean: string };
  missions: MissionDef[];
}

const STAGE_MISSIONS: Record<number, StageDefInternal> = {
  1: {
    stageName: 'Day 1 · 주문하시겠어요?',
    hint: {
      english: "I'd like a latte, please.",
      korean: '라떼 한 잔 주세요.',
    },
    missions: [
      {
        id: 1,
        label: "'I'd like' 또는 'Can I get'으로 주문하기",
        check: ({ userText }) => /i'd like|can i get/i.test(userText),
      },
      {
        id: 2,
        label: '최소 3단어 이상 말하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 3,
      },
      {
        id: 3,
        label: '발음 유창성 80점 이상 1회 달성',
        mode: 'voice',
        check: ({ pronunciationScore }) => pronunciationScore >= 80,
      },
      {
        id: 3,
        label: '완벽한 문장 3회 달성',
        mode: 'text',
        check: ({ counters }) => counters.perfectSentenceCount >= 3,
      },
    ],
  },
  2: {
    stageName: 'Day 2 · 와이파이 비밀번호가 뭔가요?',
    hint: {
      english: "What's the Wi-Fi password?",
      korean: '와이파이 비밀번호가 어떻게 되나요?',
    },
    missions: [
      {
        id: 1,
        label: "'What is' 또는 'Where is'로 질문하기",
        check: ({ userText }) => /what is|where is/i.test(userText),
      },
      {
        id: 2,
        label: '문법 오류 없는 완벽한 문장 3회 달성',
        check: ({ counters }) => counters.perfectSentenceCount >= 3,
      },
      {
        id: 3,
        label: '호감도 +1 이상 획득하기',
        check: ({ counters }) => counters.totalAffinityGained >= 1,
      },
    ],
  },
  3: {
    stageName: 'Day 3 · 오늘의 추천 메뉴',
    hint: {
      english: 'My favorite is the caramel macchiato.',
      korean: '저는 카라멜 마키아토를 제일 좋아해요.',
    },
    missions: [
      {
        id: 1,
        label: "'I like' 또는 'My favorite'로 대답하기",
        check: ({ userText }) => /i like|my favorite/i.test(userText),
      },
      {
        id: 2,
        label: '최소 5단어 이상 말하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 5,
      },
      {
        id: 3,
        label: '발음 정확도 85점 이상 1회 달성',
        mode: 'voice',
        check: ({ pronunciationScore }) => pronunciationScore >= 85,
      },
      {
        id: 3,
        label: '완벽한 문장 4회 달성',
        mode: 'text',
        check: ({ counters }) => counters.perfectSentenceCount >= 4,
      },
    ],
  },
  4: {
    stageName: 'Day 4 · 주문이 좀 밀렸네요',
    hint: {
      english: "It's okay, I can wait a little longer.",
      korean: '괜찮아요, 조금 더 기다릴 수 있어요.',
    },
    missions: [
      {
        id: 1,
        label: "'It's okay' 또는 'No problem'으로 양해하기",
        check: ({ userText }) => /it'?s okay|no problem/i.test(userText),
      },
      {
        id: 2,
        label: '완벽한 문장 4회 달성',
        check: ({ counters }) => counters.perfectSentenceCount >= 4,
      },
      {
        id: 3,
        label: '호감도 +2 이상 획득하기',
        check: ({ counters }) => counters.totalAffinityGained >= 2,
      },
    ],
  },
  5: {
    stageName: 'Day 5 · 항상 그 노트북으로 뭘 하시나요?',
    hint: {
      english: 'I am working on a personal project.',
      korean: '개인 프로젝트를 진행하고 있어요.',
    },
    missions: [
      {
        id: 1,
        label: "'I am ~ing' 현재진행형 구조 사용하기",
        check: ({ userText }) => /i am \w+ing/i.test(userText),
      },
      {
        id: 2,
        label: '최소 6단어 이상 말하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 6,
      },
      {
        id: 3,
        label: '완벽한 문장 5회 달성',
        check: ({ counters }) => counters.perfectSentenceCount >= 5,
      },
    ],
  },
  6: {
    stageName: 'Day 6 · 까다로운 커스텀 주문',
    hint: {
      english: 'Can I get an iced Americano with an extra shot?',
      korean: '아이스 아메리카노에 샷 추가해서 주세요.',
    },
    missions: [
      {
        id: 1,
        label: "'with' 또는 'without'으로 조건 말하기",
        check: ({ userText }) => /\bwith(out)?\b/i.test(userText),
      },
      {
        id: 2,
        label: '발음 정확도 90점 이상 1회 달성',
        mode: 'voice',
        check: ({ pronunciationScore }) => pronunciationScore >= 90,
      },
      {
        id: 2,
        label: '완벽한 문장 5회 달성',
        mode: 'text',
        check: ({ counters }) => counters.perfectSentenceCount >= 5,
      },
      {
        id: 3,
        label: '호감도 +2 이상 획득하기',
        check: ({ counters }) => counters.totalAffinityGained >= 2,
      },
    ],
  },
  7: {
    stageName: 'Day 7 · 오늘 하루, 많이 힘들었어요?',
    hint: {
      english: 'I feel tired because I had a lot of meetings today.',
      korean: '오늘 회의가 많아서 피곤해요.',
    },
    missions: [
      {
        id: 1,
        label: "'Because' 또는 'I feel'로 감정/이유 설명하기",
        check: ({ userText }) => /because|i feel/i.test(userText),
      },
      {
        id: 2,
        label: '최소 8단어 이상의 긴 문장 사용하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 8,
      },
      {
        id: 3,
        label: '완벽한 문장 5회 달성',
        check: ({ counters }) => counters.perfectSentenceCount >= 5,
      },
    ],
  },
  8: {
    stageName: 'Day 8 · 마감 시간인데, 우산 있으세요?',
    hint: {
      english: "If it's raining, would you like to share my umbrella?",
      korean: '비가 오면 제 우산 같이 쓸래요?',
    },
    missions: [
      {
        id: 1,
        label: "'If' 또는 'Would you'로 대답하기",
        check: ({ userText }) => /\bif\b|would you/i.test(userText),
      },
      {
        id: 2,
        label: '발음 유창성 95점 이상 1회 달성',
        mode: 'voice',
        check: ({ pronunciationScore }) => pronunciationScore >= 95,
      },
      {
        id: 2,
        label: '완벽한 문장 6회 달성',
        mode: 'text',
        check: ({ counters }) => counters.perfectSentenceCount >= 6,
      },
      {
        id: 3,
        label: '호감도 +3 이상 획득하기',
        check: ({ counters }) => counters.totalAffinityGained >= 3,
      },
    ],
  },
  9: {
    stageName: '히든 1 · 첫 주말 데이트',
    hint: {
      english: 'You look amazing today!',
      korean: '오늘 정말 멋있어 보여요!',
    },
    missions: [
      {
        id: 1,
        label: "'You look' 또는 'amazing'으로 칭찬하기",
        check: ({ userText }) => /you look|amazing/i.test(userText),
      },
      {
        id: 2,
        label: '완벽한 문장 3회 달성',
        check: ({ counters }) => counters.perfectSentenceCount >= 3,
      },
      {
        id: 3,
        label: '최소 8단어 이상 말하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 8,
      },
    ],
  },
  10: {
    stageName: '히든 2 · 밤 산책, 그리고 고백',
    hint: {
      english: 'I really enjoy spending time with you.',
      korean: '당신과 함께하는 시간이 정말 좋아요.',
    },
    missions: [
      {
        id: 1,
        label: '10단어 이상의 긴 문장으로 진심 전하기',
        check: ({ userText }) => userText.trim().split(/\s+/).length >= 10,
      },
      {
        id: 2,
        label: '발음 유창성·정확도 95점 동시 달성',
        mode: 'voice',
        check: ({ pronunciationScore }) => pronunciationScore >= 95,
      },
      {
        id: 2,
        label: '완벽한 문장 7회 달성',
        mode: 'text',
        check: ({ counters }) => counters.perfectSentenceCount >= 7,
      },
      {
        id: 3,
        label: '호감도 +3 이상 획득하기',
        check: ({ counters }) => counters.totalAffinityGained >= 3,
      },
    ],
  },
};

function filterMissions(missions: MissionDef[], mode: 'text' | 'voice'): MissionDef[] {
  return missions.filter((m) => {
    if (m.mode === 'voice') return mode === 'voice';
    if (m.mode === 'text')  return mode === 'text';
    return true;
  });
}

export function getStageMissions(
  stageId: number,
  mode: 'text' | 'voice',
): { stageName: string; missions: MissionItem[]; hint: { english: string; korean: string } } {
  const data = STAGE_MISSIONS[stageId];
  if (!data) {
    return {
      stageName: `Stage ${stageId}`,
      missions: [
        { id: 1, label: '미션 내용 1' },
        { id: 2, label: '미션 내용 2' },
        { id: 3, label: '미션 내용 3' },
      ],
      hint: { english: '', korean: '' },
    };
  }
  return {
    stageName: data.stageName,
    missions: filterMissions(data.missions, mode).map(({ id, label, mode: m }) => ({ id, label, mode: m })),
    hint: data.hint,
  };
}

export function evaluateMissions(
  stageId: number,
  clearedIds: Set<number>,
  params: MissionCheckParams,
  mode: 'text' | 'voice',
): number[] {
  const data = STAGE_MISSIONS[stageId];
  if (!data) return [];

  return filterMissions(data.missions, mode)
    .filter((m) => !clearedIds.has(m.id) && m.check(params))
    .map((m) => m.id);
}
