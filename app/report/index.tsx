import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';
import { getChatReportResponse, getVoiceReportResponse } from '@/utils/mockSelectors';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';

// TODO(api): 채팅팀 머지 후 useLocalSearchParams로 아래 파라미터 수신
// session_id, character_name, stage_name, continuous_days, affinity_change
// affinity_change는 Number()로 변환 후 ReportSummaryContent affinityChange prop에 전달

export default function ReportHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chatVm = buildReportDisplayViewModel(getChatReportResponse());
  const voiceVm = buildReportDisplayViewModel(getVoiceReportResponse());

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <Text style={styles.title}>오늘의 대화 종료!</Text>
        <Text style={styles.subtitle}>{chatVm.characterId} · {chatVm.stageName} · {chatVm.streakLabel}</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={voiceVm.avgPronScore}
        correctionCount={chatVm.correctionCount}
        isPronNavigable={voiceVm.avgPronScore !== null}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={chatVm.affinityProgress}
        affinityValue={chatVm.affinityValue}
        affinityLabel={`${chatVm.characterId} 호감도`}
        affinityChange={chatVm.affinityChange ?? undefined}
        chatCorrections={chatVm.corrections}
        voiceCorrections={voiceVm.corrections}
        grammarFeedback={chatVm.grammarFeedback}
        onReviewPress={() => router.push(ROUTES.REVIEW as any)}
        onPrimaryPress={() => router.replace(ROUTES.CHAR_HOME as any)}
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
