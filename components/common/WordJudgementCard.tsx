import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface WordItem {
  word: string;
  guide: string;
  myPronunciation: string;
  status: 'pass' | 'warning';
  warningNote?: string;
}

interface WordJudgementCardProps {
  words: WordItem[];
}

export default function WordJudgementCard({ words }: WordJudgementCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>단어 단위 상세 판정</Text>
      <View style={styles.wordList}>
        {words.map((item, index) => (
          <View
            key={index}
            style={[styles.wordCard, item.status === 'warning' ? styles.wordCardWarning : styles.wordCardPass]}
          >
            <View style={styles.wordRow}>
              <Text style={styles.wordName}>{item.word}</Text>
              <Text style={item.status === 'warning' ? styles.statusWarning : styles.statusPass}>
                {item.status === 'pass' ? '통과' : `주의 (${item.warningNote})`}
              </Text>
            </View>
            <View style={styles.wordRow}>
              <Text style={styles.guideText}>가이드: {item.guide}</Text>
              <Text style={styles.myPronText}>내 발음: {item.myPronunciation}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 20,
    paddingTop: 18,
    paddingRight: 16,
    paddingBottom: 25,
    gap: 23,
    marginBottom: 34,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#616161',
  },
  wordList: {
    gap: 10,
  },
  wordCard: {
    height: 60,
    borderRadius: 12,
    paddingLeft: 22,
    paddingRight: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  wordCardPass: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  wordCardWarning: {
    backgroundColor: 'rgba(246,163,166,0.19)',
    borderWidth: 1,
    borderColor: '#F6A3A6',
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B0B12',
  },
  statusPass: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
  },
  statusWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F43F5E',
  },
  guideText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#AAAAAA',
  },
  myPronText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#AAAAAA',
  },
});
