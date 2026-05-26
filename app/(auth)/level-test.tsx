// 영어 레벨 테스트 화면

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

const questions = [
  'What is your name and where are you from?',
  'Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?',
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

  const currentProgress = currentQuestionIndex + 1;
  const totalQuestions = questions.length;

  const moveQuestion = (direction: -1 | 1) => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + direction;
      return Math.min(Math.max(nextIndex, 0), totalQuestions - 1);
    });
  };

  const handleSelectVoice = () => {
    setInputMode('voice');
    setAnswer("I'm going to study here for a semester.");
  };

  const handleSelectKeyboard = () => {
    setInputMode('keyboard');
    setAnswer('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        title="레벨 테스트"
        onBack={() => router.back()}
        rightElement={
          <Text style={styles.headerProgress}>
            {currentProgress}/{totalQuestions}
          </Text>
        }
      />
      <View style={styles.container}>
        <View style={styles.progressRow}>
          {questions.map((question, index) => (
            <View
              key={question}
              style={[
                styles.progressSegment,
                index <= currentQuestionIndex && styles.activeProgressSegment,
              ]}
            />
          ))}
        </View>

        <View style={styles.questionCard}>
          <Pressable
            onPress={() => moveQuestion(-1)}
            style={styles.questionArrow}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.black} />
          </Pressable>
          <Text style={styles.questionText}>{questions[currentQuestionIndex]}</Text>
          <Pressable
            onPress={() => moveQuestion(1)}
            style={styles.questionArrow}
          >
            <Ionicons name="chevron-forward" size={26} color={COLORS.black} />
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

        <View style={styles.inputButtonRow}>
          <Pressable
            onPress={handleSelectVoice}
            style={[
              styles.inputButton,
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
            onPress={handleSelectKeyboard}
            style={[
              styles.inputButton,
              inputMode === 'keyboard' && styles.activeInputButton,
            ]}
          >
            <Ionicons
              name="keypad"
              size={30}
              color={inputMode === 'keyboard' ? COLORS.primary : COLORS.gray0}
            />
          </Pressable>
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
  headerProgress: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingBottom: 34,
    backgroundColor: COLORS.background,
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
  activeProgressSegment: {
    backgroundColor: COLORS.primary,
  },
  questionCard: {
    minHeight: 76,
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
  questionText: {
    flex: 1,
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
  },
  characterBox: {
    flex: 1,
    minHeight: 220,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 96,
    marginTop: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  answerText: {
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
  },
  answerInput: {
    width: '100%',
    minHeight: 64,
    ...TYPOGRAPHY.semibold14,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.black,
  },
  inputButtonRow: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
  },
  inputButton: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 38,
    backgroundColor: COLORS.white,
  },
  activeInputButton: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
});
