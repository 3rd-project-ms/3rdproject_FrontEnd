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
    fontSize: 16,
    color: '#0B0B12',
    fontFamily: 'Inter_600SemiBold',
  },
  change: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  positive: {
    color: '#F6A3A6',
  },
  negative: {
    color: '#854448',
  },
  track: {
    height: 10,
    backgroundColor: 'rgba(246,163,166,0.19)',
    borderRadius: 26,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#F6A3A6',
    borderRadius: 26,
  },
});
