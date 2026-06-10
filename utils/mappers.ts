import { ChatApiResponse, ReportApiResponse, Correction, PronunciationScore } from "@/types/api";

type AnyReportResponse = ChatApiResponse | ReportApiResponse;

function isReportApiResponse(r: AnyReportResponse): r is ReportApiResponse {
  return r.data !== null && r.data !== undefined && 'session_id' in r.data;
}
import { WordItem } from "@/components/common/WordJudgementCard";
import { mapWordDetails } from "@/utils/pronunciation";

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
  allWords: WordItem[];
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

export interface ReviewItem {
  id: string;
  type: "문법" | "발음" | "표현";
  corrected_sentence: string;
  translation: string;
  starred: boolean;
}

export interface DateGroup {
  day: string;
  character: string;
  items: ReviewItem[];
}

// ── 매퍼 함수 ────────────────────────────────
// TODO: API 연동 시 각 mapper의 TODO 주석 위치만 실데이터 필드로 교체 — 화면 코드는 수정 불필요

// Swagger GET /api/corrections 응답 — 현재 확인된 필드만 사용
interface CorrectionSummary {
  correction_id: number;
  original_sentence: string;
  corrected_sentence: string;
  corrected_audio_url: string;
}

// 현재는 임시 그룹핑 로직입니다. (Map 키 = 날짜 문자열 가정)
// GET /api/corrections 응답에 session_id가 추가되면
// session 기준 그룹핑(mapCorrectionsToSessionGroups)으로 전환 예정입니다.
// 트리거: 백엔드 session_id 필드 추가 확정 후
//
// bookmarkedIds: GET /api/corrections/bookmarks 응답에서 추출한 correction_id Set.
// 전달 시 starred 초기값을 북마크 여부로 설정, 미전달 시 false 유지.
export function mapCorrectionsToDateGroups(
  data: { [date: string]: CorrectionSummary[] },
  bookmarkedIds?: Set<string>
): DateGroup[] {
  return Object.entries(data).map(([day, corrections]) => ({
    day,
    character: '', // TODO(api): GET /api/corrections에 character_name 없음 — 백엔드 추가 요청 필요
    items: corrections.map((c) => ({
      id: String(c.correction_id),
      type: '문법' as const, // TODO(api): type 필드 GET 응답에 없음 — 백엔드 추가 요청 필요
      corrected_sentence: c.corrected_sentence,
      translation: '',       // TODO(api): translation GET 응답에 없음 — 유저 입력 후 PATCH 가드 해제 예정
      starred: bookmarkedIds ? bookmarkedIds.has(String(c.correction_id)) : false,
    })),
  }));
}

function calcAvgPronScore(pronScore: PronunciationScore): number {
  return Math.round(
    (pronScore.accuracy +
      pronScore.fluency +
      pronScore.completeness +
      pronScore.prosody) /
      4,
  );
}

export function mapReportViewModel(response: AnyReportResponse): ReportViewModel {
  // TODO(api): ChatApiResponse → ReportApiResponse로 교체 시 isReportApiResponse 분기 제거 후 ReportApiResponse 직접 사용
  const data = response.data;

  if (!data) {
    return {
      characterId: "",
      stageName: "",
      streakLabel: "",
      affinityProgress: 0,
      affinityValue: 0,
      isPenalty: false,
      remainingPenalties: 0,
      grammarFeedback: "",
      corrections: [],
      avgPronScore: null,
      affinityChange: null,
    };
  }

  let pronScore: PronunciationScore | null;
  let corrections: Correction[];
  let grammarFeedback: string;
  let affinityProgress: number;
  let affinityValue: number;
  let isPenalty: boolean;
  let remainingPenalties: number;

  if (isReportApiResponse(response)) {
    const reportData = response.data!;
    pronScore = reportData.average_pronunciation;
    corrections = reportData.corrections;
    grammarFeedback = reportData.corrections.find((c) => c.grammar_feedback)?.grammar_feedback ?? '';
    affinityProgress = 0;
    affinityValue = 0;
    isPenalty = false;
    remainingPenalties = 0;
  } else {
    const chatData = data as import('@/types/api').ChatResponseData;
    pronScore = chatData.system_evaluation.pronunciation_score;
    corrections = chatData.system_evaluation.corrections ?? [];
    grammarFeedback = chatData.system_evaluation.grammar_feedback;
    affinityProgress = chatData.current_total_affinity / 100;
    affinityValue = chatData.current_total_affinity;
    isPenalty = chatData.system_evaluation.is_penalty;
    remainingPenalties = chatData.remaining_penalties;
  }

  const avgPronScore = pronScore ? calcAvgPronScore(pronScore) : null;

  return {
    // TODO(api): /api/characters/status 호출 후 characters 배열에서 character_id 매칭한 name을 characterId에 저장
    // 예: const character = characters.find(c => c.character_id === data.character_id);
    //     characterId: character?.name ?? data.character_id
    characterId: "Liam",
    // TODO(api): 리포트 API 응답에 stage_title 필드 추가 요청 후 data.stage_title으로 교체
    stageName: "카페 사장님",
    // TODO(api): 리포트 API 응답에 continuous_days 필드 추가 요청 후 `${data.continuous_days}일 연속 완료`로 교체
    streakLabel: "3일 연속 완료",
    affinityProgress,
    affinityValue,
    isPenalty,
    remainingPenalties,
    grammarFeedback,
    corrections,
    avgPronScore,
    // TODO(api): 채팅팀 머지 후 params.affinity_change로 교체
    affinityChange: null,
  };
}

export function mapPronunciationViewModel(
  response: AnyReportResponse,
): PronunciationViewModel {
  // TODO(api): ChatApiResponse → ReportApiResponse로 교체 시 isReportApiResponse 분기 제거 후 data.average_pronunciation 직접 사용
  const data = response.data;

  if (!data) {
    return { avgScore: 0, scoreItems: [], sentences: [], weakWords: [] };
  }

  let pronScore: PronunciationScore | null;
  let sentenceText: string;

  if (isReportApiResponse(response)) {
    const reportData = response.data!;
    pronScore = reportData.average_pronunciation;
    // TODO(api): ReportApiResponse에 sentence 텍스트 필드 확정 시 교체
    sentenceText = '';
  } else {
    const chatData = data as import('@/types/api').ChatResponseData;
    pronScore = chatData.system_evaluation.pronunciation_score;
    sentenceText = chatData.text_content;
  }

  if (!pronScore) {
    return { avgScore: 0, scoreItems: [], sentences: [], weakWords: [] };
  }

  const avgScore = calcAvgPronScore(pronScore);

  const scoreItems: ScoreItem[] = [
    { label: "정확도 (Accuracy)", value: pronScore.accuracy },
    { label: "유창성 (Fluency)", value: pronScore.fluency },
    { label: "완성도 (Completeness)", value: pronScore.completeness },
    { label: "운율 (Prosody)", value: pronScore.prosody },
  ];

  // TODO(api): 다중 발화 지원 시 sentences = pronunciation_score.utterances.map(...)으로 교체
  const sentences: PronunciationSentence[] = [
    {
      sentence: sentenceText,
      allWords: mapWordDetails(pronScore.word_details), // SentenceCard용 전체
      words: mapWordDetails(pronScore.word_details).filter(
        (w) => w.status === "warning",
      ), // WordJudgementCard용
    },
  ];

  const weakWords: WeakWord[] = pronScore.word_details
    .filter((w) => w.error_type !== null)
    .map((w) => ({
      word: w.word,
      error_type: w.error_type as string,
    }));

  return { avgScore, scoreItems, sentences, weakWords };
}
