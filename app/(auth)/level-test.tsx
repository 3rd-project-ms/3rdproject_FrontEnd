// 영어 레벨 테스트 화면

import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useVideoPlayer, VideoView } from "expo-video";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import LevelTestTutorialOverlay, {
  TutorialStep,
} from "../../components/level-test/LevelTestTutorialOverlay";
import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import { ApiError } from "../../services/api";
import {
  AnswerType,
  levelTestService,
  QuestionDto,
} from "../../services/levelTestService";
import { useAuthStore } from "../../store/useAuthStore";

type InputMode = "none" | "recording";

// 문항 로딩 실패 시 화면이 비지 않도록 쓰는 폴백 문항
const FALLBACK_QUESTIONS: QuestionDto[] = [
  "Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?",
  "What is your name and where are you from?",
  "What do you usually do on weekends?",
  "Can you describe your hometown?",
  "What is your favorite movie and why?",
  "Tell me about a memorable experience you had recently.",
].map((text, index) => ({
  questionId: index + 1,
  questionText: text,
  difficultyLevel: "",
  category: "",
}));

const tutorialOrder: TutorialStep[] = [
  "intro",
  "controls",
  "recording",
  "start",
];

const instructorImage = require("../../assets/characters/level_test_instructor.png");

export default function LevelTestScreen() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const [questions, setQuestions] = useState<QuestionDto[]>(FALLBACK_QUESTIONS);
  // 서버에서 실제 문항을 받아왔는지 여부. false면 fallback 문항이므로
  // DB에 없는 questionId로 답변을 제출하지 않는다.
  const [hasServerQuestions, setHasServerQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
  const isRecordingInProgress = useRef(false);

  const player = useVideoPlayer(
    require("../../assets/demo/test_시연영상.mp4"),
    (p) => {
      p.loop = true;
      p.audioMixingMode = "mixWithOthers";
    },
  );

  useEffect(() => {
    if (isQuestionPlaying) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [isQuestionPlaying]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isTutorialVisible, setIsTutorialVisible] = useState(true);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("intro");

  const totalQuestions = questions.length;
  const currentProgress = currentQuestionIndex + 1;

  // 백엔드에서 실제 레벨 테스트 문항을 불러온다. 실패하면 폴백 문항 유지.
  useEffect(() => {
    let active = true;
    levelTestService
      .getQuestions()
      .then((list) => {
        if (active && list.length > 0) {
          setQuestions(list);
          setHasServerQuestions(true);
        }
      })
      .catch(() => {
        // 폴백 문항으로 진행
      });
    return () => {
      active = false;
    };
  }, []);

  // 튜토리얼 종료 시 첫 번째 문항 오디오 재생
  useEffect(() => {
    if (isTutorialVisible) return;
    const playFirstQuestion = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
        const { sound } = await Audio.Sound.createAsync({
          uri: 'https://simspeak-audio-amahc0gkatbdc3fv.a02.azurefd.net/audio-files/leveltestQ1.mp3',
        });
        soundRef.current = sound;
        setIsQuestionPlaying(true);
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) setIsQuestionPlaying(false);
        });
        await sound.playAsync();
      } catch (e) {
        console.warn('오디오 재생 오류:', e);
      }
    };
    playFirstQuestion();
  }, [isTutorialVisible]);

  // 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      soundRef.current?.stopAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  // 답안을 백엔드에 제출하고 다음 문항으로 넘어간다. (제출 후 이전 문항 복귀 불가)
  const submitAndAdvance = async (
    value: string,
    answerType: AnswerType,
    recordingUri?: string,
  ) => {
    const trimmed = value.trim();
    if (isSubmitting) {
      return;
    }

    const question = questions[currentQuestionIndex];
    if (!question) return;
    setIsSubmitting(true);
    let playMockAudioPromise: Promise<void> = Promise.resolve();
    try {
      let effectiveAnswer = trimmed;
      let isFinished = false;
      let finalResult = null;

      // 서버 문항을 받은 경우에만 제출한다. fallback 문항은 DB에 없는
      // questionId라 제출하면 오류가 나므로 로컬 진행만 한다.
      if (userId != null && hasServerQuestions) {
        const mockAudioUrl =
          answerType === "voice"
            ? `https://9aifinalteam4.blob.core.windows.net/audio-files/user_mock_answer_q${currentQuestionIndex + 1}.mp3`
            : undefined;

        playMockAudioPromise = mockAudioUrl
          ? (async () => {
              try {
                await soundRef.current?.unloadAsync();
                const { sound } = await Audio.Sound.createAsync({
                  uri: mockAudioUrl,
                });
                soundRef.current = sound;
                await new Promise<void>((resolve) => {
                  sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) resolve();
                  });
                  sound.playAsync();
                });
                await sound.unloadAsync();
                soundRef.current = null;
              } catch (e) { console.warn('오디오 재생 오류:', e); }
            })()
          : Promise.resolve();

        const playMockAudio = playMockAudioPromise;

        const submitPromise = levelTestService.submitAnswer({
          userId,
          questionId: question.questionId,
          answerText: trimmed,
          answerType,
          currentQuestionIndex,
          accumulatedAnswers: [...Object.values(answers), trimmed].slice(0, 8),
          isQuit: currentQuestionIndex === totalQuestions - 1,
          userAudioUrl: mockAudioUrl,
        });

        const [, res] = await Promise.all([playMockAudio, submitPromise]);
        if (res.user_recognized_text) {
          effectiveAnswer = res.user_recognized_text;
        }
        isFinished = res.is_finished;
        finalResult = res.final_result;

        if (res.next_question_text) {
          const nextIdx = currentQuestionIndex + 1;
          setQuestions((prev) =>
            prev.map((q, i) =>
              i === nextIdx
                ? { ...q, questionText: res.next_question_text! }
                : q,
            ),
          );
        }
        const nextAudioUrl =
          res.next_question_audio_url ??
          (currentQuestionIndex + 1 < totalQuestions
            ? `https://simspeak-audio-amahc0gkatbdc3fv.a02.azurefd.net/audio-files/leveltestQ${currentQuestionIndex + 2}.mp3`
            : null);
        if (nextAudioUrl) {
          try {
            await soundRef.current?.unloadAsync();
            const { sound } = await Audio.Sound.createAsync({
              uri: nextAudioUrl,
            });
            soundRef.current = sound;
            setIsQuestionPlaying(true);
            sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
              if (status.isLoaded && status.didJustFinish)
                setIsQuestionPlaying(false);
            });
            await sound.playAsync();
          } catch (e) { console.warn('오디오 재생 오류:', e); }
        }
      }

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: effectiveAnswer,
      }));
      setAnswer("");
      setInputMode("none");

      if (isFinished) {
        router.replace({
          pathname: "/(auth)/level-test-result",
          params: { finalResult: JSON.stringify(finalResult) },
        });
        return;
      }

      if (currentQuestionIndex >= totalQuestions - 1) {
        router.replace("/(auth)/level-test-result");
        return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
    } catch (error) {
      if (currentQuestionIndex >= totalQuestions - 1) {
        await playMockAudioPromise;
        router.replace("/(auth)/level-test-result");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressMic = async () => {
    if (isRecordingInProgress.current) return;
    isRecordingInProgress.current = true;
    try {
      // 녹음 중이면 정지 → 곧바로 제출 후 다음 문항
      if (inputMode === "recording") {
        let uri: string | null = null;
        if (recording) {
          await recording.stopAndUnloadAsync();
          uri = recording.getURI();
          setRecordingUri(uri);
          setRecording(null);
        }
        setInputMode("none");
        submitAndAdvance("voice_answer", "voice", uri ?? undefined);
        return;
      }

      // 녹음 시작
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (e) { console.warn('오디오 재생 오류:', e); }
        soundRef.current = null;
      }
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) { console.warn('오디오 재생 오류:', e); }
        setRecording(null);
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("알림", "마이크 권한이 필요합니다.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRecording);
      setInputMode("recording");
    } finally {
      isRecordingInProgress.current = false;
    }
  };

  const resetLevelTest = () => {
    setCurrentQuestionIndex(0);
    setInputMode("none");
    setAnswer("");
    setAnswers({});
  };

  const skipTutorial = () => {
    setIsTutorialVisible(false);
    resetLevelTest();
  };

  const goNextTutorialStep = () => {
    if (tutorialStep === "start") {
      setIsTutorialVisible(false);
      resetLevelTest();
      return;
    }

    const currentIndex = tutorialOrder.indexOf(tutorialStep);
    setTutorialStep(
      tutorialOrder[Math.min(currentIndex + 1, tutorialOrder.length - 1)],
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.screen}>
        {isTutorialVisible ? (
          <ContentWrapper>
            <LevelTestContent
              currentProgress={currentProgress}
              totalQuestions={totalQuestions}
              currentQuestion={
                (
                  questions[currentQuestionIndex] ??
                  questions[questions.length - 1]
                ).questionText
              }
              answer={answer}
              inputMode={inputMode}
              onBack={() => router.back()}
              onPressMic={handlePressMic}
              isQuestionPlaying={isQuestionPlaying}
              player={player}
            />
          </ContentWrapper>
        ) : (
          <LevelTestContent
            currentProgress={currentProgress}
            totalQuestions={totalQuestions}
            currentQuestion={
              (
                questions[currentQuestionIndex] ??
                questions[questions.length - 1]
              ).questionText
            }
            answer={answer}
            inputMode={inputMode}
            onBack={() => router.back()}
            onPressMic={handlePressMic}
            isQuestionPlaying={isQuestionPlaying}
            player={player}
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
    </View>
  );
}

function ContentWrapper({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") {
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
  onPressMic,
  isQuestionPlaying,
  player,
}: {
  currentProgress: number;
  totalQuestions: number;
  currentQuestion: string;
  answer: string;
  inputMode: InputMode;
  onBack: () => void;
  onPressMic: () => void;
  isQuestionPlaying: boolean;
  player: ReturnType<typeof useVideoPlayer>;
}) {
  const isRecording = inputMode === "recording";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 8 },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>레벨 테스트</Text>
        <Text style={styles.headerProgress}>
          {currentProgress}/{totalQuestions}
        </Text>
      </View>

      <LevelProgressBar
        total={totalQuestions}
        currentIndex={currentProgress - 1}
      />

      <QuestionCard question={currentQuestion} />

      <View style={styles.characterImageWrapper}>
        <VideoView
          player={player}
          style={styles.characterImage}
          contentFit="cover"
          nativeControls={false}
        />
      </View>

      <AnswerCard answer={answer} isRecording={isRecording} />
      <VoiceInputControls isRecording={isRecording} onPressMic={onPressMic} />
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
        {isRecording ? answer : "마이크로 답변해주세요."}
      </Text>
    </View>
  );
}

