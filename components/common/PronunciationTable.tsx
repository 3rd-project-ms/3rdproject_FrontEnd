import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface PronunciationRow {
  label: string;
  value: string;
  subLabel?: string; // 예: "Accuracy"
}

interface PronunciationTableProps {
  rows: PronunciationRow[];
}

export default function PronunciationTable({ rows }: PronunciationTableProps) {
  return (
    <View style={styles.container}>
      {rows.map((row, index) => (
        <View
          key={index}
          style={[styles.row, index < rows.length - 1 && styles.divider]}
        >
          <View style={styles.labelWrap}>
            <Text style={styles.label}>{row.label}</Text>
            {row.subLabel && <Text style={styles.subLabel}>{row.subLabel}</Text>}
          </View>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  labelWrap: {
    gap: 2,
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  subLabel: {
    fontSize: 11,
    color: '#888888',
  },
  value: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});
