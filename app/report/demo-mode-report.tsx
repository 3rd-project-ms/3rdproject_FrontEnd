import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function DemoModeReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showDayPicker, setShowDayPicker] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.navSection, { paddingTop: getHeaderTop(insets.top) }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.characterName}>시엔나 (Sienna)</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.calendarRow}>
        <TouchableOpacity onPress={() => setShowDayPicker(true)}>
          <Ionicons name="calendar-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ReportSummaryContent
        avgPronScore={80}
        correctionCount={1}
        isPronNavigable={true}
        onPronPress={() => router.push('/report/demo-pronunciation' as any)}
        affinityProgress={0.31}
        affinityValue={31}
        affinityLabel="시엔나 (Sienna) 호감도"
        affinityChange={1}
        chatCorrections={[]}
        voiceCorrections={DEMO_CORRECTIONS}
        grammarFeedback="전반적으로 자연스러운 영어 표현을 사용했어요. 한국어 혼용을 줄이면 더 좋아요."
        onReviewPress={() => router.push('/review/demo-review' as any)}
        onPrimaryPress={() => router.back()}
        primaryLabel="돌아가기"
        initialMode="통화"
      />

      <Modal
        visible={showDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDayPicker(false)}>
          <View style={styles.dayPickerCard}>
            <TouchableOpacity
              style={[styles.dayOption, styles.dayOptionActive]}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={[styles.dayOptionText, styles.dayOptionTextActive]}>Day 1</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal, paddingBottom: 4,
  },
  characterName: {
    flex: 1, textAlign: 'center',
    fontSize: Typography.size.lg, fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  },
  calendarRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 6, paddingHorizontal: Spacing.screenHorizontal, paddingBottom: 8,
  },
  noSessionText: {
    fontSize: Typography.size.xs, fontFamily: Typography.family.regular,
    color: Colors.textMuted,
  },
  modalOverlay: { flex: 1 },
  dayPickerCard: {
    position: 'absolute',
    top: 120, right: 16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  dayOption: { paddingHorizontal: 16, paddingVertical: 10 },
  dayOptionActive: { backgroundColor: Colors.primaryAlpha },
  dayOptionText: { fontSize: Typography.size.sm, fontFamily: Typography.family.regular, color: Colors.textPrimary },
  dayOptionTextActive: { fontFamily: Typography.family.semiBold, color: Colors.accentDark },
});
