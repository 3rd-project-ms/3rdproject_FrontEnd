// 회원가입 이후 영어 레벨 선택 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { EnglishLevel, useAuthStore } from '../../store/useAuthStore';

const levelCards: {
  level: EnglishLevel;
  title: string;
  description: string;
}[] = [
  { level: 'A1', title: '입문', description: '영어가 처음이에요' },
  { level: 'A2', title: '초급', description: '기초 표현을 알아요' },
  { level: 'B1', title: '중급', description: '짧은 대화가 가능해요' },
  { level: 'B2', title: '중상급', description: '자연스러운 편이에요' },
  { level: 'C1', title: '고급', description: '격식 표현도 OK' },
  { level: 'C2', title: '최고급', description: '원어민 수준이에요' },
];

export default function LevelSelectScreen() {
  const router = useRouter();
  const nickname = useAuthStore((state) => state.nickname);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | null>(null);

  const hasSelectedLevel = selectedLevel !== null;
  const displayName = nickname || 'OO';

  const saveLevel = () => {
    if (!selectedLevel) {
      return;
    }

    setAuth({ selectedEnglishLevel: selectedLevel });
  };

  const handleSelectOnly = () => {
    saveLevel();
    router.replace('/(main)/home');
  };

  const handleStartLevelTest = () => {
    saveLevel();
    router.push('/(auth)/tutorial');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>환영합니다,{'\n'}{displayName}님!</Text>
          <Text style={styles.questionText}>나의 영어레벨은?</Text>
          <Text style={styles.helperText}>나중에 변경 가능합니다</Text>
        </View>

        <View style={styles.grid}>
          {levelCards.map((card) => {
            const isSelected = selectedLevel === card.level;

            return (
              <Pressable
                key={card.level}
                onPress={() => setSelectedLevel(card.level)}
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
            title="선택하기"
            variant="secondary"
            disabled={!hasSelectedLevel}
            onPress={handleSelectOnly}
          />
          <Button
            title="레벨 테스트하기"
            disabled={!hasSelectedLevel}
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
  welcomeText: {
    ...TYPOGRAPHY.semibold36,
    lineHeight: 44,
  },
  questionText: {
    marginTop: 26,
    ...TYPOGRAPHY.semibold16,
  },
  helperText: {
    marginTop: 4,
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
  levelTestButton: {
    marginTop: 12,
  },
});
