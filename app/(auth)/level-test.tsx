// 영어 레벨 테스트 화면

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ReactNode } from 'react';
import LevelTestTutorialOverlay, {
  TutorialStep,
} from '../../components/level-test/LevelTestTutorialOverlay';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

type InputMode = 'none' | 'recording' | 'keyboard';

const questions = [
  'Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?',
  'What is your name and where are you from?',
  'What do you usually do on weekends?',
  'Can you describe your hometown?',
  'What is your favorite movie and why?',
  'Tell me about a memorable experience you had recently.',
];

const tutorialOrder: TutorialStep[] = [
  'intro',
  'controls',
  'recording',
  'result',
  'start',
];

const mockVoiceAnswer = "I'm going to study here for a semester.";
const surferImage = require('../../assets/images/level-test-surfer.png');

export default function LevelTestScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('none');
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isTutorialVisible, setIsTutorialVisible] = useState(true);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>('intro');

  const totalQuestions = questions.length;
  const currentProgress = currentQuestionIndex + 1;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const nextButtonLabel = isLastQuestion ? '제출하기' : '다음으로 넘어가기';

  const moveQuestion = (direction: -1 | 1) => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + direction;
      return Math.min(Math.max(nextIndex, 0), totalQuestions - 1);
    });
    setInputMode('none');
    setAnswer('');
    Keyboard.dismiss();
  };

  const handleStartRecording = () => {
    Keyboard.dismiss();
    setAnswer('');
    setInputMode('recording');
  };

  const handleStopRecording = () => {
    setInputMode('none');
    setAnswer(mockVoiceAnswer);
  };

  const handlePressMic = () => {
    if (inputMode === 'recording') {
      handleStopRecording();
      return;
    }

    handleStartRecording();
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

  const handleRetryRecording = () => {
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

  const resetLevelTest = () => {
    setCurrentQuestionIndex(0);
    setInputMode('none');
    setAnswer('');
    setAnswers({});
    Keyboard.dismiss();
  };

  const skipTutorial = () => {
    setIsTutorialVisible(false);
    resetLevelTest();
  };

  const goNextTutorialStep = () => {
    const currentIndex = tutorialOrder.indexOf(tutorialStep);
    const nextStep =
      tutorialOrder[Math.min(currentIndex + 1, tutorialOrder.length - 1)];

    if (tutorialStep === 'controls') {
      setInputMode('recording');
      setAnswer('');
    }

    if (tutorialStep === 'recording') {
      setInputMode('none');
      setAnswer(mockVoiceAnswer);
    }

    if (tutorialStep === 'start') {
      setIsTutorialVisible(false);
      resetLevelTest();
      return;
    }

    setTutorialStep(nextStep);
  };

  const displayedInputMode =
    isTutorialVisible && tutorialStep === 'recording' ? 'recording' : inputMode;
  const displayedAnswer =
    isTutorialVisible && tutorialStep === 'result' ? mockVoiceAnswer : answer;
  const shouldShowActions =
    displayedAnswer.trim().length > 0 &&
    displayedInputMode !== 'keyboard' &&
    displayedInputMode !== 'recording';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {isTutorialVisible ? (
          <ContentWrapper>
            <LevelTestContent
              currentProgress={currentProgress}
              totalQuestions={totalQuestions}
              currentQuestion={questions[currentQuestionIndex]}
              answer={displayedAnswer}
              inputMode={displayedInputMode}
              shouldShowActions={shouldShowActions}
              nextButtonLabel={nextButtonLabel}
              onBack={() => router.back()}
              onPrevious={() => moveQuestion(-1)}
              onNext={() => moveQuestion(1)}
              onChangeAnswer={setAnswer}
              onPressMic={handlePressMic}
              onPressKeyboard={handlePressKeyboard}
              onRetry={handleRetryRecording}
              onSubmit={handleSubmitAnswer}
            />
          </ContentWrapper>
        ) : (
          <LevelTestContent
            currentProgress={currentProgress}
            totalQuestions={totalQuestions}
            currentQuestion={questions[currentQuestionIndex]}
            answer={displayedAnswer}
            inputMode={displayedInputMode}
            shouldShowActions={shouldShowActions}
            nextButtonLabel={nextButtonLabel}
            onBack={() => router.back()}
            onPrevious={() => moveQuestion(-1)}
            onNext={() => moveQuestion(1)}
            onChangeAnswer={setAnswer}
            onPressMic={handlePressMic}
            onPressKeyboard={handlePressKeyboard}
            onRetry={handleRetryRecording}
            onSubmit={handleSubmitAnswer}
          />
        )}

        {isTutorialVisible && (
          <LevelTestTutorialOverlay
            step={tutorialStep}
            onNext={goNextTutorialStep}
            onSkip={skipTutorial}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ContentWrapper({ children }: { children: ReactNode }) {
  if (Platform.OS === 'web') {
    return <View style={styles.webBlurWrapper}>{children}</View>;
  }

  return (
    <BlurView intensity={50} tint="dark" style={styles.contentBlur}>
      {children}
    </BlurView>
  );
}

function LevelTestContent({
  currentProgress,
  totalQuestions,
  currentQuestion,
  answer,
  inputMode,
  shouldShowActions,
  nextButtonLabel,
  onBack,
  onPrevious,
  onNext,
  onChangeAnswer,
  onPressMic,
  onPressKeyboard,
  onRetry,
  onSubmit,
}: {
  currentProgress: number;
  totalQuestions: number;
  currentQuestion: string;
  answer: string;
  inputMode: InputMode;
  shouldShowActions: boolean;
  nextButtonLabel: string;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onChangeAnswer: (text: string) => void;
  onPressMic: () => void;
  onPressKeyboard: () => void;
  onRetry: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>레벨 테스트</Text>
        <Text style={styles.headerProgress}>
          {currentProgress}/{totalQuestions}
        </Text>
      </View>

      <LevelProgressBar total={totalQuestions} currentIndex={currentProgress - 1} />

      <QuestionCard
        question={currentQuestion}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <Image
        source={surferImage}
        resizeMode="cover"
        style={styles.characterImage}
      />

      <AnswerCard
        answer={answer}
        inputMode={inputMode}
        onChangeAnswer={onChangeAnswer}
      />

      {shouldShowActions ? (
        <AnswerActionRow
          nextButtonLabel={nextButtonLabel}
          onRetry={onRetry}
          onSubmit={onSubmit}
        />
      ) : (
        <VoiceInputControls
          inputMode={inputMode}
          onPressMic={onPressMic}
          onPressKeyboard={onPressKeyboard}
        />
      )}
    </View>
  );
}

function LevelProgressBar({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressSegment,
            index <= currentIndex && styles.progressSegmentActive,
          ]}
        />
      ))}
    </View>
  );
}

