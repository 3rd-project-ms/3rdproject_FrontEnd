import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import PrimaryButton from '@/components/common/PrimaryButton';
import SentenceCard from '@/components/common/SentenceCard';
import WordJudgementCard from '@/components/common/WordJudgementCard';
import { SharedStyles } from '@/components/common/styles/shared';
import { Colors, Typography, Spacing } from '@/constants/tokens';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';

const DEMO_SENTENCES = [
  {
    sentence: 'Hi! Can I get an iced Americano, please?',
    allWords: [
      { word: 'Hi',        status: 'pass'    as const },
      { word: 'Can',       status: 'pass'    as const },
      { word: 'I',         status: 'pass'    as const },
      { word: 'get',       status: 'pass'    as const },
      { word: 'an',        status: 'pass'    as const },
      { word: 'iced',      status: 'pass'    as const },
      { word: 'Americano', status: 'warning' as const },
      { word: 'please',    status: 'pass'    as const },
    ],
    words: [
      { word: 'Americano', status: 'warning' as const, warningNote: '강세 위치 오류', guide: '[əˌmɛrɪˈkɑnoʊ]' },
    ],
    audioUrl: null,
  },
  {
    sentence: 'yes the neighborhood is very nice',
    allWords: [
      { word: 'yes',          status: 'pass'    as const },
      { word: 'the',          status: 'pass'    as const },
      { word: 'neighborhood', status: 'warning' as const },
      { word: 'is',           status: 'pass'    as const },
      { word: 'very',         status: 'pass'    as const },
      { word: 'nice',         status: 'pass'    as const },
    ],
    words: [
      { word: 'neighborhood', status: 'warning' as const, warningNote: '음절 누락', guide: '[ˈneɪbərhʊd]' },
    ],
    audioUrl: null,
  },
];

export default function DemoPronunciationDetailScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const { scrollRef, showScrollDown, handleScroll, handleContentSizeChange, handleLayout, scrollToEnd } =
    useScrollVisibility();

  const current = DEMO_SENTENCES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === DEMO_SENTENCES.length - 1;

  const playNativeAudio = async () => {
    // 시연용 — 실제 오디오 없음
    setIsPlayingNative((v) => !v);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SentenceCard sentence={current.sentence} words={current.allWords} />

        <View style={styles.wordCardContainer} onLayout={handleLayout}>
          <Text style={styles.wordCardLabel}>단어 단위 상세 판정</Text>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.wordCardInner}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            decelerationRate={0.98}
          >
            <WordJudgementCard
              words={current.words}
              showLabel={false}
              style={{ borderWidth: 0, borderRadius: 0 }}
            />
          </ScrollView>

          {showScrollDown && (
            <View style={styles.scrollDownWrap}>
              <TouchableOpacity style={styles.scrollDownButton} onPress={scrollToEnd} activeOpacity={0.8}>
                <Ionicons name="chevron-down" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonArea}>
        <PrimaryButton
          label="원어민 발음 가이드"
          variant="primary"
          onPress={playNativeAudio}
          icon={<Ionicons name={isPlayingNative ? 'pause-circle' : 'play-circle'} size={20} color={Colors.white} />}
        />
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => { setCurrentIndex((i) => i - 1); setIsPlayingNative(false); }}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={isFirst ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>
          {currentIndex + 1}/{DEMO_SENTENCES.length} 문장
        </Text>
        <TouchableOpacity
          onPress={() => { setCurrentIndex((i) => i + 1); setIsPlayingNative(false); }}
          disabled={isLast}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={isLast ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: SharedStyles.screenContainer,
  header: SharedStyles.screenHeader,
  backButton: SharedStyles.backButton,
  backLabel: SharedStyles.backLabel,
  navRow: SharedStyles.navRow,
  navLabel: SharedStyles.navLabel,
  scrollDownWrap: SharedStyles.scrollDownWrap,
  scrollDownButton: SharedStyles.scrollDownButton,
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
  },
  wordCardLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  wordCardContainer: {
    flex: 1,
    marginTop: -16,
    marginBottom: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  wordCardInner: {
    paddingBottom: Spacing.screenHorizontal,
  },
  buttonArea: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 12,
  },
});
