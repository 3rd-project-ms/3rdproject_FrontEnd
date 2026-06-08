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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import LevelTestTutorialOverlay, {
  TutorialStep,
} from '../../components/level-test/LevelTestTutorialOverlay';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

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
  'keyboard',
  'start',
];

const mockVoiceAnswer = "I'm going to study here for a semester.";
const instructorImage = require('../../assets/characters/level_test_instructor.png');

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

  // 답안을 저장하고 곧바로 다음 문항으로 넘어간다. (제출 후 이전 문항 복귀 불가)
  const submitAndAdvance = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: trimmed }));
    setAnswer('');
    setInputMode('none');
    Keyboard.dismiss();

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    router.replace('/(auth)/level-test-result');
  };

  const handlePressMic = () => {
    // 녹음 중이면 정지 → 곧바로 제출 후 다음 문항
    if (inputMode === 'recording') {
      submitAndAdvance(answer);
      return;
    }

    // 녹음 시작 → STT 결과(목업)를 결과 카드에 표시
    Keyboard.dismiss();
    setInputMode('recording');
    setAnswer(mockVoiceAnswer);
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

  const handleSendKeyboard = () => {
    submitAndAdvance(answer);
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
    if (tutorialStep === 'start') {
      setIsTutorialVisible(false);
      resetLevelTest();
      return;
    }

    const currentIndex = tutorialOrder.indexOf(tutorialStep);
    setTutorialStep(
      tutorialOrder[Math.min(currentIndex + 1, tutorialOrder.length - 1)]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {isTutorialVisible ? (
          <ContentWrapper>
            <LevelTestContent
              currentProgress={currentProgress}
              totalQuestions={totalQuestions}
              currentQuestion={questions[currentQuestionIndex]}
              answer={answer}
              inputMode={inputMode}
              onBack={() => router.back()}
              onChangeAnswer={setAnswer}
              onPressMic={handlePressMic}
              onPressKeyboard={handlePressKeyboard}
              onSendKeyboard={handleSendKeyboard}
            />
          </ContentWrapper>
        ) : (
          <LevelTestContent
            currentProgress={currentProgress}
            totalQuestions={totalQuestions}
            currentQuestion={questions[currentQuestionIndex]}
            answer={answer}
            inputMode={inputMode}
            onBack={() => router.back()}
            onChangeAnswer={setAnswer}
            onPressMic={handlePressMic}
            onPressKeyboard={handlePressKeyboard}
            onSendKeyboard={handleSendKeyboard}
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
  onBack,
  onChangeAnswer,
  onPressMic,
  onPressKeyboard,
  onSendKeyboard,
}: {
  currentProgress: number;
  totalQuestions: number;
  currentQuestion: string;
  answer: string;
  inputMode: InputMode;
  onBack: () => void;
  onChangeAnswer: (text: string) => void;
  onPressMic: () => void;
  onPressKeyboard: () => void;
  onSendKeyboard: () => void;
}) {
  const isKeyboardMode = inputMode === 'keyboard';
  const isRecording = inputMode === 'recording';

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

      <QuestionCard question={currentQuestion} />

      <View style={styles.characterImageWrapper}>
        <Image
          source={instructorImage}
          resizeMode="cover"
          style={styles.characterImage}
        />
      </View>

      {isKeyboardMode ? (
        <KeyboardInputRow
          value={answer}
          onChangeAnswer={onChangeAnswer}
          onSend={onSendKeyboard}
        />
      ) : (
        <>
          <AnswerCard answer={answer} isRecording={isRecording} />
          <VoiceInputControls
            isRecording={isRecording}
            onPressMic={onPressMic}
            onPressKeyboard={onPressKeyboard}
          />
        </>
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

function QuestionCard({ question }: { question: string }) {
  return (
    <View style={[styles.questionCard, styles.cardShadow]}>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}

function AnswerCard({
  answer,
  isRecording,
}: {
  answer: string;
  isRecording: boolean;
}) {
  // 녹음 중/후: STT 결과 텍스트 카드 (재생 기능 없음)
  return (
    <View style={[styles.answerBox, styles.cardShadow]}>
      <Text style={styles.answerText}>
        {isRecording ? answer : '마이크 혹은 키보드로 답변해주세요.'}
      </Text>
    </View>
  );
}

function VoiceInputControls({
  isRecording,
  onPressMic,
  onPressKeyboard,
}: {
  isRecording: boolean;
  onPressMic: () => void;
  onPressKeyboard: () => void;
}) {
  return (
    <View style={styles.inputControlArea}>
      <Pressable
        onPress={onPressMic}
        style={[styles.micButton, isRecording && styles.recordingMicButton]}
      >
        <Ionicons
          name={isRecording ? 'square' : 'mic'}
          size={isRecording ? 26 : 34}
          color={isRecording ? '#FF4F73' : COLORS.gray0}
        />
      </Pressable>

      <Pressable onPress={onPressKeyboard} style={styles.keyboardButton}>
        <Ionicons name="keypad" size={24} color={COLORS.gray0} />
      </Pressable>
    </View>
  );
}

function KeyboardInputRow({
  value,
  onChangeAnswer,
  onSend,
}: {
  value: string;
  onChangeAnswer: (text: string) => void;
  onSend: () => void;
}) {
  return (
    <View style={styles.keyboardInputRow}>
      <TextInput
        value={value}
        onChangeText={onChangeAnswer}
        placeholder="메세지를 입력하세요 ..."
        placeholderTextColor={COLORS.gray0}
        autoFocus
        returnKeyType="send"
        onSubmitEditing={onSend}
        style={styles.keyboardTextInput}
      />
      <Pressable onPress={onSend} style={styles.sendButton}>
        <Ionicons name="arrow-up" size={24} color={COLORS.white} />
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
    gap: 12,
    backgroundColor: COLORS.background,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#FB7185',
  },
  questionCard: {
    height: 106,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  questionText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#000000',
  },
  characterImageWrapper: {
    flex: 1,
    minHeight: 230,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  answerBox: {
    padding: 16,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  answerText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 22,
    textAlign: 'center',
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
    top: '50%',
    width: 72,
    height: 72,
    marginLeft: -36,
    marginTop: -36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#EFF1F0',
  },
  recordingMicButton: {
    borderWidth: 2,
    borderColor: '#FF4F73',
    backgroundColor: '#FFE1E6',
  },
  keyboardButton: {
    position: 'absolute',
    right: 28,
    top: '50%',
    width: 48,
    height: 48,
    marginTop: -24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: COLORS.white,
  },
  keyboardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  keyboardTextInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 18,
    ...TYPOGRAPHY.regular14,
    color: COLORS.black,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
});
