import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '@/components/common/PrimaryButton';
import SentenceCard from '@/components/common/SentenceCard';
import WordJudgementCard from '@/components/common/WordJudgementCard';
import { SharedStyles } from '@/components/common/styles/shared';

import { getPronunciationResponse } from '@/utils/mockSelectors';
import { mapPronunciationViewModel } from '@/utils/mappers';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Colors, Typography, Spacing } from '@/constants/tokens';

// TODO(api): API 연동 시 컴포넌트 내부 또는 커스텀 훅으로 이동
const sentences = mapPronunciationViewModel(getPronunciationResponse()).sentences;

export default function PronunciationDetailScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const { scrollRef, showScrollDown, handleScroll, handleContentSizeChange, handleLayout, scrollToEnd } =
    useScrollVisibility();

  useFocusEffect(
    useCallback(() => {
      setIsPlayingNative(false);
    }, [])
  );

  const current = sentences[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === sentences.length - 1;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SentenceCard sentence={current.sentence} words={current.allWords} />

        {/* 단어 카드 영역 */}
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
              <TouchableOpacity
                style={styles.scrollDownButton}
                onPress={scrollToEnd}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-down" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 원어민 발음 가이드 버튼 — content 밖 고정 */}
      <View style={styles.buttonArea}>
        <PrimaryButton
          label="원어민 발음 가이드"
          variant="primary"
          onPress={() => setIsPlayingNative((v) => !v)}
          icon={<Ionicons name={isPlayingNative ? 'pause-circle' : 'play-circle'} size={20} color={Colors.white} />}
        />
      </View>

      {/* 문장 네비게이션 */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => { setCurrentIndex((i) => i - 1); setIsPlayingNative(false); }}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={isFirst ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>
          {currentIndex + 1}/{sentences.length} 문장
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
