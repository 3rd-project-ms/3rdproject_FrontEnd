import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const setStoreReportData = useChatStore((s) => s.setReportData);
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    if (userId === null || !session_id) return;
    fetch(`${BASE_URL}/api/reports/sessions/${session_id}?userId=${userId}`)
      .then((res) => res.json())
      .then((json: ReportApiResponse) => {
        setReportData(json);
        setStoreReportData(json);
      })
      .catch(() => {});
  }, [session_id, userId]);

  const vm = reportData ? buildReportDisplayViewModel(reportData) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getHeaderTop(insets.top) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.titleRow}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.title}>오늘의 대화 종료!</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>{character_name} · {stage_name} · {continuous_days}</Text>
      </View>

      <ReportSummaryContent
        avgPronScore={vm?.avgPronScore ?? null}
        correctionCount={vm?.correctionCount ?? 0}
        isPronNavigable={true}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={vm?.affinityProgress ?? 0}
        affinityValue={vm?.affinityValue ?? 0}
        affinityLabel={`${character_name} 호감도`}
        affinityChange={Number(affinity_change)}
        chatCorrections={vm?.corrections ?? []}
        voiceCorrections={vm?.corrections ?? []}
        grammarFeedback={vm?.grammarFeedback ?? null}
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
