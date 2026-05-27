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
    alignItems: 'flex-start',
    paddingLeft: 27,
    paddingTop: 17,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#616161',
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B0B12',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#0B0B12',
  },
});
