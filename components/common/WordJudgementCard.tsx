import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/tokens';

export interface WordItem {
  word: string;
  guide?: string;
  status: 'pass' | 'warning';
  warningNote?: string;
}

export interface WordJudgementCardProps {
  words: WordItem[];
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}

export default function WordJudgementCard({ words, style, showLabel = true }: WordJudgementCardProps) {
  return (
    <View style={[styles.section, style]}>
      {showLabel !== false && (
        <Text style={styles.sectionLabel}>단어 단위 상세 판정</Text>
      )}
      <View style={styles.wordList}>
        {words.map((item, index) => (
          <View
            key={index}
            style={[styles.wordCard, item.status === 'warning' ? styles.wordCardWarning : styles.wordCardPass]}
          >
            <View style={styles.wordRow}>
              <Text style={styles.wordName}>{item.word}</Text>
              <Text style={item.status === 'warning' ? styles.statusWarning : styles.statusPass}>
                {item.status === 'pass' ? '통과' : `주의 (${item.warningNote})`}
              </Text>
            </View>
            <View style={styles.wordRow}>
              <Text style={styles.guideText}>가이드: {item.guide || '-'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 20,
    paddingTop: 18,
    paddingRight: 16,
    paddingBottom: 25,
    gap: 23,
    marginBottom: 34,
  },
  sectionLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
  },
  wordList: {
    gap: 10,
  },
  wordCard: {
    height: 60,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 22,
    paddingRight: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  wordCardPass: {
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  wordCardWarning: {
    backgroundColor: Colors.primaryAlpha,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordName: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
  statusPass: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  },
  statusWarning: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.danger,
  },
  guideText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
  },
});
