import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ScoreCard from '@/components/common/ScoreCard';
import ProgressBar from '@/components/common/ProgressBar';
import CorrectionItem from '@/components/common/CorrectionItem';
import PrimaryButton from '@/components/common/PrimaryButton';

const MOCK_CORRECTIONS = [
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
  { original: 'I very like it', corrected: 'I really enjoy it' },
];

export default function ReportScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
        </TouchableOpacity>
        <View style={styles.scoreGap} />
        <View style={styles.scoreCardWrap}>
          <ScoreCard label="교정된 표현" value={3} unit="개" />
        </View>
      </View>

      {/* 호감도 바 */}
      <View style={styles.section}>
        <ProgressBar label="Jamie 호감도" progress={0.62} change={8} />
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

      {/* 하단 버튼 */}
      <View style={styles.buttonGroup}>
        <PrimaryButton
          label="복습페이지로 가기"
          onPress={() => router.push('/review')}
        />
        <PrimaryButton
          label="메인으로 돌아가기"
          onPress={() => router.push('/')}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
  },
  scoreRow: {
    flexDirection: 'row',
  },
  scoreCardWrap: {
    flex: 1,
  },
  scoreGap: {
    width: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  correctionList: {
    gap: 2,
  },
  buttonGroup: {
    marginTop: 12,
    gap: 12,
  },
});
