import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Platform, Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import MicButton from "@/components/chat/MicButton";
import MissionDrawer from "@/components/chat/MissionDrawer";
import PenaltyPopup, { PopupType, usePenaltyPopup } from "@/components/chat/PenaltyPopup";
import { chatService } from "@/services/chatService";
import { getStageMissions, evaluateMissions, MissionCounters } from "@/constants/missionData";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

// ─────────────────────────────────────────
// penalty_reason → PopupType 매핑
// ─────────────────────────────────────────
const PENALTY_REASON_MAP: Record<string, PopupType> = {
  korean_used:       "off_topic",
  duplicate_expr:    "repetitive_phrases",
  context_deviation: "off_topic",
  abusive_words:     "off_topic",
};

const GIFT_MARKERS = [40, 80] as const;

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatVoiceScreen() {
  const router = useRouter();
  const { name, role, character_id, session_id, scenario_id, stage_id, user_id, affinity_score } =
    useLocalSearchParams<{
      name: string;
      role: string;
      character_id: string;
      session_id: string;
      scenario_id: string;
      stage_id: string;
      user_id: string;
      affinity_score: string;
    }>();

  // ─── 미션 데이터 ─────────────────────────
  const stageNum = Number(stage_id) || 1;
  const { stageName, missions: missionDefs } = getStageMissions(stageNum);

  // ─── 상태 ───────────────────────────────
  const [sessionId, setSessionId]             = useState<string>(session_id ?? '');
  const [affinity, setAffinity]               = useState(Number(affinity_score) || 0);
  const [affinityDeltaTotal, setAffinityDeltaTotal] = useState(0);
  const [lives, setLives]                 = useState(3);
  const [turnCount, setTurnCount]         = useState(1);
  const [micState, setMicState]           = useState<"idle" | "recording" | "disabled">("idle");
  const [currentAiText, setCurrentAiText] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [lastAudioUri, setLastAudioUri]   = useState<string | null>(null);
  const [lastActionDescription, setLastActionDescription] = useState('');
  const [showHintModal, setShowHintModal] = useState(false);
  const [showEndModal, setShowEndModal]   = useState(false);
  const [showMission, setShowMission]     = useState(false);
  const [hintText, setHintText]           = useState({ english: '', korean: '' });
  const [missions, setMissions] = useState(
    missionDefs.map((m) => ({ ...m, cleared: false }))
  );

  // 미션 누적 카운터
  const counters = useRef<MissionCounters>({
    perfectSentenceCount: 0,
    highScoreCount: 0,
    highScoreThreshold: 80,
    totalAffinityGained: 0,
  });

  const recordingRef     = useRef<Audio.Recording | null>(null);
  const soundRef         = useRef<Audio.Sound | null>(null);
  const aiCaptionOpacity = useRef(new Animated.Value(0)).current;
  const userTextOpacity  = useRef(new Animated.Value(0)).current;

  const popup = usePenaltyPopup();
  const { userId: storeUserId } = useAuthStore();
  const setPronounceContext = useChatStore((s) => s.setPronounceContext);

  // ─── 세션 시작 ──────────────────────────
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const res = await chatService.startSession({
          userId:      Number(user_id) || storeUserId || 1,
          stageId:     Number(stage_id) || 1,
          characterId: character_id || 'CH_01_M',
        });
        if (!isMounted) return;
        setSessionId(res.sessionId);
        setCurrentAiText(res.firstMessage.textContent);
        fadeIn(aiCaptionOpacity);
        if (res.firstMessage.audioUrl) {
          await playAudio(res.firstMessage.audioUrl);
        }
      } catch (e) {
        console.warn('세션 시작 오류:', e);
      }
    };

    Audio.requestPermissionsAsync();
    initSession();
    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ─── 미션 전체 클리어 시 자동 리포트 이동 ─
  useEffect(() => {
    if (missions.length > 0 && missions.every((m) => m.cleared)) {
      const timer = setTimeout(() => handleGoReport(), 800);
      return () => clearTimeout(timer);
    }
  }, [missions]);

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
      setLastAudioUri(uri);
      await sendVoiceMessage(uri);
    } catch (e) {
      console.error("녹음 종료 오류:", e);
      setMicState("idle");
    }
  };

  // ─── API 전송 ───────────────────────────
  const sendVoiceMessage = async (audioUri: string) => {
    try {
      const data = await chatService.sendVoice(audioUri, {
        sessionId:       sessionId,
        characterId:     character_id || 'CH_01_M',
        scenarioId:      scenario_id  || '',   // TODO: 백엔드 확인
        stageLevel:      Number(stage_id) || 1,
        userLevel:       'A1',                 // TODO: 백엔드 확인
        turnCount:       turnCount,
        currentAffinity: affinity,
        history:         [],                   // TODO: 백엔드 형식 확인 후 채우기
      });

      const eval_ = data.system_evaluation;

      // STT 결과 (user_text 역할 → text_content에 포함될 수도 있으므로 백엔드 확인)
      // 현재는 응답의 text_content가 AI 답변, audio_url로 STT 결과를 별도로 받는 구조 아님
      // TODO: 백엔드에 STT 결과 필드 위치 확인
      setCurrentUserText('');  // 백엔드 응답에 user_text 필드 확인 후 채우기
      fadeIn(userTextOpacity);

      setCurrentAiText(data.text_content);
      setLastActionDescription(data.action_description ?? '');
      fadeIn(aiCaptionOpacity);

      if (data.audio_url) await playAudio(data.audio_url);

      const prevAffinity = affinity;
      setAffinity(data.current_total_affinity);
      const delta = data.affinity_delta ?? 0;
      setAffinityDeltaTotal((prev) => prev + delta);
      if (eval_.penalty) setLives((prev) => Math.max(0, prev - 1));
      setTurnCount((prev) => prev + 1);

      // ─── 미션 카운터 + 평가 ────────────────
      if (!eval_.penalty) counters.current.perfectSentenceCount += 1;
      counters.current.totalAffinityGained += delta;

      setMissions((prev) => {
        const clearedIds = new Set(prev.filter((m) => m.cleared).map((m) => m.id));
        const newlyCleared = evaluateMissions(stageNum, clearedIds, {
          userText:           currentUserText,
          isPenalty:          eval_.penalty ?? false,
          pronunciationScore: 0,
          affinityDelta:      delta,
          counters:           counters.current,
        });
        if (newlyCleared.length === 0) return prev;
        return prev.map((m) =>
          newlyCleared.includes(m.id) ? { ...m, cleared: true } : m
        );
      });

      if (eval_.penalty && eval_.penalty_reason) {
        popup.show(PENALTY_REASON_MAP[eval_.penalty_reason] ?? "off_topic", 1);
      } else if (data.current_total_affinity > prevAffinity) {
        const gain = data.current_total_affinity - prevAffinity;
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

  // ─── 공통: 세션 종료 + 진행도 저장 ────────
  const endSessionAndSave = async () => {
    setPronounceContext({
      characterId:       character_id ?? '',
      stageId:           Number(stage_id),
      localAudioUri:     lastAudioUri,
      text:              currentUserText,
      isVideoCall:       true,
      actionDescription: lastActionDescription,
      userAudioUrl:      '',
    });
    if (sessionId) {
      try { await chatService.endSession(sessionId); } catch {}
    }
    try {
      const isPassed = lives > 0;
      const score = Math.min(100, Math.max(0, affinity));
      await chatService.updateProgress({
        userId:         storeUserId ?? Number(user_id) ?? 1,
        currentStageId: Number(stage_id) || 1,
        score,
        isPassed,
      });
    } catch {}
  };

  // ─── 미션 전체 클리어 → 리포트 이동 ────────
  const handleGoReport = async () => {
    await endSessionAndSave();
    router.push({
      pathname: '/report' as any,
      params: {
        session_id:      sessionId,
        character_name:  name,
        stage_name:      stage_id,
        continuous_days: '',
        affinity_change: String(affinityDeltaTotal),
        affinity_score:  String(affinity),
      },
    });
  };

  // ─── 중간 종료 → 스테이지로 이동 ────────────
  const handleEarlyExit = async () => {
    setShowEndModal(false);
    await endSessionAndSave();
    router.replace({
      pathname: '/(main)/stage' as any,
      params: { name, role, character_id },
    });
  };

  // ─────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowEndModal(true)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0B0B12" />
        </TouchableOpacity>
        <Text style={styles.charName}>
          {name || 'Jamie'}{role ? <Text style={styles.charRole}> · {role}</Text> : null}
        </Text>
        <TouchableOpacity onPress={() => setShowMission(true)} hitSlop={12}>
          <Ionicons name="menu" size={26} color="#0B0B12" />
        </TouchableOpacity>
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
            <Text style={styles.hintEnglish}>{hintText.english || '—'}</Text>
            <Text style={styles.hintKorean}>{hintText.korean || '—'}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowHintModal(false)}>
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 통화 종료 모달 ── */}
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
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleEarlyExit}>
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

      {/* ── 미션 드로어 ── */}
      <MissionDrawer
        visible={showMission}
        onClose={() => setShowMission(false)}
        onGoReport={() => { setShowMission(false); handleGoReport(); }}
        stageName={stageName}
        missions={missions}
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