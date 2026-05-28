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
    height: 78,
    alignItems: 'flex-start',
    paddingLeft: 27,
    paddingTop: 17,
    paddingBottom: 19,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    lineHeight: 12,
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
    lineHeight: 24,
  },
  unit: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
  },
});
