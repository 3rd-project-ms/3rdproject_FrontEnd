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
import PenaltyPopup, { PopupType, usePenaltyPopup } from '@/components/chat/PenaltyPopup';

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

interface ApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    message_id: string;
    turn_count: number;
    role: string;
    text_content: string;
    action_description: string;
    audio_url: string | null;
    current_affinity: number;
    remaining_penalties: number;
    system_evaluation: {
      grammar_feedback: string;
      is_penalty: boolean;
      penalty_reason: 'korean_used' | 'duplicate_expr' | 'context_deviation' | 'abusive_words' | null;
      pronunciation_score: null;
    };
  } | null;
}

// ─────────────────────────────────────────
// penalty_reason → PopupType 매핑
// ─────────────────────────────────────────
const PENALTY_REASON_MAP: Record<string, PopupType> = {
  korean_used:        'off_topic',
  duplicate_expr:     'repetitive_phrases',
  context_deviation:  'off_topic',
  abusive_words:      'off_topic',
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

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─────────────────────────────────────────
// 🧪 목업 데이터 (순서대로 순환)
// ─────────────────────────────────────────
const MOCK_RESPONSES: ApiResponse[] = [
  {
    success: true, code: 'SUCCESS', message: '',
    data: {
      message_id: 'mock_1', turn_count: 1, role: 'assistant',
      text_content: "Morning! Your usual Americano? Coming right up!",
      action_description: '커피 머신을 닦다가 유저를 발견하고 부드럽게 미소 짓는다.',
      audio_url: null, current_affinity: 50, remaining_penalties: 3,
      system_evaluation: { grammar_feedback: '완벽한 문장이에요!', is_penalty: false, penalty_reason: null, pronunciation_score: null },
    },
  },
  {
    success: true, code: 'SUCCESS', message: '',
    data: {
      message_id: 'mock_2', turn_count: 2, role: 'assistant',
      text_content: "Oh no, you look so exhausted! A slice of cake is on its way! ✨",
      action_description: '귀엽게 눈을 동그랗게 뜨며 쇼케이스에서 딸기 케이크를 꺼낸다.',
      audio_url: null, current_affinity: 42, remaining_penalties: 2,
      system_evaluation: { grammar_feedback: "'너무 피곤해'는 'I am so exhausted'로 표현하는 것이 더 자연스러워요.", is_penalty: true, penalty_reason: 'korean_used', pronunciation_score: null },
    },
  },
  {
    success: true, code: 'SUCCESS', message: '',
    data: {
      message_id: 'mock_3', turn_count: 3, role: 'assistant',
      text_content: "You always know how to make my heart race. Stay a bit longer today... please?",
      action_description: '카운터에 턱을 괸 채 나른하고 달콤한 미소를 짓는다.',
      audio_url: null, current_affinity: 60, remaining_penalties: 2,
      system_evaluation: { grammar_feedback: '아주 좋은 표현이에요!', is_penalty: false, penalty_reason: null, pronunciation_score: null },
    },
  },
];

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatTextScreen() {
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
  const [affinity, setAffinity]   = useState(42);
  const [lives, setLives]         = useState(3);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [turnCount, setTurnCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [inputText, setInputText] = useState('');
  const [mockIndex, setMockIndex] = useState(0); // 🧪 목업 순환용

  // PenaltyPopup 훅
  const popup = usePenaltyPopup();

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null); // ⭐ TextInput 직접 제어용

  // ─── 초기 AI 인사 ───────────────────────
  useEffect(() => {
    setMessages([{
      id: 'init',
      sender: 'ai',
      text: "Hello! Welcome to the espresso bar 'Lavazza'. How would you like a drink?",
      time: getTimeString(),
      action_description: 'Jamie shakes the portafilter of the espresso machine and gives you a sweet smile.',
    }]);
  }, []);

  // ─── 새 메시지 자동 스크롤 ──────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ─── 메시지 전송 & API 호출 ─────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');

    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = { id: userMsgId, sender: 'user', text, time: getTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // ── 🧪 목업 테스트용 (백엔드 연동 시 아래 주석 해제 후 이 블록 삭제) ──
      await new Promise((r) => setTimeout(r, 300)); // 네트워크 딜레이 시뮬레이션
      const json: ApiResponse = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
      setMockIndex((prev) => prev + 1);
      // ── 🔌 실제 연동 시 위 목업 블록 지우고 아래 주석 해제 ──
      // const res = await fetch(`${API_BASE}/api/chat/message`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id:     Number(user_id) || 1,
      //     character_id: character_id  || 'CH_01_M',
      //     session_id:  session_id     || 'sess_dev_001',
      //     scenario_id: scenario_id    || 'SC_01',
      //     stage_id:    Number(stage_id) || 1,
      //     turn_count:  turnCount,
      //     input_type:  'text',
      //     text_content: text,
      //   }),
      // });
      // const json: ApiResponse = await res.json();

      // ── 에러 응답 ──
      if (!json.success || !json.data) {
        if (json.code === 'ERR_NO_LIVES_REMAINING') {
          popup.show('off_topic'); // 하트 소진 — 가장 근접한 팝업 재활용
        } else if (json.code === 'ERR_ABUSIVE_WORDS') {
          popup.show('off_topic');
        }
        return;
      }

      const { data } = json;
      const eval_ = data.system_evaluation;

      // ── 유저 메시지에 피드백 반영 ──
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? { ...m, grammar_feedback: eval_.grammar_feedback, is_penalty: eval_.is_penalty }
            : m
        )
      );

      // ── AI 응답 추가 ──
      setMessages((prev) => [...prev, {
        id:   `${data.message_id}_${Date.now()}`, // 중복 key 방지
        sender: 'ai',
        text: data.text_content,
        time: getTimeString(),
        action_description: data.action_description,
      }]);

      // ── 호감도 & 하트 업데이트 ──
      const prevAffinity = affinity;
      setAffinity(data.current_affinity);
      setLives(data.remaining_penalties);
      setTurnCount((prev) => prev + 1);

      // ── 팝업 트리거 ──
      if (eval_.is_penalty && eval_.penalty_reason) {
        const popupType = PENALTY_REASON_MAP[eval_.penalty_reason] ?? 'off_topic';
        popup.show(popupType, 1);
      } else if (data.current_affinity > prevAffinity) {
        const gain = data.current_affinity - prevAffinity;
        popup.show(gain >= 10 ? 'affection_perfect' : 'affection_good');
      }

    } catch (e) {
      console.error('API 오류:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 하트 렌더링 ────────────────────────
  const renderLives = () => (
    <View style={styles.liveContainer}>
      {[1, 2, 3].map((i) => (
        <Ionicons
          key={i}
          name={i <= lives ? 'heart' : 'heart-outline'}
          size={22}
          color={i <= lives ? '#F6A3A6' : '#E0E0E0'}
          style={{ marginLeft: 3 }}
        />
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0B0B12" />
            </TouchableOpacity>
            <Text style={styles.charName}>Jamie</Text>
            <Text style={styles.charRole}> · 카페 사장님</Text>
          </View>
          {renderLives()}
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

          {/* InputBar — 기존 props 구조 그대로 사용 */}
          <InputBar
            inputRef={inputRef}
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            disabled={isLoading || lives === 0}
          />
        </View>

      </KeyboardAvoidingView>

      {/* PenaltyPopup — KeyboardAvoidingView 밖에 배치해야 키보드 위로 뜸 */}
      <PenaltyPopup
        visible={popup.visible}
        popupType={popup.currentType}
        penaltyPoints={popup.penaltyPoints}
        onClose={() => {
          popup.hide();
          // ⭐ 모달 닫힌 후 키보드 재활성화 (Modal 버그 대응)
          setTimeout(() => {
            inputRef.current?.focus();
          }, 200);
        }}
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
  liveContainer: { flexDirection: 'row', alignItems: 'center' },
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
});