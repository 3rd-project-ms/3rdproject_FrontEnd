import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import SectionCard from '@/components/common/SectionCard';
import ChartPlaceholder from '@/components/common/ChartPlaceholder';
import PrimaryButton from '@/components/common/PrimaryButton';
import NavArrow from '@/components/common/NavArrow';

interface SentenceItem {
  original: string;
  translation: string;
}

const MOCK_SENTENCES: SentenceItem[] = [
  {
    original: '"Hello, I want to learn surfing today."',
    translation: '정식 해석: "안녕하세요, 저 오늘 서핑 배우고 싶어요."',
  },
  {
    original: '"Can I get a coffee, please?"',
    translation: '정식 해석: "커피 한 잔 주실 수 있나요?"',
  },
  {
    original: '"That sounds really interesting!"',
    translation: '정식 해석: "그거 정말 흥미롭게 들리네요!"',
  },
];

export default function PronunciationDetailScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 원문 + 해석 카드 */}
        <SectionCard title={current.original} subtitle={current.translation} />

        {/* 발음 표 placeholder */}
        <ChartPlaceholder label="발음 표 제시" height={180} />

        {/* 내 발음 듣기 / 원어민 발음 가이드 */}
        <View style={styles.audioRow}>
          <PrimaryButton
            label="내 발음 듣기"
            onPress={() => {}}

            style={styles.audioButton}
          />
          <View style={styles.audioGap} />
          <PrimaryButton
            label="원어민 발음 가이드"
            onPress={() => {}}

            style={styles.audioButton}
          />
        </View>

        {/* 다시 녹음해서 도전하기 */}
        <PrimaryButton
          label="다시 녹음해서 도전하기"
          onPress={() => router.push('/(main)/chat-voice')}
        />

        {/* 이전 / 다음 네비게이션 */}
        <NavArrow
          onPrev={() => setCurrentIndex((i) => i - 1)}
          onNext={() => setCurrentIndex((i) => i + 1)}
          prevDisabled={isFirst}
          nextDisabled={isLast}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
    lineHeight: 30,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  audioRow: {
    flexDirection: 'row',
  },
  audioButton: {
    flex: 1,
  },
  audioGap: {
    width: 12,
  },
});
