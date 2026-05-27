import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

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

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* 평균 발음 점수 */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>평균 발음 점수</Text>
          <Text style={styles.scoreValue}>
            82<Text style={styles.scoreUnit}>점</Text>
          </Text>
        </View>

        {/* 발음 음소별 상세 분포 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>발음 음소별 상세 분포</Text>
          <View style={styles.progressList}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>모음 정확도 (Vowels)</Text>
                <Text style={styles.progressValue}>88%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '88%' }]} />
              </View>
            </View>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>자음 정확도 (Consonants)</Text>
                <Text style={styles.progressValue}>76%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '76%' }]} />
              </View>
            </View>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>억양 및 호흡 (Intonation)</Text>
                <Text style={styles.progressValue}>82%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '82%' }]} />
              </View>
            </View>
          </View>
          <Text style={styles.cardFootnote}>실시간 음성 비교분석 파형 데이터 기반 생성됨</Text>
        </View>

        {/* 발음 종합 분석 의견 카드 */}
        <View style={[styles.card, styles.analysisCard]}>
          <Text style={styles.cardTitle}>발음 종합 분석 의견</Text>
          <Text style={styles.analysisBody}>
            전반적으로 단어의 억양과 연결음(Linking Sound) 구사력이 아주 훌륭합니다.
            상대방 네이슨과의 소통에는 전혀 지장이 없는 수준입니다.
          </Text>
          <Text style={styles.analysisWarning}>
            ⚠ 다만, 특정 영어 단어 끝맺음 시 자음 'r' 발음이 약화되는 패턴이 확인되니 세밀한 교정이 필요합니다.
          </Text>
        </View>

        {/* 하단 버튼 — auto 마진으로 하단 고정 */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            label="더 자세히 보기"
            variant="primary"
            onPress={() => router.push('/report/pronunciation-detail')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF8',
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
    color: '#0B0B12',
    lineHeight: 30,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B12',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },
  scoreSection: {
    gap: 4,
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#616161',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '600',
    color: '#0B0B12',
  },
  scoreUnit: {
    fontSize: 20,
    fontWeight: '400',
    color: '#0B0B12',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 24,
    paddingTop: 22,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 0,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B12',
    marginBottom: 28,
  },
  progressList: {
    gap: 16,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0B0B12',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B0B12',
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(246,163,166,0.19)',
    borderRadius: 26,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F6A3A6',
    borderRadius: 26,
  },
  cardFootnote: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 28,
  },
  analysisCard: {
    marginBottom: 0,
    gap: 0,
  },
  analysisBody: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 0,
  },
  analysisWarning: {
    fontSize: 12,
    color: '#F43F5E',
    lineHeight: 20,
    marginTop: 6,
  },
  buttonWrapper: {
    marginTop: 'auto',
  },
});
