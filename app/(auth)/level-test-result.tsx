// 영어 레벨 테스트 결과 화면

import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

const radarLabels = ['유창성', '표현력', '문법 정확도', '과제 수행도', '어휘력'];

export default function LevelTestResultScreen() {
  const router = useRouter();

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
          <View style={styles.radarMock}>
            <View style={styles.radarOuter} />
            <View style={styles.radarMiddle} />
            <View style={styles.radarInner} />
            <Text style={styles.chartCenterText}>레이더 차트 영역</Text>
          </View>
          <View style={styles.labelWrap}>
            {radarLabels.map((label) => (
              <View key={label} style={styles.labelChip}>
                <Text style={styles.labelText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.detailText}>자세히 보기</Text>

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
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  radarMock: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 90,
  },
  radarMiddle: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 64,
  },
  radarInner: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 38,
    backgroundColor: COLORS.subColor3Light,
  },
  chartCenterText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.gray0,
  },
  labelWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  labelText: {
    ...TYPOGRAPHY.regular10,
    color: COLORS.gray0,
  },
  detailText: {
    marginTop: 18,
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  buttonSection: {
    marginTop: 'auto',
  },
  continueButton: {
    marginTop: 12,
  },
});
