import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SentenceCardProps {
  sentence: string;
}

export default function SentenceCard({ sentence }: SentenceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>진단 분석 대상 문장</Text>
      <Text style={styles.sentenceText}>{sentence}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 20,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 8,
    marginBottom: 35,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#AAAAAA',
  },
  sentenceText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
    lineHeight: 24,
  },
});
