import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/tokens';

export interface SentenceCardProps {
  sentence: string;
  style?: StyleProp<ViewStyle>;
}

export default function SentenceCard({ sentence, style }: SentenceCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.cardTitle}>진단 분석 대상 문장</Text>
      <Text style={styles.sentenceText}>{sentence}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 20,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 8,
    marginBottom: 35,
  },
  cardTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
  },
  sentenceText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});
