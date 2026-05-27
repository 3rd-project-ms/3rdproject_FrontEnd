// 영어 레벨 테스트 화면

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

const questions = [
  'What is your name and where are you from?',
  'Oh, you just arrived? Where did you come from? How long are you planning to stay?',
  'What do you usually do on weekends?',
  'Can you describe your hometown?',
  'What is your favorite movie and why?',
  'Tell me about a memorable experience you had recently.',
];

export default function LevelTestScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'none' | 'voice' | 'keyboard'>(
    'none'
  );
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentProgress = currentQuestionIndex + 1;
  const totalQuestions = questions.length;
  const hasAnswer = answer.trim().length > 0;

  const moveQuestion = (direction: -1 | 1) => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + direction;
      return Math.min(Math.max(nextIndex, 0), totalQuestions - 1);
    });
    setInputMode('none');
    setAnswer('');
    Keyboard.dismiss();
  };

  const handlePressMic = () => {
    if (inputMode === 'voice' && answer.trim().length > 0) {
      setInputMode('none');
      setAnswer('');
      return;
    }

    Keyboard.dismiss();
    setInputMode('voice');
    setAnswer("I'm going to study here for a semester.");
  };

  const handlePressKeyboard = () => {
    if (inputMode === 'keyboard') {
      setInputMode('none');
      setAnswer('');
      Keyboard.dismiss();
      return;
    }

    setInputMode('keyboard');
    setAnswer('');
  };

  const handleRetry = () => {
    setAnswer('');
    setInputMode('none');
    Keyboard.dismiss();
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer.trim(),
    }));
    setAnswer('');
    setInputMode('none');
    Keyboard.dismiss();

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    router.replace('/(auth)/level-test-result');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>레벨 테스트</Text>
          <Text style={styles.headerProgress}>
            {currentProgress}/{totalQuestions}
          </Text>
        </View>

        <View style={styles.progressRow}>
          {questions.map((question, index) => (
            <View
              key={question}
              style={[
                styles.progressSegment,
                index <= currentQuestionIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.questionCard}>
          <Pressable
            onPress={() => moveQuestion(-1)}
            style={styles.questionArrow}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text numberOfLines={3} style={styles.questionText}>
            {questions[currentQuestionIndex]}
          </Text>
          <Pressable
            onPress={() => moveQuestion(1)}
            style={styles.questionArrow}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.characterBox}>
          <Text style={styles.characterText}>캐릭터 이미지</Text>
        </View>

        <View style={styles.answerBox}>
          {inputMode === 'keyboard' ? (
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="키보드로 답변을 작성해주세요."
              placeholderTextColor={COLORS.black}
              multiline
              autoFocus
              style={styles.answerInput}
            />
          ) : (
            <Text style={styles.answerText}>
              {answer || '마이크 혹은 키보드로 답변해주세요.'}
            </Text>
          )}
        </View>

        {hasAnswer && inputMode === 'voice' ? (
          <View style={styles.voiceSubmitRow}>
            <Pressable
              onPress={handlePressMic}
              style={[styles.micButton, styles.activeInputButton]}
            >
              <Ionicons name="mic" size={34} color={COLORS.primary} />
            </Pressable>
            <View style={styles.voiceActionButtons}>
              <Pressable onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>다시하기</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmitAnswer}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>제출하기</Text>
              </Pressable>
            </View>
          </View>
        ) : hasAnswer ? (
          <View style={styles.submitButtonRow}>
            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>다시하기</Text>
            </Pressable>
            <Pressable onPress={handleSubmitAnswer} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>제출하기</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.inputButtonRow}>
            <Pressable
              onPress={handlePressMic}
              style={[
                styles.micButton,
                inputMode === 'voice' && styles.activeInputButton,
              ]}
            >
              <Ionicons
                name="mic"
                size={34}
                color={inputMode === 'voice' ? COLORS.primary : COLORS.gray0}
              />
            </Pressable>
            <Pressable
              onPress={handlePressKeyboard}
              style={[
                styles.keyboardButton,
                inputMode === 'keyboard' && styles.activeInputButton,
              ]}
            >
              <Ionicons
                name="keypad"
                size={26}
                color={inputMode === 'keyboard' ? COLORS.primary : COLORS.gray0}
              />
            </Pressable>
          </View>
        )}
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
    paddingBottom: 28,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 28,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.black,
  },
  headerTitle: {
    marginLeft: 4,
    flex: 1,
    ...TYPOGRAPHY.semibold20,
  },
  headerProgress: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray2,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  questionCard: {
    height: 76,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  questionArrow: {
    width: 44,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.black,
  },
  questionText: {
    flex: 1,
    ...TYPOGRAPHY.semibold14,
    lineHeight: 18,
    textAlign: 'center',
  },
  characterBox: {
    height: 286,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  characterText: {
    ...TYPOGRAPHY.semibold16,
    color: COLORS.gray0,
  },
  answerBox: {
    height: 80,
    marginTop: 8,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  answerText: {
    ...TYPOGRAPHY.semibold14,
    lineHeight: 20,
    textAlign: 'center',
  },
  answerInput: {
    width: '100%',
    minHeight: 56,
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.black,
  },
  inputButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginTop: 16,
  },
  micButton: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 39,
    backgroundColor: COLORS.white,
  },
  keyboardButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 28,
    backgroundColor: COLORS.white,
  },
  activeInputButton: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.subColor3Light,
  },
  submitButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  voiceSubmitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  voiceActionButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  retryButton: {
    flex: 1,
    height: LAYOUT.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: LAYOUT.buttonRadius,
    backgroundColor: COLORS.white,
  },
  submitButton: {
    flex: 1,
    height: LAYOUT.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.buttonRadius,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.gray0,
  },
  submitButtonText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.white,
  },
});
