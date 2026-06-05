import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing } from '@/constants/tokens';

export interface ReportDayNavProps {
  currentDay: number;
  totalDays: number;
  onPrev: () => void;
  onNext: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ReportDayNav({
  currentDay,
  totalDays,
  onPrev,
  onNext,
  style,
}: ReportDayNavProps) {
  const isFirst = currentDay === 1;
  const isLast = currentDay === totalDays;

  return (
    <View style={[styles.nav, style]}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={isFirst}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={isFirst ? Colors.textMuted : Colors.textPrimary}
        />
      </TouchableOpacity>

      <Text style={styles.label}>Day{currentDay}</Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={isLast}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isLast ? Colors.textMuted : Colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.headerTop,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  },
});
