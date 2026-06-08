import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import MicButton from "@/components/chat/MicButton";
import PenaltyPopup, {
  PopupType,
  usePenaltyPopup,
} from "@/components/chat/PenaltyPopup";
import { colors } from "@/constants/theme";

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
interface VoiceApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    message_id: string;
    turn_count: number;
    role: string;
    text_content: string;
    user_text?: string;
    action_description: string;
    audio_url: string | null;
    current_affinity: number;
    remaining_penalties: number;
    system_evaluation: {
      grammar_feedback: string;
      is_penalty: boolean;
      penalty_reason:
        | "korean_used"
        | "duplicate_expr"
        | "context_deviation"
        | "abusive_words"
        | null;
      pronunciation_score: {
        accuracy: number;
        fluency: number;
        completeness: number;
        prosody: number;
        word_details: {
          word: string;
          accuracy: number;
          error_type: string | null;
        }[];
      } | null;
    };
  } | null;
}

const PENALTY_REASON_MAP: Record<string, PopupType> = {
  korean_used:       "off_topic",
  duplicate_expr:    "repetitive_phrases",
  context_deviation: "off_topic",
  abusive_words:     "off_topic",
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────
// 🧪 목업 데이터
// ─────────────────────────────────────────
const MOCK_VOICE_RESPONSES: VoiceApiResponse[] = [
  {
    success: true, code: "SUCCESS", message: "",
    data: {
      message_id: "voice_mock_1", turn_count: 1, role: "assistant",
      text_content: "That sounds amazing! Tell me more about your trip.",
      user_text: "I went to Jeju Island last weekend. It was really fun.",
      action_description: "눈을 동그랗게 뜨며 감탄한다.",
      audio_url: null, current_affinity: 45, remaining_penalties: 3,
      system_evaluation: {
        grammar_feedback: "자연스러운 문장이에요!",
        is_penalty: false, penalty_reason: null,
        pronunciation_score: {
          accuracy: 90, fluency: 85, completeness: 95, prosody: 88,
          word_details: [
            { word: "I",    accuracy: 95, error_type: null },
            { word: "went", accuracy: 88, error_type: null },
            { word: "to",   accuracy: 92, error_type: null },
            { word: "Jeju", accuracy: 85, error_type: null },
          ],
        },
      },
    },
  },
  {
    success: true, code: "SUCCESS", message: "",
    data: {
      message_id: "voice_mock_2", turn_count: 2, role: "assistant",
      text_content: "Hmm, try saying that in English next time!",
      user_text: "I drank 물 every day at the beach.",
      action_description: "살짝 눈썹을 올리며 웃는다.",
      audio_url: null, current_affinity: 42, remaining_penalties: 2,
      system_evaluation: {
        grammar_feedback: "'물'은 영어로 'water'입니다.",
        is_penalty: true, penalty_reason: "korean_used",
        pronunciation_score: {
          accuracy: 65, fluency: 60, completeness: 70, prosody: 55,
          word_details: [
            { word: "I",     accuracy: 92, error_type: null },
            { word: "drank", accuracy: 88, error_type: null },
            { word: "물",    accuracy: 10, error_type: "Mispronunciation" },
          ],
        },
      },
    },
  },
];

const MOCK_HINT = {
  english: "I'm feeling a bit under the weather.",
  korean: "나 오늘 몸 컨디션이 좀 별로야",
};

const GIFT_MARKERS = [40, 80] as const;

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatVoiceScreen() {
  const router = useRouter();
  const { character_id, session_id, scenario_id, stage_id, user_id } =
    useLocalSearchParams<{
      character_id: string;
      session_id: string;
      scenario_id: string;
      stage_id: string;
      user_id: string;
    }>();

  // ─── 상태 ───────────────────────────────
  const [affinity, setAffinity] = useState(0);
  const [lives, setLives]       = useState(3);
  const [turnCount, setTurnCount] = useState(1);
  const [micState, setMicState] = useState<"idle" | "recording" | "disabled">("idle");

  const [currentAiText, setCurrentAiText]     = useState("");
  const [currentUserText, setCurrentUserText] = useState("");

  const [showHintModal, setShowHintModal] = useState(false);
  const [showEndModal, setShowEndModal]   = useState(false);
  const [mockIndex, setMockIndex]         = useState(0);

  const recordingRef     = useRef<Audio.Recording | null>(null);
  const soundRef         = useRef<Audio.Sound | null>(null);
  const aiCaptionOpacity = useRef(new Animated.Value(0)).current;
  const userTextOpacity  = useRef(new Animated.Value(0)).current;

  const popup = usePenaltyPopup();

  // ─── 권한 요청 ──────────────────────────
  useEffect(() => {
    Audio.requestPermissionsAsync();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  // ─── 텍스트 페이드인 ────────────────────
  const fadeIn = (animVal: Animated.Value) => {
    animVal.setValue(0);
    Animated.timing(animVal, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  // ─── 녹음 시작 ──────────────────────────
  const handlePressIn = async () => {
    try {
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
        recordingRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setMicState("recording");
    } catch (e) {
      console.error("녹음 시작 오류:", e);
      setMicState("idle");
    }
  };

  // ─── 녹음 종료 + 전송 ───────────────────
  const handlePressOut = async () => {
    if (!recordingRef.current) return;
    setMicState("disabled");
    const rec = recordingRef.current;
    recordingRef.current = null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) { setMicState("idle"); return; }
      await sendVoiceMessage(uri);
    } catch (e) {
      console.error("녹음 종료 오류:", e);
      setMicState("idle");
    }
  };

  // ─── API 전송 ───────────────────────────
  const sendVoiceMessage = async (audioUri: string | null) => {
    try {
      // 🧪 목업
      await new Promise((r) => setTimeout(r, 800));
      const json = MOCK_VOICE_RESPONSES[mockIndex % MOCK_VOICE_RESPONSES.length];
      setMockIndex((prev) => prev + 1);

      // 🔌 실제 연동 시 주석 해제
      // const formData = new FormData();
      // formData.append('audio', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' } as any);
      // ...
      // const json: VoiceApiResponse = await res.json();

      if (!json.success || !json.data) { setMicState("idle"); return; }

      const { data } = json;
      const eval_ = data.system_evaluation;

      if (data.user_text) { setCurrentUserText(data.user_text); fadeIn(userTextOpacity); }
      setCurrentAiText(data.text_content);
      fadeIn(aiCaptionOpacity);

      if (data.audio_url) await playAudio(data.audio_url);

      setAffinity(data.current_affinity);
      setLives(data.remaining_penalties);
      setTurnCount((prev) => prev + 1);

      if (eval_.is_penalty && eval_.penalty_reason) {
        popup.show(PENALTY_REASON_MAP[eval_.penalty_reason] ?? "off_topic", 1);
      } else if (data.current_affinity > affinity) {
        const gain = data.current_affinity - affinity;
        popup.show(gain >= 10 ? "affection_perfect" : "affection_good");
      }
    } catch (e) {
      console.error("API 오류:", e);
    } finally {
      setMicState("idle");
    }
  };

  // ─── TTS 재생 ───────────────────────────
  const playAudio = async (url: string) => {
    try {
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.error("오디오 재생 오류:", e);
    }
  };

  // ─── 종료 후 리포트 이동 ────────────────
  const handleGoReport = () => {
    setShowEndModal(false);
    // ✅ [팀원 요청] params 포함해서 report 이동
    router.push({
      pathname: '/report' as any,
      params: {
        session_id,
        character_name: character_id,
        stage_name:     stage_id,
        continuous_days: '',
        affinity_change: String(affinity),
      },
    });
  };

  // ─────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0B0B12" />
        </TouchableOpacity>
        <Text style={styles.charName}>
          Jamie<Text style={styles.charRole}> · 카페 사장님</Text>
        </Text>
      </View>

      {/* ── 호감도 바 + 선물 마커 ── */}
      <View style={styles.affinitySection}>
        <View style={styles.affinityRow}>
          <Text style={styles.affinityPercent}>{affinity}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
            {GIFT_MARKERS.map((point) => (
              <View key={point} style={[styles.barDivider, { left: `${point}%` }]} />
            ))}
          </View>
        </View>

        <View style={styles.affinityMarkerRow}>
          <View style={styles.affinityMarkerSpacer} />
          <View style={styles.affinityMarkerTrack}>
            {GIFT_MARKERS.map((point) => {
              const unlocked = affinity >= point;
              return (
                <View key={point} style={[styles.affinityMarkerItem, { left: `${point}%` }]}>
                  <Ionicons
                    name={unlocked ? "heart" : "heart-outline"}
                    size={14}
                    color={unlocked ? "#F6A3A6" : "#C8C8C8"}
                  />
                  <Text style={[styles.affinityMarkerLabel, { color: unlocked ? "#F6A3A6" : "#C8C8C8" }]}>
                    {point}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* ── 캐릭터 영역 ── */}
      <View style={styles.characterArea}>
        <View style={styles.characterImagePlaceholder} />
      </View>

      {/* ── 텍스트 영역 ── */}
      <View style={styles.textDisplayArea}>
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeAi}>
            <Text style={styles.speakerBadgeTextAi}>Jamie</Text>
          </View>
          <Animated.Text style={[styles.speechTextAi, { opacity: aiCaptionOpacity }]} numberOfLines={2}>
            {currentAiText || "—"}
          </Animated.Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeUser}>
            <Text style={styles.speakerBadgeTextUser}>나</Text>
          </View>
          <Animated.Text style={[styles.speechTextUser, { opacity: userTextOpacity }]} numberOfLines={2}>
            {currentUserText || "누르고 말해보세요"}
          </Animated.Text>
        </View>
      </View>

      {/* ── 하단 컨트롤 ── */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.subButton} onPress={() => setShowHintModal(true)}>
          <View style={styles.iconCircleSub}>
            <Ionicons name="bulb-outline" size={22} color="#888" />
          </View>
          <Text style={styles.buttonLabel}>힌트</Text>
        </TouchableOpacity>

        <MicButton state={micState} onPressIn={handlePressIn} onPressOut={handlePressOut} size={54} />

        <TouchableOpacity style={styles.subButton} onPress={() => setShowEndModal(true)}>
          <View style={[styles.iconCircleSub, { backgroundColor: "#FFE0E0" }]}>
            <MaterialCommunityIcons name="phone-hangup" size={22} color="#F6A3A6" />
          </View>
          <Text style={styles.buttonLabel}>통화종료</Text>
        </TouchableOpacity>
      </View>

      {/* ── 힌트 팝업 ── */}
      {showHintModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowHintModal(false)} activeOpacity={1} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="bulb" size={20} color="#F6A3A6" />
              <Text style={styles.modalTitleText}>힌트</Text>
            </View>
            <Text style={styles.hintEnglish}>{MOCK_HINT.english}</Text>
            <Text style={styles.hintKorean}>{MOCK_HINT.korean}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowHintModal(false)}>
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ✅ 통화 종료 모달 — params 포함 */}
      {showEndModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowEndModal(false)} activeOpacity={1} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleText}>통화를 종료하시겠어요?</Text>
            <Text style={styles.modalSubText}>지금까지의 대화가 결과로 저장됩니다.</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowEndModal(false)}>
                <Text style={styles.modalCancelButtonText}>계속하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleGoReport}>
                <Text style={styles.modalConfirmButtonText}>종료하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── PenaltyPopup ── */}
      <PenaltyPopup
        visible={popup.visible}
        popupType={popup.currentType}
        penaltyPoints={popup.penaltyPoints}
        onClose={popup.hide}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 10,
  },
  backBtn:  { padding: 4, marginRight: 8 },
  charName: { flex: 1, fontSize: 22, fontWeight: "700", color: "#0B0B12" },
  charRole: { fontSize: 18, fontWeight: "400", color: "#888888" },

  affinitySection:    { paddingHorizontal: 16, marginBottom: 4 },
  affinityRow:        { flexDirection: "row", alignItems: "center" },
  affinityPercent:    { fontSize: 13, fontWeight: "600", color: "#888888", width: 36, marginRight: 8 },
  progressBarBg:      { flex: 1, height: 8, backgroundColor: "#F0F0F0", borderRadius: 4, position: "relative", overflow: "hidden" },
  progressBarFill:    { height: "100%", backgroundColor: "#F6A3A6", borderRadius: 4 },
  barDivider:         { position: "absolute", top: 0, bottom: 0, width: 1.5, backgroundColor: "rgba(255,255,255,0.7)" },
  affinityMarkerRow:  { flexDirection: "row", marginTop: 6 },
  affinityMarkerSpacer: { width: 44 },
  affinityMarkerTrack:  { flex: 1, position: "relative", height: 28 },
  affinityMarkerItem:   { position: "absolute", alignItems: "center", gap: 1, transform: [{ translateX: -10 }] },
  affinityMarkerLabel:  { fontSize: 10, fontWeight: "600" },

  characterArea:            { flex: 1, marginHorizontal: 16, marginVertical: 8 },
  characterImagePlaceholder:{ flex: 1, borderRadius: 20, backgroundColor: "#F9F9F9" },

  textDisplayArea: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#F8F8F8", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "#EFEFEF", gap: 8,
  },
  speechRow:           { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  speakerBadgeAi:      { backgroundColor: "#F6A3A6", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextAi:  { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  speechTextAi:        { flex: 1, fontSize: 14, color: "#1C1C1E", lineHeight: 20, fontWeight: "500" },
  speakerBadgeUser:    { backgroundColor: "#EFEFEF", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextUser:{ fontSize: 11, fontWeight: "700", color: "#888888" },
  speechTextUser:      { flex: 1, fontSize: 14, color: "#555555", lineHeight: 20 },
  divider:             { height: 1, backgroundColor: "#EBEBEB", marginVertical: 2 },

  controlBar:    { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", paddingBottom: 36, paddingHorizontal: 20 },
  subButton:     { alignItems: "center", width: 72 },
  iconCircleSub: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  buttonLabel:   { fontSize: 12, color: "#888", fontWeight: "500" },

  // ── 공용 모달 ──
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
    justifyContent: "center", alignItems: "center",
    zIndex: 999, paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%", backgroundColor: "#FFFFFF", borderRadius: 20,
    padding: 28, alignItems: "center", gap: 14,
    elevation: 8, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  modalHeader:            { flexDirection: "row", alignItems: "center", gap: 8 },
  modalTitleText:         { fontSize: 17, fontWeight: "700", color: "#0B0B12", textAlign: "center" },
  modalSubText:           { fontSize: 14, color: "#888888", textAlign: "center" },
  hintEnglish:            { fontSize: 15, color: "#E87C7C", fontWeight: "600", textAlign: "center" },
  hintKorean:             { fontSize: 13, color: "#888888", textAlign: "center" },
  modalCloseButton:       { width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: "#F6A3A6", alignItems: "center", marginTop: 4 },
  modalCloseButtonText:   { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  modalButtonRow:         { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  modalCancelButton:      { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#F0F0F0", alignItems: "center" },
  modalCancelButtonText:  { fontSize: 15, fontWeight: "600", color: "#555555" },
  modalConfirmButton:     { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#F6A3A6", alignItems: "center" },
  modalConfirmButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});