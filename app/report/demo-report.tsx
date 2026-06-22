import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';
import { Correction } from '@/types/api';

const DEMO_CORRECTIONS: Correction[] = [
  {
    type: '표현',
    original_sentence: 'yes 며칠 전에 이사왔어요. the neighborhood is very nice',
    corrected_sentence: 'Yes, I moved here a few days ago. The neighborhood is very nice!',
    translation: '네, 며칠 전에 이사왔어요. 동네가 정말 좋아요!',
    grammar_feedback: '한국어 혼용 없이 영어로만 표현해보세요.',
  },
];

export default function DemoReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.titleRow}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.title}>오늘의 대화 종료!</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>시엔나 · Day 1 · 카페에서의 첫 만남</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={80}
        correctionCount={1}
        isPronNavigable={false}
        onPronPress={() => {}}
        affinityProgress={0.31}
        affinityValue={31}
        affinityLabel="시엔나 호감도"
        affinityChange={1}
        chatCorrections={[]}
        voiceCorrections={DEMO_CORRECTIONS}
        grammarFeedback="전반적으로 자연스러운 영어 표현을 사용했어요. 한국어 혼용을 줄이면 더 좋아요."
        initialMode="통화"
        onReviewPress={() => router.push('/review/demo-review' as any)}
        onPrimaryPress={() => router.replace('/(main)/home')}
        primaryLabel="메인으로 돌아가기"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
  },
});
