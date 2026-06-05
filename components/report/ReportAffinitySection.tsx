import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import ProgressBar from '@/components/common/ProgressBar';
import { Colors, Typography, Spacing, Shadow } from '@/constants/tokens';

export interface ReportAffinitySectionProps {
  label: string;
  affinityProgress: number;
  affinityValue: number;
  change?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ReportAffinitySection({
  label,
  affinityProgress,
  affinityValue,
  change,
  style,
}: ReportAffinitySectionProps) {
  return (
    <View style={[styles.section, style]}>
      <ProgressBar label={label} progress={affinityProgress} change={change} />
      <Text style={styles.progressNote}>{affinityValue}/100%</Text>
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
    paddingTop: 15,
    paddingRight: Spacing.screenHorizontal,
    paddingBottom: Spacing.screenHorizontal,
    marginBottom: 8,
    ...Shadow.cardFull,
  },
  progressNote: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
});
