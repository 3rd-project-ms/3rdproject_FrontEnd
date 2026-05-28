import { WordDetail } from '@/types/api';
import { WordItem } from '@/components/common/WordJudgementCard';
import { MOCK_CASE_B } from '@/constants/mockData';

export function mapWordDetails(wordDetails: WordDetail[]): WordItem[] {
  return wordDetails.map((w) => ({
    word: w.word,
    guide: '',
    myPronunciation: '',
    status: w.error_type ? 'warning' : 'pass',
    warningNote: w.error_type ?? undefined,
  }));
}

export const pronScore = MOCK_CASE_B.data!.system_evaluation.pronunciation_score!;

export const PRONUNCIATION_SENTENCES = [
  {
    sentence: MOCK_CASE_B.data!.text_content,
    words: mapWordDetails(pronScore.word_details),
  },
  {
    sentence: '"Can I get a coffee, please?"',
    words: [
      { word: 'coffee', guide: '[kɔ:fi]', myPronunciation: '[kɔ:fi]', status: 'pass' as const },
      { word: 'please', guide: '[pli:z]', myPronunciation: '[pli:z]', status: 'pass' as const },
    ],
  },
  {
    sentence: '"That sounds really interesting!"',
    words: [
      { word: 'really', guide: '[ri:əli]', myPronunciation: '[ri:li]', status: 'warning' as const, warningNote: '모음 누락' },
      { word: 'interesting', guide: '[ɪntrɪstɪŋ]', myPronunciation: '[ɪntrɪstɪŋ]', status: 'pass' as const },
    ],
  },
];
