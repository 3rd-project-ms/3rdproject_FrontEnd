import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScoreCard from '@/components/common/ScoreCard';
import ProgressBar from '@/components/common/ProgressBar';
import CorrectionItem from '@/components/common/CorrectionItem';
import PrimaryButton from '@/components/common/PrimaryButton';

const { height } = Dimensions.get('window');

type ChatMode = '채팅' | '통화';

const MOCK_CORRECTIONS = [
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
];

const TOTAL_DAYS = 5;

export default function ReportScreenV2() {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [activeMode, setActiveMode] = useState<ChatMode>('채팅');

  const isFirst = currentDay === 1;
  const isLast = currentDay === TOTAL_DAYS;

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
          <Text style={[styles.navArrow, isFirst && styles.navArrowDisabled]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.dayLabel}>Day{currentDay}</Text>
        <TouchableOpacity
          onPress={() => setCurrentDay((d) => d + 1)}
          disabled={isLast}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Text style={[styles.navArrow, isLast && styles.navArrowDisabled]}>{'›'}</Text>
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
            activeOpacity={0.7}
          >
            <ScoreCard label="평균 발음 점수" value={82} unit="점" />
            <Text style={styles.scoreArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.scoreCardWrap}>
            <ScoreCard label="교정된 표현" value={3} unit="개" />
          </View>
        </View>

        {/* 호감도 바 */}
        <View style={styles.section}>
          <ProgressBar label="Jamie 호감도" progress={0.5} change={8} />
          <Text style={styles.progressNote}>50/100%</Text>
        </View>

        {/* 교정 표현 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 교정된 표현</Text>
          <View style={styles.correctionList}>
            {MOCK_CORRECTIONS.map((item, index) => (
              <CorrectionItem
                key={index}
                original={item.original}
                corrected={item.corrected}
              />
            ))}
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
    color: '#0B0B12',
    lineHeight: 26,
  },
  navArrowDisabled: {
    color: '#CCCCCC',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#0B0B12',
  },
  subtitle: {
    fontSize: 12,
    color: '#616161',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  tabChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabChipActive: {
    backgroundColor: '#F6A3A6',
    borderColor: '#F6A3A6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B12',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
  },
  scoreCardWrap: {
    flex: 1,
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingRight: 16,
    paddingBottom: 16,
  },
  scoreArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 26,
    color: '#0B0B12',
  },
  section: {
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 27,
    paddingTop: 15,
    paddingRight: 16,
    paddingBottom: 16,
    marginBottom: 8,
  },
  progressNote: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B12',
  },
  correctionList: {
    gap: 0,
  },
  buttonGroup: {
    marginTop: 'auto',
    gap: 9,
  },
});
