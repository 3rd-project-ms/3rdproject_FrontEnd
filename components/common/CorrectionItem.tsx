import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CorrectionItemProps {
  original: string;
  corrected: string;
}

export default function CorrectionItem({ original, corrected }: CorrectionItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.original}>{original}</Text>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.corrected}>{corrected}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  original: {
    fontSize: 14,
    color: '#E24A4A',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  arrow: {
    fontSize: 14,
    color: '#888888',
  },
  corrected: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 2,
  },
});