function QuestionCard({
  question,
  onPrevious,
  onNext,
}: {
  question: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.questionCard}>
      <Pressable onPress={onPrevious} style={styles.questionArrow}>
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <View style={styles.questionContent}>
        <Text numberOfLines={3} style={styles.questionText}>
          {question}
        </Text>
        <Ionicons name="volume-medium" size={22} color={COLORS.gray0} />
      </View>
      <Pressable onPress={onNext} style={styles.questionArrow}>
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

function AnswerCard({
  answer,
  inputMode,
  onChangeAnswer,
}: {
  answer: string;
  inputMode: InputMode;
  onChangeAnswer: (text: string) => void;
}) {
  const isKeyboardMode = inputMode === 'keyboard';

  return (
    <View style={styles.answerBox}>
      {isKeyboardMode ? (
        <TextInput
          value={answer}
          onChangeText={onChangeAnswer}
          placeholder="키보드로 답변을 작성해주세요."
          placeholderTextColor={COLORS.gray0}
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
  );
}

function VoiceInputControls({
  inputMode,
  onPressMic,
  onPressKeyboard,
}: {
  inputMode: InputMode;
  onPressMic: () => void;
  onPressKeyboard: () => void;
}) {
  const isRecording = inputMode === 'recording';
  const isKeyboardMode = inputMode === 'keyboard';

  return (
    <View style={styles.inputControlArea}>
      <Pressable
        onPress={onPressMic}
        style={[styles.micButton, isRecording && styles.recordingMicButton]}
      >
        <Ionicons
          name={isRecording ? 'square' : 'mic'}
          size={isRecording ? 34 : 48}
          color={isRecording ? '#FF4F73' : COLORS.gray0}
        />
      </Pressable>

      <Pressable
        onPress={onPressKeyboard}
        style={[
          styles.keyboardButton,
          isKeyboardMode && styles.activeKeyboardButton,
        ]}
      >
        <Ionicons
          name="keypad"
          size={36}
          color={isKeyboardMode ? COLORS.primary : COLORS.gray0}
        />
      </Pressable>
    </View>
  );
}

function AnswerActionRow({
  nextButtonLabel,
  onRetry,
  onSubmit,
}: {
  nextButtonLabel: string;
  onRetry: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.answerActionArea}>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>다시하기</Text>
      </Pressable>
      <Pressable onPress={onSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>{nextButtonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  contentBlur: {
    flex: 1,
  },
  webBlurWrapper: {
    flex: 1,
    filter: 'blur(4px)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 30,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 34,
    lineHeight: 38,
    color: COLORS.black,
  },
  headerTitle: {
    marginLeft: 2,
    flex: 1,
    ...TYPOGRAPHY.semibold20,
    color: '#222222',
  },
  headerProgress: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  progressRow: {
    height: 6,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8C8C8',
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  questionCard: {
    height: 100,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  questionArrow: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 32,
    lineHeight: 34,
    color: COLORS.black,
  },
  questionContent: {
    flex: 1,
    height: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 20,
    textAlign: 'center',
    color: '#000000',
  },
  characterImage: {
    width: '100%',
    flex: 1,
    minHeight: 230,
    maxHeight: 360,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  answerBox: {
    height: 102,
    marginTop: 10,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  answerText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORS.black,
  },
  answerInput: {
    width: '100%',
    minHeight: 74,
    ...TYPOGRAPHY.semibold16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.black,
  },
  inputControlArea: {
    height: 124,
    justifyContent: 'center',
    position: 'relative',
  },
  micButton: {
    position: 'absolute',
    left: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 50,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  recordingMicButton: {
    borderWidth: 2,
    borderColor: '#FF4F73',
    backgroundColor: '#FFE1E6',
  },
  keyboardButton: {
    position: 'absolute',
    right: 28,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  activeKeyboardButton: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.subColor3Light,
  },
  answerActionArea: {
    height: 124,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    height: LAYOUT.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
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
    color: '#888888',
  },
  submitButtonText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.white,
  },
});
