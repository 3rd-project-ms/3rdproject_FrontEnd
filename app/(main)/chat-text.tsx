import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ChatBubble from '@/components/chat/ChatBubble';
import InputBar from '@/components/chat/InputBar';
import MissionDrawer from '@/components/chat/MissionDrawer';
import PenaltyPopup, { PopupType, usePenaltyPopup } from '@/components/chat/PenaltyPopup';
import { chatService } from '@/services/chatService';
import { getStageMissions, evaluateMissions, MissionCounters } from '@/constants/missionData';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  action_description?: string;
  grammar_feedback?: string;
  is_penalty?: boolean;
}

// ─────────────────────────────────────────
// penalty_reason → PopupType 매핑
// ─────────────────────────────────────────
const PENALTY_REASON_MAP: Record<string, PopupType> = {
  korean_used:       'off_topic',
  duplicate_expr:    'repetitive_phrases',
  context_deviation: 'off_topic',
  abusive_words:     'off_topic',
};

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
const getTimeString = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? '오후' : '오전';
  return `${ampm} ${h % 12 || 12}:${m}`;
};

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatTextScreen() {
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
  const [lives, setLives]               = useState(3);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [turnCount, setTurnCount]       = useState(1);
  const [isLoading, setIsLoading]       = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const [inputText, setInputText]       = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showMission, setShowMission]   = useState(false);
  const [missions, setMissions] = useState(
    missionDefs.map((m) => ({ ...m, cleared: false }))
  );

  // 미션 누적 카운터 (렌더 트리거 불필요 → useRef)
  const counters = useRef<MissionCounters>({
    perfectSentenceCount: 0,
    highScoreCount: 0,
    highScoreThreshold: 80,
    totalAffinityGained: 0,
  });

  const popup = usePenaltyPopup();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);
  const { userId: storeUserId } = useAuthStore();
  const setPronounceContext = useChatStore((s) => s.setPronounceContext);

  // ─── 세션 시작 + 초기 AI 인사 ──────────
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
        setMessages([{
          id:     'init',
          sender: 'ai',
          text:   res.firstMessage.textContent,
          time:   getTimeString(),
          action_description: res.firstMessage.actionDescription,
        }]);
      } catch (e: any) {
        console.warn('세션 시작 오류:', e?.message, '| code:', e?.code, '| status:', e?.response?.status);
        if (!isMounted) return;
        setMessages([{
          id:     'init',
          sender: 'ai',
          text:   "Hello! How can I help you today?",
          time:   getTimeString(),
        }]);
      }
    };
    initSession();
    return () => { isMounted = false; };
  }, []);

  // ─── 새 메시지 자동 스크롤 ──────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ─── 미션 전체 클리어 시 자동 리포트 이동 ─
  useEffect(() => {
    if (missions.length > 0 && missions.every((m) => m.cleared)) {
      const timer = setTimeout(() => handleGoReport(), 800);
      return () => clearTimeout(timer);
    }
  }, [missions]);

  // ─── 메시지 전송 & API 호출 ─────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');

    const userMsgId = `user_${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text, time: getTimeString() }]);
    setIsLoading(true);

    try {
      const data = await chatService.sendText({
        sessionId:       sessionId,
        textContent:     text,
        inputType:       'text',
        characterId:     character_id || 'CH_01_M',
        scenarioId:      scenario_id  || '',   // TODO: 백엔드 확인
        stageLevel:      Number(stage_id) || 1,
        userLevel:       'A1',                 // TODO: 백엔드 확인
        turnCount:       turnCount,
        currentAffinity: affinity,
        history:         [],                   // TODO: 백엔드 형식 확인 후 채우기
      });

      const eval_ = data.system_evaluation;

      // 유저 말풍선에 grammar_feedback 붙이기
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? { ...m, grammar_feedback: eval_.grammar_feedback, is_penalty: eval_.penalty }
            : m
        )
      );

      // AI 말풍선 추가
      setMessages((prev) => [...prev, {
        id:     `ai_${Date.now()}`,
        sender: 'ai',
        text:   data.text_content,
        time:   getTimeString(),
        action_description: data.action_description,
      }]);

      const prevAffinity = affinity;
      setAffinity(data.current_total_affinity);
      const delta = data.affinity_delta ?? 0;
      setAffinityDeltaTotal((prev) => prev + delta);
      if (eval_.penalty) setLives((prev) => Math.max(0, prev - 1));
      setTurnCount((prev) => prev + 1);

      // ─── 미션 카운터 업데이트 ──────────────
      if (!eval_.penalty) counters.current.perfectSentenceCount += 1;
      counters.current.totalAffinityGained += delta;

      // ─── 미션 클리어 평가 ──────────────────
      setMissions((prev) => {
        const clearedIds = new Set(prev.filter((m) => m.cleared).map((m) => m.id));
        const newlyCleared = evaluateMissions(stageNum, clearedIds, {
          userText:          text,
          isPenalty:         eval_.penalty ?? false,
          pronunciationScore: 0,
          affinityDelta:     delta,
          counters:          counters.current,
        });
        if (newlyCleared.length === 0) return prev;
        return prev.map((m) =>
          newlyCleared.includes(m.id) ? { ...m, cleared: true } : m
        );
      });

      if (eval_.penalty && eval_.penalty_reason) {
        popup.show(PENALTY_REASON_MAP[eval_.penalty_reason] ?? 'off_topic', 1);
      } else if (data.current_total_affinity > prevAffinity) {
        const gain = data.current_total_affinity - prevAffinity;
        popup.show(gain >= 10 ? 'affection_perfect' : 'affection_good');
      }

    } catch (e: any) {
      console.warn('API 오류:', e?.message, '| status:', e?.response?.status);
      const code = e?.response?.data?.code;
      if (code === 'ERR_NO_LIVES_REMAINING' || code === 'ERR_ABUSIVE_WORDS') {
        popup.show('off_topic');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 공통: 세션 종료 + 진행도 저장 ────────
  const endSessionAndSave = async () => {
    setPronounceContext({
      characterId:       character_id ?? '',
      stageId:           Number(stage_id),
      localAudioUri:     null,
      text:              messages.filter((m) => m.sender === 'user').at(-1)?.text ?? '',
      isVideoCall:       false,
      actionDescription: messages.filter((m) => m.sender === 'ai').at(-1)?.action_description ?? '',
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => setShowEndModal(true)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0B0B12" />
            </TouchableOpacity>
            <Text style={styles.charName}>{name || 'Jamie'}</Text>
            {role ? <Text style={styles.charRole}> · {role}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => setShowMission(true)} hitSlop={12}>
            <Ionicons name="menu" size={26} color="#0B0B12" />
          </TouchableOpacity>
        </View>

        {/* ── 호감도 바 ── */}
        <View style={styles.affinityWrapper}>
          <Text style={styles.affinityPercent}>{affinity}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
            {[33, 66].map((point) => (
              <View key={point} style={[styles.pointHeartWrapper, { left: `${point}%` }]}>
                <Ionicons name="heart" size={14} color={affinity >= point ? '#F6A3A6' : '#FFFFFF'} />
              </View>
            ))}
          </View>
        </View>

        {/* ── 채팅 영역 ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScrollView}
          contentContainerStyle={styles.chatContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <ChatBubble
              key={msg.id}
              sender={msg.sender}
              text={msg.text}
              time={msg.time}
              character_id={character_id || 'CH_01_M'}
              action_description={msg.action_description}
              grammar_feedback={msg.grammar_feedback}
              is_penalty={msg.is_penalty}
              isNew={index === messages.length - 1}
            />
          ))}
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#F6A3A6" />
              <Text style={styles.loadingText}>답변 중...</Text>
            </View>
          )}
        </ScrollView>

        {/* ── 하단: 힌트 + 입력창 ── */}
        <View style={styles.bottomAreaContainer}>
          <View style={styles.hintWrapper}>
            <TouchableOpacity
              style={styles.hintHeader}
              onPress={() => setShowHint(!showHint)}
              activeOpacity={0.8}
            >
              <View style={styles.hintTitleRow}>
                <View style={styles.hintDot} />
                <Text style={styles.hintTitleText}>무엇을 말해야 하나요?</Text>
              </View>
              <Ionicons name={showHint ? 'chevron-down' : 'chevron-up'} size={16} color="#616161" />
            </TouchableOpacity>
            {showHint && (
              <View style={styles.hintContent}>
                <Text style={styles.hintEnglish}>Could you recommend a signature coffee here?</Text>
                <Text style={styles.hintKorean}>여기 시그니처 커피 추천해 주실 수 있나요?</Text>
              </View>
            )}
          </View>

          <InputBar
            inputRef={inputRef}
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            disabled={isLoading || lives === 0}
          />
        </View>

      </KeyboardAvoidingView>

      {/* ── 종료 확인 팝업 ── */}
      {showEndModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowEndModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleText}>채팅을 종료하시겠어요?</Text>
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

      {/* PenaltyPopup */}
      <PenaltyPopup
        visible={popup.visible}
        popupType={popup.currentType}
        penaltyPoints={popup.penaltyPoints}
        onClose={() => {
          popup.hide();
          setTimeout(() => { inputRef.current?.focus(); }, 200);
        }}
      />

      {/* 미션 드로어 */}
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    paddingBottom: 10, backgroundColor: '#FFFFFF',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 6, padding: 2 },
  charName: { fontSize: 20, fontWeight: '700', color: '#0B0B12' },
  charRole: { fontSize: 15, fontWeight: '400', color: '#616161' },

  affinityWrapper: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginVertical: 10, backgroundColor: '#FFFFFF',
  },
  affinityPercent: { fontSize: 14, fontWeight: '600', color: '#2C3A5F', marginRight: 10, width: 35 },
  progressBarBg: { flex: 1, height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, position: 'relative' },
  progressBarFill: { height: '100%', backgroundColor: '#F6A3A6', borderRadius: 5 },
  pointHeartWrapper: { position: 'absolute', top: 12, transform: [{ translateX: -7 }] },

  chatScrollView: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FFFFFF' },
  chatContentContainer: { paddingVertical: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  loadingText: { fontSize: 13, color: '#AEAEB2' },

  bottomAreaContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 15 : 25,
    backgroundColor: '#FFFFFF',
  },
  hintWrapper: {
    backgroundColor: '#FAF5EE', borderRadius: 12, overflow: 'hidden',
    marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA',
  },
  hintHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  hintTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F6A3A6' },
  hintTitleText: { fontSize: 14, fontWeight: '600', color: '#2C3A5F' },
  hintContent: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  hintEnglish: { fontSize: 14, color: '#E87C7C', fontWeight: '600' },
  hintKorean: { fontSize: 13, color: '#616161' },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 999, paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 28, alignItems: 'center', gap: 14,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  modalTitleText: { fontSize: 17, fontWeight: '700', color: '#0B0B12', textAlign: 'center' },
  modalSubText:   { fontSize: 14, color: '#888888', textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  modalCancelButton: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  modalCancelButtonText:  { fontSize: 15, fontWeight: '600', color: '#555555' },
  modalConfirmButton: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F6A3A6', alignItems: 'center',
  },
  modalConfirmButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});