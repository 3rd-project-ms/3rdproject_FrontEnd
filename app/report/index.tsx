import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';
import { BASE_URL } from '@/services/chatService';
import { ReportApiResponse } from '@/types/api';
import { useChatStore } from '@/store/useChatStore';

export default function ReportHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionId, characterName, stageName, continuousDays, affinityChange } =
    useLocalSearchParams<{
      sessionId: string;
      characterName: string;
      stageName: string;
      continuousDays: string;
      affinityChange: string;
    }>();

  const [reportData, setReportData] = useState<ReportApiResponse | null>(null);
  const setStoreReportData = useChatStore((s) => s.setReportData);

  useEffect(() => {
    fetch(`${BASE_URL}/api/reports/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((json: ReportApiResponse) => {
        setReportData(json);
        setStoreReportData(json);
      });
  }, [sessionId]);

  if (!reportData) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  const vm = buildReportDisplayViewModel(reportData);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <Text style={styles.title}>오늘의 대화 종료!</Text>
        <Text style={styles.subtitle}>{characterName} · {stageName} · {continuousDays}</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={vm.avgPronScore}
        correctionCount={vm.correctionCount}
        isPronNavigable={vm.avgPronScore !== null}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={vm.affinityProgress}
        affinityValue={vm.affinityValue}
        affinityLabel={`${characterName} 호감도`}
        affinityChange={Number(affinityChange)}
        chatCorrections={vm.corrections}
        voiceCorrections={vm.corrections}
        grammarFeedback={vm.grammarFeedback}
        onReviewPress={() => router.push({ pathname: ROUTES.REVIEW as any, params: { sessionId } })}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
