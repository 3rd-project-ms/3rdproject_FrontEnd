import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScoreCard from '@/components/common/ScoreCard';
import ProgressBar from '@/components/common/ProgressBar';
import CorrectionItem from '@/components/common/CorrectionItem';
import PrimaryButton from '@/components/common/PrimaryButton';
import { MOCK_CASE_A } from '@/constants/mockData';

const { height } = Dimensions.get('window');

const MOCK_CORRECTIONS = [
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
];

const apiData = MOCK_CASE_A.data!;
const affinityProgress = apiData.current_affinity / 100;
const affinityValue = apiData.current_affinity;
const grammarFeedback = apiData.system_evaluation.grammar_feedback;
const isPenalty = apiData.system_evaluation.is_penalty;
const remainingPenalties = apiData.remaining_penalties;

export default function ReportScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [corrScrollY, setCorrScrollY] = useState(0);
  const [corrContentHeight, setCorrContentHeight] = useState(0);
  const [corrContainerHeight, setCorrContainerHeight] = useState(0);
  const showScrollDown = corrContentHeight > corrContainerHeight && corrScrollY < 10;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>오늘의 대화 종료!</Text>
          <Text style={styles.subtitle}>Jamie · 카페 사장님 · 3일 연속 완료</Text>
        </View>

        {/* 점수 카드 */}
        <View style={styles.scoreRow}>
          <TouchableOpacity
            style={styles.scoreCardWrap}
            onPress={() => router.push('/report/pronunciation')}
            activeOpacity={0.7}
          >
            <ScoreCard label="평균 발음 점수" value={82} unit="점" />
            <Ionicons name="chevron-forward" size={20} color="#0B0B12" style={styles.scoreArrow} />
          </TouchableOpacity>
          <View style={styles.scoreCardWrap}>
            <ScoreCard label="교정된 표현" value={3} unit="개" />
          </View>
        </View>

        {/* 호감도 바 */}
        <View style={styles.section}>
          <ProgressBar label="Jamie 호감도" progress={affinityProgress} change={8} />
          <Text style={styles.progressNote}>{affinityValue}/100%</Text>
        </View>

        {/* 교정 표현 목록 */}
        <View style={[styles.section, styles.correctionSection]}>
          <Text style={styles.sectionTitle}>오늘 교정된 표현</Text>
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
        <PrimaryButton
          label="v2 화면 보기"
          variant="outline"
          onPress={() => router.push('/report/index-v2')}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: height * 0.05 + 84,
    paddingBottom: 40,
  },
  header: {
    gap: 6,
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
    marginBottom: 12,
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  progressNote: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#AAAAAA',
    textAlign: 'right',
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
  buttonGroup: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  grammarFeedback: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 12,
  },
});
