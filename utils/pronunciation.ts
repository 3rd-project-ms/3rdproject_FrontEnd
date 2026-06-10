import { WordDetail } from '@/types/api';
import { WordItem } from '@/components/common/WordJudgementCard';

export function mapWordDetails(wordDetails: WordDetail[]): WordItem[] {
  return wordDetails.map((w) => ({
    word: w.word,
    // TODO(api): word_details.guide 최종 필드명 확정 시 동기화
    // TODO(api): IPA 형식/언어별 표기 규칙 확인
    guide: (w as any).guide as string | undefined,
    status: w.error_type ? 'warning' : 'pass',
    warningNote: w.error_type ?? undefined,
  }));
}
