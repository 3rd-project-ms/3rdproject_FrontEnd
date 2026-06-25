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
import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import { levelTestService } from "../../services/levelTestService";

type InputMode = "none" | "recording";

const FALLBACK_QUESTIONS = [
  'Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?',
  'What is your name and where are you from?',
  'What do you usually do on weekends?',
  'Can you describe your hometown?',
  'What is your favorite movie and why?',
  'Tell me about a memorable experience you had recently.',
  'How do you usually spend your holidays?',
  'What are your future plans or goals?',
].map((text, index) => ({ questionId: index + 1, questionText: text, difficultyLevel: '', category: '' }));

export default function DemoLevelTestScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
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
  const [isTutorialVisible] = useState(false);

  useEffect(() => {
    levelTestService.getQuestions()
      .then((list) => { if (list.length > 0) setQuestions(list); })
      .catch(() => {});
  }, []);

  const totalQuestions = 8;
  const currentProgress = currentQuestionIndex + 1;

  // 화면 진입 시 첫 번째 문항 오디오 재생
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

  const handlePressMic = async () => {
    if (inputMode === 'recording') return;
    setInputMode('recording');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/demo/레벨테스트_여성유저.mp3')
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setInputMode('none');
          setCurrentQuestionIndex(1);
        }
      });
      await sound.playAsync();
    } catch (e) {
      console.warn('유저 음성 재생 오류:', e);
      setInputMode('none');
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.screen}>
        <LevelTestContent
          currentProgress={currentProgress}
          totalQuestions={8}
          currentQuestion={questions[currentQuestionIndex].questionText}
          answer={answer}
          inputMode={inputMode}
          onBack={() => router.back()}
          onPressMic={handlePressMic}
          isQuestionPlaying={isQuestionPlaying}
          player={player}
        />
      </View>
    </View>
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
