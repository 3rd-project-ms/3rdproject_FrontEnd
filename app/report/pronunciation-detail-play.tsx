import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import AudioControlButtons from '@/components/common/AudioControlButtons';
import SentenceCard from '@/components/common/SentenceCard';
import WordJudgementCard, { WordItem } from '@/components/common/WordJudgementCard';

interface SentenceItem {
  sentence: string;
  words: WordItem[];
}

const MOCK_SENTENCES: SentenceItem[] = [
  {
    sentence: '"Hello, I want to learn surfing today."',
    words: [
      { word: 'learn', guide: '[la:rn]', myPronunciation: '[la:rn]', status: 'pass' },
      { word: 'surfing', guide: '[sɔ:rfɪŋ]', myPronunciation: '[sʌfɪn]', status: 'warning', warningNote: "'r' 누락" },
      { word: 'today', guide: "[tə'deɪ]", myPronunciation: "[tə'deɪ]", status: 'pass' },
    ],
  },
  {
    sentence: '"Can I get a coffee, please?"',
    words: [
      { word: 'coffee', guide: "[kɔ:fi]", myPronunciation: "[kɔ:fi]", status: 'pass' },
      { word: 'please', guide: '[pli:z]', myPronunciation: '[pli:z]', status: 'pass' },
    ],
  },
  {
    sentence: '"That sounds really interesting!"',
    words: [
      { word: 'really', guide: '[ri:əli]', myPronunciation: '[ri:li]', status: 'warning', warningNote: '모음 누락' },
      { word: 'interesting', guide: '[ɪntrɪstɪŋ]', myPronunciation: '[ɪntrɪstɪŋ]', status: 'pass' },
    ],
  },
];

export default function PronunciationDetailPlayScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [stopSignal, setStopSignal] = useState(0);

  const current = MOCK_SENTENCES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === MOCK_SENTENCES.length - 1;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'‹'}</Text>
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SentenceCard sentence={current.sentence} />
        <View style={styles.wordCardWrapper}>
          <WordJudgementCard words={current.words} />
        </View>

        {/* 오디오 버튼 */}
        <AudioControlButtons isRecording={isRecording} stopSignal={stopSignal} />
      </View>

      {/* 녹음 버튼 — content 밖 고정 */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={isRecording ? styles.stopButton : styles.recordButton}
          onPress={() => {
            if (isRecording) {
              setIsRecording(false);
            } else {
              setIsRecording(true);
              setStopSignal((s) => s + 1);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={isRecording ? styles.stopButtonLabel : styles.recordButtonLabel}>
            {isRecording ? '녹음 멈추기' : '녹음하기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 문장 네비게이션 — 화면 하단 고정 */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Text style={[styles.navArrow, isFirst && styles.navArrowDisabled]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.navLabel}>{currentIndex + 1}/{MOCK_SENTENCES.length} 문장</Text>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => i + 1)}
          disabled={isLast}
          activeOpacity={0.7}
        >
          <Text style={[styles.navArrow, isLast && styles.navArrowDisabled]}>{'›'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF8',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backIcon: {
    fontSize: 26,
    color: '#0B0B12',
    lineHeight: 26,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B12',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  wordCardWrapper: {
    marginTop: -16,
  },
  buttonArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  recordButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#F6A3A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stopButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#616161',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: '#F4FBF8',
  },
  navArrow: {
    width: 36,
    height: 36,
    fontSize: 26,
    color: '#0B0B12',
    textAlign: 'center',
    lineHeight: 36,
  },
  navArrowDisabled: {
    color: '#AAAAAA',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
  },
});
