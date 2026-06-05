// 영어 레벨 테스트 결과 화면

import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Button from '../../components/common/Button';
import RadarChart from '../../components/level-test/RadarChart';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

const MOCK_RADAR_DATA = {
  fluency: 0.7,
  expression: 0.85,
  grammar: 0.6,
  task: 0.5,
  vocabulary: 0.75,
};

export default function LevelTestResultScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // 차트 실제 폭 = size + 64(라벨 여백). 화면/카드 안쪽 폭에 맞춰 자동 조절.
  // 160 = 화면패딩(24*2) + 카드패딩(24*2) + 라벨여백(32*2)
  const chartSize = Math.max(180, Math.min(260, width - 160));

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
          <Text style={styles.levelText}>B2 중상급</Text>
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
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 72,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
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
