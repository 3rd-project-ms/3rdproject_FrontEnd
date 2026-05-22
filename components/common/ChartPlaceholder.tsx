import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ChartPlaceholderProps {
  label?: string;
  height?: number;
  style?: ViewStyle;
}

export default function ChartPlaceholder({
  label = '그래프 제시',
  height = 200,
  style,
}: ChartPlaceholderProps) {
  return (
    <View style={[styles.container, { height }, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: '#888888',
  },
});
