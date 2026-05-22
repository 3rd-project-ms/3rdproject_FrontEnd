import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ChartPlaceholder from '@/components/common/ChartPlaceholder';
import PrimaryButton from '@/components/common/PrimaryButton';

export default function PronunciationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'‹'}</Text>
          <Text style={styles.backLabel}>발음 정밀 진단</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 평균 발음 점수 */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>평균 발음 점수</Text>
          <Text style={styles.scoreValue}>
            82<Text style={styles.scoreUnit}>점</Text>
          </Text>
        </View>

        {/* 그래프 */}
        <ChartPlaceholder label="그래프 제시" height={220} />

        {/* 발음 분석 내용 */}
        <ChartPlaceholder label="발음 분석 내용" height={120} />

        {/* 더 자세히 보기 */}
        <PrimaryButton
          label="더 자세히 보기"
          onPress={() => router.push('/report/pronunciation-detail')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backIcon: {
    fontSize: 26,
    color: '#1A1A1A',
    lineHeight: 30,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },
  scoreSection: {
    gap: 4,
  },
  scoreLabel: {
    fontSize: 15,
    color: '#888888',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scoreUnit: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1A1A1A',
  },
});
