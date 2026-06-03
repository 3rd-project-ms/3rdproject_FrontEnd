// app/report/pronunciation-overview.tsx
// Pronunciation Overview — 발음 점수 요약 및 분석 의견

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '@/components/common/PrimaryButton';
import { mapPronunciationViewModel } from '@/utils/mappers';
import { getPronunciationResponse } from '@/utils/mockSelectors';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';

// TODO(api): API 연동 시 컴포넌트 내부 또는 커스텀 훅으로 이동
const vm = mapPronunciationViewModel(getPronunciationResponse());

export default function PronunciationOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollRef, showScrollDown, handleScroll, handleContentSizeChange, handleLayout, scrollToEnd } =
    useScrollVisibility();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={[styles.content, { paddingTop: getHeaderTop(insets.top) }]}>
        {/* 평균 발음 점수 */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>평균 발음 점수</Text>
          <Text style={styles.scoreValue}>
            {vm.avgScore}
            <Text style={styles.scoreUnit}>점</Text>
          </Text>
        </View>

        {/* 발음 음소별 상세 분포 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>발음 음소별 상세 분포</Text>
          <View style={styles.progressList}>
            {vm.scoreItems.map((item) => (
              <View key={item.label} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{item.label}</Text>
                  <Text style={styles.progressValue}>{item.value}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.value}%` }]} />
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.cardFootnote}>실시간 음성 비교분석 파형 데이터 기반 생성됨</Text>
        </View>

        {/* 발음 종합 분석 의견 카드 */}
        <View style={[styles.card, styles.analysisCard]} onLayout={handleLayout}>
          <Text style={styles.analysisCardTitle}>발음 종합 분석 의견</Text>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
          >
            {vm.weakWords.length === 0 ? (
              <Text style={styles.analysisEmpty}>모든 단어 발음이 양호합니다.</Text>
            ) : (
              vm.weakWords.map((item, index) => (
                <Text key={index} style={styles.analysisWarning}>
                  ⚠ [{item.word}] {item.error_type}
                </Text>
              ))
            )}
          </ScrollView>
          {showScrollDown && (
            <TouchableOpacity
              style={styles.scrollDownButton}
              onPress={scrollToEnd}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-down" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            label="더 자세히 보기"
            variant="primary"
            onPress={() => router.push(ROUTES.PRON_DETAIL as any)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.headerTop,
    paddingHorizontal: Spacing.headerInner,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 40,
  },
  scoreSection: {
    gap: 4,
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  scoreValue: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  scoreUnit: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 24,
    paddingTop: 14,
    paddingRight: Spacing.screenHorizontal,
    paddingBottom: Spacing.screenHorizontal,
    gap: 0,
    marginBottom: 14,
    shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.semiBold,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  analysisCardTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.semiBold,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  progressList: {
    gap: 16,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  progressValue: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Spacing.borderRadius.progress,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.progress,
  },
  cardFootnote: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 28,
  },
  analysisCard: {
    marginBottom: 0,
    gap: 0,
    height: 160,
    overflow: 'hidden',
  },
  scrollDownButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.pill,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisEmpty: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  analysisWarning: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.danger,
    lineHeight: 20,
    marginTop: 6,
  },
  buttonWrapper: {
    marginTop: 'auto',
  },
});
