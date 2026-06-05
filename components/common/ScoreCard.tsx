import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/tokens';

export interface ScoreCardProps {
  label: string;
  value: string | number;
  unit?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ScoreCard({ label, value, unit, style }: ScoreCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 78,
    alignItems: 'flex-start',
    paddingLeft: 27,
    paddingTop: 17,
    paddingBottom: 19,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
    lineHeight: 12,
    marginBottom: 6,
  },
  value: {
    fontSize: Typography.size.score,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  unit: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
  },
});
