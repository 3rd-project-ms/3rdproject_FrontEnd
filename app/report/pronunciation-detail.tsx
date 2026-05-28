// app/report/pronunciation-detail.tsx

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '@/components/common/PrimaryButton';
import AudioControlButtons from '@/components/common/AudioControlButtons';
import SentenceCard from '@/components/common/SentenceCard';
import WordJudgementCard from '@/components/common/WordJudgementCard';

import { PRONUNCIATION_SENTENCES } from '@/utils/pronunciation';

export default function PronunciationDetailScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stopSignal, setStopSignal] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const showScrollDown = contentHeight > containerHeight && scrollY < 10;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  useFocusEffect(
    useCallback(() => {
      setStopSignal((s) => s + 1);
    }, [])
  );

  const current = PRONUNCIATION_SENTENCES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === PRONUNCIATION_SENTENCES.length - 1;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#0B0B12" />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SentenceCard sentence={current.sentence} />

        {/* 단어 카드 영역 — 고정 높이 + 내부 스크롤 */}
        <View
          style={styles.wordCardContainer}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.wordCardLabel}>단어 단위 상세 판정</Text>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.wordCardInner}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(_, h) => setContentHeight(h)}
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
                onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 오디오 버튼 */}
        <AudioControlButtons stopSignal={stopSignal} />
      </View>

      {/* 다시 녹음해서 도전하기 — content 밖 고정 */}
      <View style={styles.buttonArea}>
        <PrimaryButton
          label="↺ 다시 녹음해서 도전하기"
          variant="primary"
          onPress={() => {
            setStopSignal((s) => s + 1);
            router.push('/report/pronunciation-detail-play');
          }}
        />
      </View>

      {/* 문장 네비게이션 — 화면 하단 고정 */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={isFirst ? '#AAAAAA' : '#0B0B12'} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>
          {currentIndex + 1}/{PRONUNCIATION_SENTENCES.length} 문장
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => i + 1)}
          disabled={isLast}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={isLast ? '#AAAAAA' : '#0B0B12'} />
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
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    lineHeight: 26,
  },
  backLabel: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  wordCardLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#616161',
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
    paddingBottom: 16,
  },
  buttonArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    textAlign: 'center',
    lineHeight: 36,
  },
  navArrowDisabled: {
    color: '#AAAAAA',
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#AAAAAA',
  },
  scrollDownWrap: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollDownButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(246,163,166,0.19)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
