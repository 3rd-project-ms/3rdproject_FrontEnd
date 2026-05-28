// app/report/pronunciation.tsx

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '@/components/common/PrimaryButton';
import { MOCK_CASE_B } from '@/constants/mockData';

// 발음 점수 데이터 (케이스 B)
const pronScore = MOCK_CASE_B.data!.system_evaluation.pronunciation_score!;

// 4개 지표를 API 데이터로 구성
const SCORE_ITEMS = [
  { label: '정확도 (Accuracy)', value: pronScore.accuracy },
  { label: '유창성 (Fluency)', value: pronScore.fluency },
  { label: '완성도 (Completeness)', value: pronScore.completeness },
  { label: '운율 (Prosody)', value: pronScore.prosody },
];

// 평균 발음 점수 동적 계산
const avgScore = Math.round(
  (pronScore.accuracy + pronScore.fluency + pronScore.completeness + pronScore.prosody) / 4
);

export default function PronunciationScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const showScrollDown = contentHeight > containerHeight && scrollY < 10;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#0B0B12" />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* 평균 발음 점수 — avgScore 동적 연동 */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>평균 발음 점수</Text>
          <Text style={styles.scoreValue}>
            {avgScore}
            <Text style={styles.scoreUnit}>점</Text>
          </Text>
        </View>

        {/* 발음 음소별 상세 분포 카드 — API 4개 지표 연동 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>발음 음소별 상세 분포</Text>
          <View style={styles.progressList}>
            {SCORE_ITEMS.map((item) => (
              <View key={item.label} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{item.label}</Text>
                  <Text style={styles.progressValue}>{item.value}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.value}%` }]} />
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.cardFootnote}>실시간 음성 비교분석 파형 데이터 기반 생성됨</Text>
        </View>

        {/* 발음 종합 분석 의견 카드 */}
        <View style={[styles.card, styles.analysisCard]}>
          <Text style={styles.analysisCardTitle}>발음 종합 분석 의견</Text>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            onContentSizeChange={(_, h) => setContentHeight(h)}
            onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
          >
            <Text style={styles.analysisBody}>
              전반적으로 단어의 억양과 연결음(Linking Sound) 구사력이 아주 훌륭합니다.
              상대방과의 소통에는 전혀 지장이 없는 수준입니다.
            </Text>
            <Text style={styles.analysisWarning}>
              ⚠ 다만, 특정 영어 단어 끝맺음 시 자음 'r' 발음이 약화되는 패턴이 확인되니 세밀한 교정이 필요합니다.
            </Text>
          </ScrollView>
          {showScrollDown && (
            <TouchableOpacity
              style={styles.scrollDownButton}
              onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            label="더 자세히 보기"
            variant="primary"
            onPress={() => router.push('/report/pronunciation-detail')}
          />
        </View>
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
    paddingBottom: 8,
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
    lineHeight: 30,
  },
  backLabel: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  scoreSection: {
    gap: 4,
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  scoreUnit: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 24,
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 0,
    marginBottom: 14,
    shadowColor: '#E0E0E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#616161',
    marginBottom: 24,
  },
  analysisCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#616161',
    marginBottom: 14,
  },
  progressList: {
    gap: 16,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  progressValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(246,163,166,0.19)',
    borderRadius: 26,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F6A3A6',
    borderRadius: 26,
  },
  cardFootnote: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 28,
  },
  analysisCard: {
    marginBottom: 0,
    gap: 0,
    height: 160,
    overflow: 'hidden',
  },
  scrollDownButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(246,163,166,0.19)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisBody: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    lineHeight: 20,
    marginBottom: 0,
  },
  analysisWarning: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#F43F5E',
    lineHeight: 20,
    marginTop: 6,
  },
  buttonWrapper: {
    marginTop: 'auto',
  },
});