function VoiceInputControls({
  isRecording,
  onPressMic,
}: {
  isRecording: boolean;
  onPressMic: () => void;
}) {
  return (
    <View style={styles.inputControlArea}>
      <TouchableOpacity
        onPress={onPressMic}
        style={[styles.micButton, isRecording && styles.recordingMicButton]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isRecording ? "square" : "mic"}
          size={isRecording ? 26 : 34}
          color={isRecording ? "#FF4F73" : COLORS.gray0}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: COLORS.white,
  },
  contentBlur: {
    flex: 1,
  },
  webBlurWrapper: {
    flex: 1,
    filter: "blur(4px)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 30,
    height: 56,
    alignItems: "flex-start",
    justifyContent: "center",
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
    color: "#222222",
  },
  headerProgress: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  progressRow: {
    height: 6,
    flexDirection: "row",
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  progressSegmentActive: {
    backgroundColor: "#FB7185",
  },
  questionCard: {
    height: 106,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  questionText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 22,
    textAlign: "center",
    color: "#000000",
  },
  characterImageWrapper: {
    flex: 1,
    minHeight: 230,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  characterImage: {
    width: "100%",
    height: "100%",
  },
  answerBox: {
    padding: 16,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  answerText: {
    ...TYPOGRAPHY.semibold16,
    lineHeight: 22,
    textAlign: "center",
    color: COLORS.black,
  },
  inputControlArea: {
    height: 124,
    justifyContent: "center",
    position: "relative",
  },
  micButton: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 72,
    height: 72,
    marginLeft: -36,
    marginTop: -36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    backgroundColor: "#EFF1F0",
  },
  recordingMicButton: {
    borderWidth: 2,
    borderColor: "#FF4F73",
    backgroundColor: "#FFE1E6",
  },
});
