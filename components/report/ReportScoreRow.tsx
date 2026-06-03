import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScoreCard from '@/components/common/ScoreCard';
import { Colors, Spacing, Shadow } from '@/constants/tokens';

export interface ReportScoreRowProps {
  avgPronScore: number | null;
  correctionsCount: number;
  isPronNavigable: boolean;
  onPronPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ReportScoreRow({
  avgPronScore,
  correctionsCount,
  isPronNavigable,
  onPronPress,
  style,
}: ReportScoreRowProps) {
  const pronDisplay = avgPronScore !== null ? avgPronScore : '-';
  const pronUnit = avgPronScore !== null ? '점' : '';

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        style={styles.cardWrap}
        onPress={onPronPress}
        activeOpacity={isPronNavigable ? 0.7 : 1}
        disabled={!isPronNavigable}
      >
        <ScoreCard label="평균 발음 점수" value={pronDisplay} unit={pronUnit} />
        {isPronNavigable && (
          <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} style={styles.arrow} />
        )}
      </TouchableOpacity>

      <View style={styles.cardWrap}>
        <ScoreCard label="교정된 표현" value={correctionsCount} unit="개" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
  },
  cardWrap: {
    flex: 1,
    height: 78,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    ...Shadow.cardFull,
  },
  arrow: {
    position: 'absolute',
    top: 21,
    right: 2,
  },
});
