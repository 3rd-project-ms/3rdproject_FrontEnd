import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/tokens';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ title, subtitle, children, style }: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 0,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
