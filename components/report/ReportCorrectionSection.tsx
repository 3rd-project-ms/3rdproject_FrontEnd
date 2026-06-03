import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CorrectionItem from '@/components/common/CorrectionItem';
import { SharedStyles } from '@/components/common/styles/shared';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Colors, Typography, Spacing, Shadow } from '@/constants/tokens';
import { Correction } from '@/types/api';

export interface ReportCorrectionSectionProps {
  corrections: Correction[];
  isPenalty: boolean;
  remainingPenalties: number;
  grammarFeedback: string;
  style?: StyleProp<ViewStyle>;
}

export default function ReportCorrectionSection({
  corrections,
  isPenalty,
  remainingPenalties,
  grammarFeedback,
  style,
}: ReportCorrectionSectionProps) {
  const { scrollRef, showScrollDown, handleScroll, handleContentSizeChange, handleLayout, scrollToEnd } =
    useScrollVisibility();

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>오늘 교정된 표현</Text>

      {isPenalty && (
        <View style={styles.penaltyBanner}>
          <Text style={styles.penaltyText}>
            ⚠ 한국어 사용이 감지되었습니다 · 남은 기회 {remainingPenalties}회
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          {corrections.length === 0 ? (
            <Text style={styles.emptyCorrections}>오늘은 교정된 표현이 없어요.</Text>
          ) : (
            corrections.map((item, index) => (
              <CorrectionItem key={item.id ?? index} original={item.original_sentence} corrected={item.corrected_sentence} />
            ))
          )}
          {grammarFeedback !== '' && (
            <Text style={styles.grammarFeedback}>💬 {grammarFeedback}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 27,
    paddingTop: 18,
    paddingRight: Spacing.screenHorizontal,
    paddingBottom: Spacing.screenHorizontal,
    marginBottom: 8,
    ...Shadow.cardFull,
    overflow: 'hidden',
    height: 240,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  penaltyBanner: {
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Spacing.borderRadius.banner,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  penaltyText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.semiBold,
    color: Colors.accentDark,
  },
  emptyCorrections: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.screenHorizontal,
  },
  grammarFeedback: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 12,
  },
  scrollDownButton: {
    ...SharedStyles.scrollDownButton,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});
