// app/report/index-v2.tsx

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScoreCard from '@/components/common/ScoreCard';
import ProgressBar from '@/components/common/ProgressBar';
import CorrectionItem from '@/components/common/CorrectionItem';
import PrimaryButton from '@/components/common/PrimaryButton';

import { MOCK_CASE_B, MOCK_CASE_C } from '@/constants/mockData';
import { ChatApiResponse } from '@/types/api';

const { height } = Dimensions.get('window');

type ChatMode = '채팅' | '통화';

// 탭별 목업 데이터 매핑
// '채팅' → 케이스 C (페널티 UI 확인용), '통화' → 케이스 B (발음 점수 포함)
const MOCK_BY_MODE: Record<ChatMode, ChatApiResponse> = {
  채팅: MOCK_CASE_C,
  통화: MOCK_CASE_B,
};

// 교정 표현 하드코딩 (백엔드 corrections 배열 스펙 확정 전까지 유지)
const MOCK_CORRECTIONS = [
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'She go to school', corrected: 'She goes to school' },
  { original: 'I am boring', corrected: 'I am bored' },
];

const TOTAL_DAYS = 5;

export default function ReportScreenV2() {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [activeMode, setActiveMode] = useState<ChatMode>('채팅');
  const scrollRef = useRef<ScrollView>(null);
  const [corrScrollY, setCorrScrollY] = useState(0);
  const [corrContentHeight, setCorrContentHeight] = useState(0);
  const [corrContainerHeight, setCorrContainerHeight] = useState(0);
  const showScrollDown = corrContentHeight > corrContainerHeight && corrScrollY < 10;

  const isFirst = currentDay === 1;
  const isLast = currentDay === TOTAL_DAYS;

  // 현재 탭에 해당하는 API 데이터
  const response = MOCK_BY_MODE[activeMode];
  const apiData = response.data;

  // 호감도
  const affinityProgress = apiData ? apiData.current_affinity / 100 : 0;
  const affinityValue = apiData?.current_affinity ?? 0;

  // 페널티
  const isPenalty = apiData?.system_evaluation.is_penalty ?? false;
  const remainingPenalties = apiData?.remaining_penalties ?? 3;

  // 문법 피드백
  const grammarFeedback = apiData?.system_evaluation.grammar_feedback ?? '';

  // 발음 점수 (통화 탭)
  const pronScore = apiData?.system_evaluation.pronunciation_score;
  const avgPronScore = pronScore
    ? Math.round(
        (pronScore.accuracy + pronScore.fluency + pronScore.completeness + pronScore.prosody) / 4
      )
    : null;

  return (
    <View style={styles.container}>
      {/* 상단 Day 네비게이션 */}
      <View style={styles.dayNav}>
        <TouchableOpacity
          onPress={() => setCurrentDay((d) => d - 1)}
          disabled={isFirst}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={isFirst ? '#AAAAAA' : '#0B0B12'} />
        </TouchableOpacity>
        <Text style={styles.dayLabel}>Day{currentDay}</Text>
        <TouchableOpacity
          onPress={() => setCurrentDay((d) => d + 1)}
          disabled={isLast}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-forward" size={20} color={isLast ? '#AAAAAA' : '#0B0B12'} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>오늘의 대화 종료!</Text>
            <Text style={styles.subtitle}>Jamie · 카페 사장님 · 3일 연속 완료</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={24} color="#0B0B12" />
          </TouchableOpacity>
        </View>

        {/* 채팅 / 통화 탭 */}
        <View style={styles.tabRow}>
          {(['채팅', '통화'] as ChatMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.tabChip, activeMode === mode && styles.tabChipActive]}
              onPress={() => setActiveMode(mode)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeMode === mode && styles.tabLabelActive]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 점수 카드 */}
        <View style={styles.scoreRow}>
          <TouchableOpacity
            style={styles.scoreCardWrap}
            onPress={() => router.push('/report/pronunciation')}
            activeOpacity={activeMode === '통화' ? 0.7 : 1}
            disabled={activeMode === '채팅'}
          >
            <ScoreCard
              label="평균 발음 점수"
              value={avgPronScore ?? (activeMode === '채팅' ? '-' : 82)}
              unit={avgPronScore != null ? '점' : ''}
            />
            {activeMode === '통화' && <Ionicons name="chevron-forward" size={20} color="#0B0B12" style={styles.scoreArrow} />}
          </TouchableOpacity>
          <View style={styles.scoreCardWrap}>
            <ScoreCard label="교정된 표현" value={MOCK_CORRECTIONS.length} unit="개" />
          </View>
        </View>

        {/* 호감도 바 — current_affinity 연동 */}
        <View style={styles.section}>
          <ProgressBar label="Jamie 호감도" progress={affinityProgress} change={8} />
          <Text style={styles.progressNote}>{affinityValue}/100%</Text>
        </View>

        {/* 교정 표현 목록 */}
        <View style={[styles.section, styles.correctionSection]}>
          <Text style={styles.sectionTitle}>오늘 교정된 표현</Text>

          {/* 페널티 배너 — is_penalty: true 일 때만 표시 */}
          {isPenalty && (
            <View style={styles.penaltyBanner}>
              <Text style={styles.penaltyText}>
                ⚠ 한국어 사용이 감지되었습니다 · 남은 기회 {remainingPenalties}회
              </Text>
            </View>
          )}

          <View
            style={{ flex: 1 }}
            onLayout={(e) => setCorrContainerHeight(e.nativeEvent.layout.height)}
          >
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              onScroll={(e) => setCorrScrollY(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
              onContentSizeChange={(_, h) => setCorrContentHeight(h)}
            >
              {MOCK_CORRECTIONS.map((item, index) => (
                <CorrectionItem key={index} original={item.original} corrected={item.corrected} />
              ))}
              {grammarFeedback !== '' && (
                <Text style={styles.grammarFeedback}>💬 {grammarFeedback}</Text>
              )}
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
        </View>

      </View>

      {/* 하단 버튼 고정 */}
      <View style={styles.buttonGroup}>
        <PrimaryButton
          label="복습페이지로 가기"
          variant="outline"
          onPress={() => router.push('/review')}
        />
        <PrimaryButton
          label="메인으로 돌아가기"
          variant="primary"
          onPress={() => router.push('/')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF8',
  },
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  navArrow: {
    fontSize: 26,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    lineHeight: 26,
  },
  navArrowDisabled: {
    color: '#AAAAAA',
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#AAAAAA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    height: 33,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: 'rgba(246,163,166,0.19)',
    borderColor: '#F6A3A6',
    borderWidth: 1.5,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  tabLabelActive: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
  },
  scoreCardWrap: {
    flex: 1,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    shadowColor: '#E0E0E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  scoreArrow: {
    position: 'absolute',
    top: 21,
    right: 2,
    color: '#0B0B12',
  },
  section: {
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 27,
    paddingTop: 15,
    paddingRight: 16,
    paddingBottom: 16,
    marginBottom: 8,
    shadowColor: '#E0E0E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  progressNote: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#AAAAAA',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  penaltyBanner: {
    backgroundColor: 'rgba(246, 163, 166, 0.19)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F6A3A6',
  },
  penaltyText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#854448',
  },
  correctionList: {
    gap: 0,
  },
  correctionSection: {
    paddingTop: 18,
    overflow: 'hidden',
    height: 240,
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
  grammarFeedback: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 12,
  },
  buttonGroup: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
