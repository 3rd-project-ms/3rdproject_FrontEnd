import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface CharacterCardProps {
  title: string;
  reference: string;
  personality: string;
  styleDescription: string;
  affectionLevel: number;
}

export default function CharacterCard({
  title,
  reference,
  personality,
  styleDescription,
  affectionLevel,
}: CharacterCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* 이미지 플레이스홀더 영역 */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.placeholderText}>이미지 준비중</Text>
      </View>

      {/* 텍스트 상세 정보 구역 */}
      <View style={styles.infoContainer}>
        <Text style={styles.characterTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.divider} />
        
        <Text style={styles.infoText} numberOfLines={2}>
          <Text style={styles.label}>레퍼런스: </Text>{reference}
        </Text>
        <Text style={styles.infoText} numberOfLines={2}>
          <Text style={styles.label}>성격: </Text>{personality}
        </Text>
        <Text style={styles.infoText} numberOfLines={2}>
          <Text style={styles.label}>영어 스타일: </Text>{styleDescription}
        </Text>

        {/* 심플한 호감도 세션 */}
        <View style={styles.affectionContainer}>
          <View style={styles.affectionHeader}>
            <View style={styles.leftLabelGroup}>
              <Text style={styles.affectionHeart}>❤️</Text>
              <Text style={styles.affectionLabel}>호감도</Text>
            </View>
            <Text style={styles.affectionValue}>{affectionLevel}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${affectionLevel}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 270,               
    height: height * 0.63,   
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f3f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#adb5bd',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  characterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f3f5',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 5,
    lineHeight: 18,
  },
  label: {
    fontWeight: 'bold',
    color: '#212529',
  },
  affectionContainer: {
    width: '100%',
    marginTop: 12,
  },
  affectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leftLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  affectionHeart: {
    fontSize: 12,
    marginRight: 4,
  },
  affectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  affectionValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff4d4d', 
    borderRadius: 3,
  },
});