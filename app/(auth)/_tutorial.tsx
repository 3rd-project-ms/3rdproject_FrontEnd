// 레벨 테스트 진행 방법 튜토리얼 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

const tutorialSteps = [
  '문제를 읽고 답변하는 방법 안내',
  '마이크 버튼 사용 방법',
  '키보드 버튼 사용 방법',
  '질문 넘기기 방법',
  '답변 작성 위치 안내',
  '테스트 진행 흐름 안내',
  '준비 완료 안내',
];

export default function TutorialScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const lastStepIndex = tutorialSteps.length - 1;

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleNext = () => {
    if (currentStep >= lastStepIndex) {
      setShowCompleteModal(true);
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (nextStep === lastStepIndex) {
      setShowCompleteModal(true);
    }
  };

  const handleStartLevelTest = () => {
    setShowCompleteModal(false);
    router.replace('/(auth)/level-test');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        title="튜토리얼"
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => setShowCompleteModal(true)}>
            <Text style={styles.skipText}>튜토리얼 건너뛰기</Text>
          </Pressable>
        }
      />
      <View style={styles.container}>
        <View style={styles.tutorialPanel}>
          <View style={styles.progressRow}>
            {tutorialSteps.map((step, index) => (
              <View
                key={step}
                style={[
                  styles.progressSegment,
                  index <= currentStep && styles.activeProgressSegment,
                ]}
              />
            ))}
          </View>

          <View style={styles.stepTextBox}>
            <Text style={styles.stepText}>{tutorialSteps[currentStep]}</Text>
          </View>

          <View style={styles.touchGuideRow}>
            <Text style={styles.touchGuideText}>왼쪽공간{'\n'}터치시 뒤로가기</Text>
            <Text style={styles.touchGuideText}>오른쪽공간{'\n'}터치시 앞으로 가기</Text>
          </View>

          <View style={styles.touchAreaRow}>
            <Pressable onPress={handlePrevious} style={styles.touchArea} />
            <Pressable onPress={handleNext} style={styles.touchArea} />
          </View>
        </View>
      </View>

      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎉 이제 테스트를 시작해봅시다!!</Text>
            <Button
              title="레벨테스트 진행하기"
              onPress={handleStartLevelTest}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipText: {
    ...TYPOGRAPHY.semibold12,
    color: COLORS.black,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
  },
  tutorialPanel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: COLORS.gray2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray1,
  },
  activeProgressSegment: {
    backgroundColor: COLORS.primary,
  },
  stepTextBox: {
    marginTop: 90,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  stepText: {
    ...TYPOGRAPHY.semibold16,
    textAlign: 'center',
  },
  touchGuideRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  touchGuideText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.black,
  },
  touchAreaRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchArea: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  modalBox: {
    width: '100%',
    padding: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
  },
});
