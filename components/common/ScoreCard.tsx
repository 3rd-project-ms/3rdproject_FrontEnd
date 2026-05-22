import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export default function ScoreCard({ label, value, unit }: ScoreCardProps) {
  return (
    <View style={styles.card}>
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
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
    padding: 14,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
  },
});
