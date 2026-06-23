import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '@/components/common/PrimaryButton';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';

const DEMO_SCORE = 80;

const DEMO_SCORE_ITEMS = [
  { label: '정확도 (Accuracy)', value: 82 },
  { label: '유창성 (Fluency)', value: 80 },
  { label: '완성도 (Completeness)', value: 78 },
  { label: '운율 (Prosody)', value: 75 },
];

const DEMO_WEAK_WORDS = [
  { word: 'Americano', error_type: '강세 위치 오류 — a·MER·i·ca·no' },
  { word: 'neighborhood', error_type: '음절 누락 — neigh·bor·hood' },
];

export default function DemoPronunciationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingTop: getHeaderTop(insets.top) }]}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>평균 발음 점수</Text>
          <Text style={styles.scoreValue}>
            {DEMO_SCORE}
            <Text style={styles.scoreUnit}>점</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>발음 음소별 상세 분포</Text>
          <View style={styles.progressList}>
            {DEMO_SCORE_ITEMS.map((item) => (
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
          <Text style={styles.cardFootnote}>본 점수는 Microsoft Azure Speech Service의{'\n'}음성 인식 기술을 기반으로 산출됩니다</Text>
        </View>

        <View style={[styles.card, styles.analysisCard]}>
          <Text style={styles.analysisCardTitle}>발음 종합 분석 의견</Text>
          {DEMO_WEAK_WORDS.map((item, index) => (
            <Text key={index} style={styles.analysisWarning}>
              ⚠ [{item.word}] {item.error_type}
            </Text>
          ))}
        </View>

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            label="더 자세히 보기"
            variant="primary"
            onPress={() => router.push('/report/demo-pronunciation-detail' as any)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: Spacing.headerTop, paddingHorizontal: Spacing.headerInner, paddingBottom: 8 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLabel: { fontSize: Typography.size.lg, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  content: { flex: 1, paddingHorizontal: Spacing.screenHorizontal, paddingBottom: 40 },
  scoreSection: { gap: 4, marginBottom: 14 },
  scoreLabel: { fontSize: Typography.size.lg, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  scoreValue: { fontSize: Typography.size.xl, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  scoreUnit: { fontSize: Typography.size.lg, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card, paddingLeft: 24, paddingTop: 14,
    paddingRight: Spacing.screenHorizontal, paddingBottom: Spacing.screenHorizontal,
    marginBottom: 14, shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  cardTitle: { fontSize: Typography.size.md, fontFamily: Typography.family.semiBold, color: Colors.textSecondary, marginBottom: 24 },
  analysisCardTitle: { fontSize: Typography.size.md, fontFamily: Typography.family.semiBold, color: Colors.textSecondary, marginBottom: 14 },
  progressList: { gap: 16 },
  progressItem: { gap: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: Typography.size.sm, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  progressValue: { fontSize: Typography.size.sm, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  progressTrack: { height: 10, backgroundColor: Colors.primaryAlpha, borderRadius: Spacing.borderRadius.progress, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Spacing.borderRadius.progress },
  cardFootnote: { fontSize: Typography.size.xs, fontFamily: Typography.family.semiBold, color: Colors.textSecondary, textAlign: 'center', marginTop: 28 },
  analysisCard: { marginBottom: 0, height: 160, overflow: 'hidden' },
  analysisWarning: { fontSize: Typography.size.sm, fontFamily: Typography.family.semiBold, color: Colors.danger, lineHeight: 20, marginTop: 6 },
  buttonWrapper: { marginTop: 'auto' },
});
