// 회원가입 이후 영어 레벨 선택 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { ApiError } from '../../services/api';
import { levelTestService } from '../../services/levelTestService';
import { EnglishLevel, useAuthStore } from '../../store/useAuthStore';

const levelCards: {
  level: EnglishLevel;
  title: string;
  description: string;
}[] = [
  { level: 'A1', title: '입문', description: '영어가 처음이에요' },
  { level: 'A2', title: '초급', description: '기초 표현을 알아요' },
  { level: 'B1', title: '중급', description: '일상 대화 가능해요' },
  { level: 'B2', title: '중상급', description: '자연스러운 편이에요' },
  { level: 'C1', title: '고급', description: '격식 표현도 OK' },
  { level: 'C2', title: '최고급', description: '원어민 수준이에요' },
];

export default function LevelSelectScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const userId = useAuthStore((state) => state.userId);
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSelectedLevel = selectedLevel !== null && !isSubmitting;

  const handleSelectLevel = (level: EnglishLevel) => {
    setSelectedLevel((prev) => (prev === level ? null : level));
  };

  const handleConfirmLevel = async () => {
    if (!selectedLevel || userId == null) {
      if (userId == null) {
        Alert.alert('알림', '로그인 정보가 없습니다. 다시 로그인해주세요.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // 직접 선택한 레벨 저장 (levelTestType='select', 점수 없음)
      await levelTestService.saveResult({
        userId,
        levelTestType: 'select',
        cefrLevelType: selectedLevel,
        testScore: 0,
      });
      setAuth({ selectedEnglishLevel: selectedLevel });
      router.replace('/(main)/home');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : '레벨 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
      Alert.alert('알림', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartLevelTest = () => {
    router.push('/(auth)/level-test?tutorial=1');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>당신의 영어레벨을{'\n'}선택해주세요</Text>
          <Text style={styles.helperText}>영어 레벨은 추후에 변경 가능합니다</Text>
        </View>

        <View style={styles.grid}>
          {levelCards.map((card) => {
            const isSelected = selectedLevel === card.level;

            return (
              <Pressable
                key={card.level}
                onPress={() => handleSelectLevel(card.level)}
                style={[
                  styles.levelCard,
                  isSelected && styles.selectedLevelCard,
                ]}
              >
                <Text style={styles.levelText}>{card.level}</Text>
                <Text style={styles.levelTitle}>{card.title}</Text>
                <Text style={styles.levelDescription}>{card.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.buttonSection}>
          <Button
            title={isSubmitting ? '저장 중...' : '선택하기'}
            variant="secondary"
            disabled={!hasSelectedLevel}
            onPress={handleConfirmLevel}
          />
          <Text style={styles.levelTestGuideText}>
            레벨 테스트를 통해서 정확한 레벨을 확인할 수 있습니다.
          </Text>
          <Button
            title="레벨 테스트하기"
            onPress={handleStartLevelTest}
            style={styles.levelTestButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 56,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
  },
  titleSection: {
    marginBottom: 18,
  },
  titleText: {
    ...TYPOGRAPHY.semibold36,
    lineHeight: 44,
  },
  helperText: {
    marginTop: 14,
    ...TYPOGRAPHY.regular10,
    color: COLORS.gray0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: '47.9%',
    minHeight: 86,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  selectedLevelCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  levelText: {
    ...TYPOGRAPHY.semibold16,
  },
  levelTitle: {
    marginTop: 8,
    ...TYPOGRAPHY.semibold12,
  },
  levelDescription: {
    marginTop: 4,
    ...TYPOGRAPHY.regular10,
    color: COLORS.gray0,
  },
  buttonSection: {
    marginTop: 20,
  },
  levelTestGuideText: {
    marginTop: 20,
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
    textAlign: 'center',
  },
  levelTestButton: {
    marginTop: 20,
  },
});
