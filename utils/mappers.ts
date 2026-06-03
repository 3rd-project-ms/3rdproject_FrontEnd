import { ChatApiResponse, Correction, PronunciationScore } from '@/types/api';
import { WordItem } from '@/components/common/WordJudgementCard';
import { mapWordDetails } from '@/utils/pronunciation';

// ── 뷰모델 타입 정의 ─────────────────────────


export interface ReportViewModel {
  characterId: string;
  stageName: string;
  streakLabel: string;
  affinityProgress: number;
  affinityValue: number;
  isPenalty: boolean;
  remainingPenalties: number;
  grammarFeedback: string;
  corrections: Correction[];
  avgPronScore: number | null;
  affinityChange: number | null;
}

export interface ScoreItem {
  label: string;
  value: number;
}

export interface PronunciationSentence {
  sentence: string;
  words: WordItem[];
}

export interface WeakWord {
  word: string;
  error_type: string;
}

export interface PronunciationViewModel {
  avgScore: number;
  scoreItems: ScoreItem[];
  sentences: PronunciationSentence[];
  weakWords: WeakWord[];
}

// TODO: API 명세 확정 후 Correction → ReviewItem 변환 mapper 추가
// 현재는 mock 구조 그대로 사용; review API 연동 시 이 타입 기준으로 맞춤
export interface ReviewItem {
  id: string;
  type: '문법' | '발음' | '표현';
  english: string;       // TODO(api): Correction.corrected_sentence로 교체
  korean: string;        // TODO(api): Correction.translation으로 교체
  starred: boolean;      // TODO(api): Correction.is_reviewed에 대응
}

export interface DateGroup {
  day: string;
  character: string;
  items: ReviewItem[];
}

// ── 매퍼 함수 ────────────────────────────────
// TODO: API 연동 시 각 mapper의 TODO 주석 위치만 실데이터 필드로 교체 — 화면 코드는 수정 불필요

function calcAvgPronScore(pronScore: PronunciationScore): number {
  return Math.round(
    (pronScore.accuracy + pronScore.fluency + pronScore.completeness + pronScore.prosody) / 4
  );
}

export function mapReportViewModel(response: ChatApiResponse): ReportViewModel {
  const data = response.data;

  if (!data) {
    return {
      characterId: '',
      stageName: '',
      streakLabel: '',
      affinityProgress: 0,
      affinityValue: 0,
      isPenalty: false,
      remainingPenalties: 0,
      grammarFeedback: '',
      corrections: [],
      avgPronScore: null,
      affinityChange: null,
    };
  }

  const pronScore = data.system_evaluation.pronunciation_score;
  const avgPronScore = pronScore ? calcAvgPronScore(pronScore) : null;

  const apiCorrections = data.system_evaluation.corrections;
  const corrections = apiCorrections ?? [];

  return {
    // TODO(api): /api/characters/status 호출 후 characters 배열에서 character_id 매칭한 name을 characterId에 저장
    // 예: const character = characters.find(c => c.character_id === data.character_id);
    //     characterId: character?.name ?? data.character_id
    characterId: 'Liam',
    // TODO(api): 리포트 API 응답에 stage_title 필드 추가 요청 후 data.stage_title으로 교체
    stageName: '카페 사장님',
    // TODO(api): 리포트 API 응답에 continuous_days 필드 추가 요청 후 `${data.continuous_days}일 연속 완료`로 교체
    streakLabel: '3일 연속 완료',
    affinityProgress: data.current_affinity / 100,
    affinityValue: data.current_affinity,
    isPenalty: data.system_evaluation.is_penalty,
    remainingPenalties: data.remaining_penalties,
    grammarFeedback: data.system_evaluation.grammar_feedback,
    corrections,
    avgPronScore,
    // TODO(api): 실제 delta 값으로 교체
    affinityChange: null,
  };
}

export function mapPronunciationViewModel(response: ChatApiResponse): PronunciationViewModel {
  const data = response.data;

  if (!data) {
    return {
      avgScore: 0,
      scoreItems: [],
      sentences: [],
      weakWords: [],
    };
  }

  const pronScore = data.system_evaluation.pronunciation_score;

  if (!pronScore) {
    return {
      avgScore: 0,
      scoreItems: [],
      sentences: [],
      weakWords: [],
    };
  }

  const avgScore = calcAvgPronScore(pronScore);

  const scoreItems: ScoreItem[] = [
    { label: '정확도 (Accuracy)', value: pronScore.accuracy },
    { label: '유창성 (Fluency)', value: pronScore.fluency },
    { label: '완성도 (Completeness)', value: pronScore.completeness },
    { label: '운율 (Prosody)', value: pronScore.prosody },
  ];

  // TODO(api): 다중 발화 지원 시 sentences = pronunciation_score.utterances.map(...)으로 교체
  const sentences: PronunciationSentence[] = [
    {
      sentence: data.text_content,
      words: mapWordDetails(pronScore.word_details),
    },
  ];

  const weakWords: WeakWord[] = pronScore.word_details
    .filter((w) => w.error_type !== null)
    .map((w) => ({
      word: w.word,
      error_type: w.error_type as string,
    }));

  return {
    avgScore,
    scoreItems,
    sentences,
    weakWords,
  };
}
