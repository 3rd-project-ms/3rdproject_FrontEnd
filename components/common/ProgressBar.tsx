import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  label: string;
  progress: number; // 0 ~ 1
  change?: number;  // +8 처럼 변화량
}

export default function ProgressBar({ label, progress, change }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {change !== undefined && (
          <Text style={[styles.change, change >= 0 ? styles.positive : styles.negative]}>
            {change >= 0 ? `+${change}%` : `${change}%`} 상승
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
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  positive: {
    color: '#4A90E2',
  },
  negative: {
    color: '#E24A4A',
  },
  track: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 0,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 0,
  },
});
