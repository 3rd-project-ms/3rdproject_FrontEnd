import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';
import { getDefaultReportResponse } from '@/utils/mockSelectors';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';

export default function ReportHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vm = buildReportDisplayViewModel(getDefaultReportResponse());

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <Text style={styles.title}>오늘의 대화 종료!</Text>
        <Text style={styles.subtitle}>{vm.characterId} · {vm.stageName} · {vm.streakLabel}</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={vm.avgPronScore}
        correctionCount={vm.correctionCount}
        isPronNavigable={vm.avgPronScore !== null}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={vm.affinityProgress}
        affinityValue={vm.affinityValue}
        affinityLabel={`${vm.characterId} 호감도`}
        affinityChange={vm.affinityChange ?? undefined}
        corrections={vm.corrections}
        isPenalty={vm.isPenalty}
        remainingPenalties={vm.remainingPenalties}
        grammarFeedback={vm.grammarFeedback}
        onReviewPress={() => router.push(ROUTES.REVIEW as any)}
        onPrimaryPress={() => router.replace(ROUTES.HOME as any)}
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
