import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ReportChatTabs, { ChatMode } from '@/components/report/ReportChatTabs';
import ReportDayNav from '@/components/report/ReportDayNav';
import ReportSummaryContent from '@/components/report/ReportSummaryContent';

import { getReportResponseByMode } from '@/utils/mockSelectors';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';

const TOTAL_DAYS = 5;

export default function ModeReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [activeMode, setActiveMode] = useState<ChatMode>('채팅');

  // TODO(api): currentDay 변경 시 해당 일자 데이터 fetch 필요 (현재 mock은 day 무관 고정)
  const vm = buildReportDisplayViewModel(getReportResponseByMode(activeMode, currentDay));

  return (
    <View style={styles.container}>
      <ReportDayNav
        currentDay={currentDay}
        totalDays={TOTAL_DAYS}
        onPrev={() => setCurrentDay((d) => d - 1)}
        onNext={() => setCurrentDay((d) => d + 1)}
      />

      <View style={[styles.headerSection, { paddingTop: getHeaderTop(insets.top) }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>오늘의 대화 종료!</Text>
            <Text style={styles.subtitle}>{vm.characterId} · {vm.stageName} · {vm.streakLabel}</Text>
          </View>
          {/* TODO: 햄버거 메뉴 onPress 핸들러 — 메뉴/드로어 기능 구현 시 연결 */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
            <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ReportChatTabs activeMode={activeMode} onModeChange={setActiveMode} />
      </View>

      <ReportSummaryContent
        avgPronScore={vm.avgPronScore}
        correctionCount={vm.correctionCount}
        isPronNavigable={activeMode === '통화'}
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
  headerSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 8,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
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
