import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

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
    backgroundColor: '#F0F0F0',
    borderRadius: 0,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
  },
});
