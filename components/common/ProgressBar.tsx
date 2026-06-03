import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/tokens';

export interface ProgressBarProps {
  label: string;
  progress: number;
  change?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ProgressBar({ label, progress, change, style }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const changeLabel =
    change === undefined ? '' :
    change > 0 ? `+${change}% 상승` :
    change < 0 ? `${change}% 하락` :
    '변화 없음';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {change !== undefined && (
          <Text style={[
            styles.change,
            change > 0 ? styles.positive : change < 0 ? styles.negative : styles.neutral,
          ]}>
            {changeLabel}
          </Text>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  change: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    textAlign: 'right',
  },
  positive: {
    color: Colors.primary,
  },
  negative: {
    color: Colors.accentDark,
  },
  neutral: {
    color: Colors.textMuted,
  },
  track: {
    height: 10,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: Spacing.borderRadius.progress,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.progress,
  },
});
