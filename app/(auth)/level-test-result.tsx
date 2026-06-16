// 영어 레벨 테스트 결과 화면

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import RadarChart from '../../components/level-test/RadarChart';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { CefrLevel, levelTestService } from '../../services/levelTestService';
import { EnglishLevel, useAuthStore } from '../../store/useAuthStore';

const MOCK_RADAR_DATA = {
  fluency: 0.7,
  expression: 0.85,
  grammar: 0.6,
  task: 0.5,
  vocabulary: 0.75,
};

// CEFR 등급 → 화면 표기 라벨
const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: '입문',
  A2: '초급',
  B1: '중급',
  B2: '중상급',
  C1: '고급',
  C2: '최고급',
};

export default function LevelTestResultScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const userId = useAuthStore((state) => state.userId);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 차트 실제 폭 = size + 64(라벨 여백). 화면/카드 안쪽 폭에 맞춰 자동 조절.
  // 160 = 화면패딩(24*2) + 카드패딩(24*2) + 라벨여백(32*2)
  const chartSize = Math.max(180, Math.min(260, width - 160));

  // 답변 제출 후 백엔드가 판정한 레벨을 status로 조회한다.
  useEffect(() => {
    if (userId == null) {
      setIsLoading(false);
      return;
    }

    let active = true;
    levelTestService
      .getStatus(userId)
      .then((res) => {
        if (!active) return;
        setLevel(res.currentLevel);
        setAuth({ selectedEnglishLevel: res.currentLevel as EnglishLevel });
      })
      .catch(() => {
        // 조회 실패 시 레벨 미표시
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, setAuth]);

  const levelText = isLoading
    ? '판정 중...'
    : level
      ? `${level} ${LEVEL_LABELS[level]}`
      : '레벨 정보 없음';

  const handleRetryTest = () => {
    router.replace('/(auth)/level-test');
  };

  const handleContinue = () => {
    router.replace('/(main)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.resultHeader}>
          <Text style={styles.titleText}>나의 영어레벨은?</Text>
          <Text style={styles.levelText}>{levelText}</Text>
          <Text style={styles.helperText}>*영어레벨은 추후에 변경이 가능해요</Text>
        </View>

        <View style={styles.chartCard}>
          <RadarChart data={MOCK_RADAR_DATA} size={chartSize} />
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="다시하기"
            variant="secondary"
            onPress={handleRetryTest}
          />
          <Button
            title="진행할게요"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 72,
    paddingBottom: 40,
    backgroundColor: COLORS.white,
  },
  resultHeader: {
    alignItems: 'center',
  },
  titleText: {
    ...TYPOGRAPHY.semibold20,
  },
  levelText: {
    marginTop: 22,
    ...TYPOGRAPHY.semibold36,
  },
  helperText: {
    marginTop: 8,
    ...TYPOGRAPHY.regular10,
    color: COLORS.gray0,
  },
  chartCard: {
    marginTop: 34,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  buttonSection: {
    marginTop: 'auto',
  },
  continueButton: {
    marginTop: 12,
  },
});
