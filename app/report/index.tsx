import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Loading from '@/components/common/Loading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';
import { BASE_URL } from '@/services/chatService';
import { ReportApiResponse } from '@/types/api';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function ReportHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session_id, character_name, stage_name, continuous_days, affinity_change } =
    useLocalSearchParams<{
      session_id: string;
      character_name: string;
      stage_name: string;
      continuous_days: string;
      affinity_change: string;
    }>();

  const [reportData, setReportData] = useState<ReportApiResponse | null>(null);
  const [error, setError] = useState(false);
  const setStoreReportData = useChatStore((s) => s.setReportData);
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    if (userId === null) return;
    fetch(`${BASE_URL}/api/reports/sessions/${session_id}?userId=${userId}`)
      .then((res) => res.json())
      .then((json: ReportApiResponse) => {
        setReportData(json);
        setStoreReportData(json);
      })
      .catch(() => setError(true));
  }, [session_id, userId]);

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다</Text>
      </View>
    );
  }

  if (!reportData) {
    return <Loading />;
  }

  const vm = buildReportDisplayViewModel(reportData);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <Text style={styles.title}>오늘의 대화 종료!</Text>
        <Text style={styles.subtitle}>{character_name} · {stage_name} · {continuous_days}</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={vm.avgPronScore}
        correctionCount={vm.correctionCount}
        isPronNavigable={vm.avgPronScore !== null}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={vm.affinityProgress}
        affinityValue={vm.affinityValue}
        affinityLabel={`${character_name} 호감도`}
        affinityChange={Number(affinity_change)}
        chatCorrections={vm.corrections}
        voiceCorrections={vm.corrections}
        grammarFeedback={vm.grammarFeedback}
        onReviewPress={() => router.push({ pathname: ROUTES.REVIEW as any, params: { session_id } })}
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
  errorText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
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
