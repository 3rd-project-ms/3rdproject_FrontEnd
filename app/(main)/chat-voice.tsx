import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Pressable, Platform, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import MicButton from '@/components/chat/MicButton';
import PenaltyPopup, { PopupType, usePenaltyPopup } from '@/components/chat/PenaltyPopup';
import { colors } from '@/constants/theme';

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
    action_description: string;
    audio_url: string | null;
    current_affinity: number;
    remaining_penalties: number;
    system_evaluation: {
      grammar_feedback: string;
      is_penalty: boolean;
      penalty_reason: 'korean_used' | 'duplicate_expr' | 'context_deviation' | 'abusive_words' | null;
      pronunciation_score: {
        accuracy: number;
        fluency: number;
        completeness: number;
        prosody: number;
        word_details: { word: string; accuracy: number; error_type: string | null }[];
      } | null;
    };
  } | null;
}

const PENALTY_REASON_MAP: Record<string, PopupType> = {
  korean_used:       'off_topic',
  duplicate_expr:    'repetitive_phrases',
  context_deviation: 'off_topic',
  abusive_words:     'off_topic',
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─────────────────────────────────────────
// 🧪 목업 데이터
// ─────────────────────────────────────────
const MOCK_VOICE_RESPONSES: VoiceApiResponse[] = [
  {
    success: true, code: 'SUCCESS', message: '',
    data: {
      message_id: 'voice_mock_1', turn_count: 1, role: 'assistant',
      text_content: "Wow, your pronunciation is really good! I almost thought you were a native speaker.",
      action_description: '눈을 동그랗게 뜨며 감탄한다.',
      audio_url: null,
      current_affinity: 55, remaining_penalties: 3,
      system_evaluation: {
        grammar_feedback: '완벽한 발음이에요!',
        is_penalty: false, penalty_reason: null,
        pronunciation_score: { accuracy: 90, fluency: 85, completeness: 95, prosody: 88,
          word_details: [
            { word: "I'm", accuracy: 95, error_type: null },
            { word: "going", accuracy: 88, error_type: null },
            { word: "to", accuracy: 92, error_type: null },
            { word: "study", accuracy: 85, error_type: null },
          ],
        },
      },
    },
  },
  {
    success: true, code: 'SUCCESS', message: '',
    data: {
      message_id: 'voice_mock_2', turn_count: 2, role: 'assistant',
      text_content: "Hmm, I noticed you mixed in some Korean there! Try to keep it all in English.",
      action_description: '살짝 눈썹을 올리며 웃는다.',
      audio_url: null,
      current_affinity: 42, remaining_penalties: 2,
      system_evaluation: {
        grammar_feedback: "'물'은 영어로 'water'입니다.",
        is_penalty: true, penalty_reason: 'korean_used',
        pronunciation_score: { accuracy: 65, fluency: 60, completeness: 70, prosody: 55,
          word_details: [
            { word: "I", accuracy: 92, error_type: null },
            { word: "am", accuracy: 88, error_type: null },
            { word: "drinking", accuracy: 75, error_type: null },
            { word: "물", accuracy: 10, error_type: "Mispronunciation" },
          ],
        },
      },
    },
  },
];

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatVoiceScreen() {
  const router = useRouter();
  const { character_id, session_id, scenario_id, stage_id, user_id } =
    useLocalSearchParams<{
      character_id: string; session_id: string;
      scenario_id: string; stage_id: string; user_id: string;
    }>();

  // ─── 상태 ───────────────────────────────
  const [affinity, setAffinity]     = useState(42);
  const [lives, setLives]           = useState(3);
  const [turnCount, setTurnCount]   = useState(1);
  const [micState, setMicState]     = useState<'idle' | 'recording' | 'disabled'>('idle');
  const [sttText, setSttText]       = useState('누르고 말해보세요...');
  const [aiText, setAiText]         = useState('');
  const [showHint, setShowHint]     = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [mockIndex, setMockIndex]   = useState(0);

  // 발음 점수 — 결과분석 화면에서 표시 (여기선 제거)

  // 녹음 ref
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef     = useRef<Audio.Sound | null>(null);

  // AI 텍스트 fade 애니메이션
  const aiTextOpacity = useRef(new Animated.Value(0)).current;

  const popup = usePenaltyPopup();

  // ─── 권한 요청 ──────────────────────────
  useEffect(() => {
    Audio.requestPermissionsAsync();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ─── AI 텍스트 페이드인 ─────────────────
  const showAiText = (text: string) => {
    setAiText(text);
    aiTextOpacity.setValue(0);
    Animated.timing(aiTextOpacity, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();
  };

  // ─── 녹음 시작 ──────────────────────────
  const handlePressIn = async () => {
    try {
      // 이전 녹음 잔존 시 정리
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
        recordingRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setMicState('recording');
      setSttText('듣고 있어요...');
    } catch (e) {
      console.error('녹음 시작 오류:', e);
      setMicState('idle');
    }
  };

  // ─── 녹음 종료 + 전송 ───────────────────
  const handlePressOut = async () => {
    if (!recordingRef.current) return;
    setMicState('disabled');

    const rec = recordingRef.current;
    recordingRef.current = null; // 먼저 null로 — 중복 호출 방지

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) {
        setSttText('너무 짧아요! 다시 눌러주세요.');
        setMicState('idle');
        return;
      }
      await sendVoiceMessage(uri);
    } catch (e) {
      console.error('녹음 종료 오류:', e);
      setMicState('idle');
    }
  };

  // ─── API 전송 ───────────────────────────
  const sendVoiceMessage = async (audioUri: string | null) => {
    try {
      // 🧪 목업 (백엔드 연동 시 아래 실제 fetch로 교체)
      await new Promise((r) => setTimeout(r, 1000));
      const json = MOCK_VOICE_RESPONSES[mockIndex % MOCK_VOICE_RESPONSES.length];
      setMockIndex((prev) => prev + 1);

      // 🔌 실제 연동 시 주석 해제
      // const formData = new FormData();
      // formData.append('audio', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' } as any);
      // formData.append('user_id', String(Number(user_id) || 1));
      // formData.append('character_id', character_id || 'CH_01_M');
      // formData.append('session_id', session_id || 'sess_dev_001');
      // formData.append('scenario_id', scenario_id || 'SC_01');
      // formData.append('stage_id', String(Number(stage_id) || 1));
      // formData.append('turn_count', String(turnCount));
      // formData.append('input_type', 'voice');
      // const res = await fetch(`${API_BASE}/api/chat/message`, { method: 'POST', body: formData });
      // const json: VoiceApiResponse = await res.json();

      if (!json.success || !json.data) {
        setSttText('오류가 발생했어요. 다시 시도해주세요.');
        setMicState('idle');
        return;
      }

      const { data } = json;
      const eval_ = data.system_evaluation;

      // STT 결과 → 자막 표시
      setSttText(data.text_content ?? '...');

      // AI 응답 텍스트
      showAiText(data.text_content);

      // TTS 재생
      if (data.audio_url) {
        await playAudio(data.audio_url);
      }

      // 호감도 & 하트
      setAffinity(data.current_affinity);
      setLives(data.remaining_penalties);
      setTurnCount((prev) => prev + 1);

      // 팝업
      if (eval_.is_penalty && eval_.penalty_reason) {
        popup.show(PENALTY_REASON_MAP[eval_.penalty_reason] ?? 'off_topic', 1);
      } else if (data.current_affinity > affinity) {
        const gain = data.current_affinity - affinity;
        popup.show(gain >= 10 ? 'affection_perfect' : 'affection_good');
      }

    } catch (e) {
      console.error('API 오류:', e);
      setSttText('오류가 발생했어요.');
    } finally {
      setMicState('idle');
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
      console.error('오디오 재생 오류:', e);
    }
  };

  const replayAudio = async () => {
    try {
      await soundRef.current?.replayAsync();
    } catch (e) {
      console.error('다시듣기 오류:', e);
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
          color={i <= lives ? '#F6A3A6' : '#D0D0D0'}
          style={{ marginLeft: 2 }}
        />
      ))}
    </View>
  );

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
        {renderLives()}
      </View>

      {/* ── 호감도 바 ── */}
      <View style={styles.affinityWrapper}>
        <Text style={styles.affinityPercent}>{affinity}%</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
          {[33, 66].map((point) => (
            <View key={point} style={[styles.pointHeartWrapper, { left: `${point}%` }]}>
              <Ionicons name="heart" size={14} color={affinity >= point ? '#F6A3A6' : '#D0D0D0'} />
            </View>
          ))}
        </View>
      </View>

      {/* ── 캐릭터 영역 ── */}
      <View style={styles.characterArea}>
        {aiText ? (
          <Animated.View style={[styles.aiSpeechBubble, { opacity: aiTextOpacity }]}>
            <Text style={styles.aiSpeechText}>{aiText}</Text>
          </Animated.View>
        ) : null}
      </View>



      {/* ── 힌트 ── */}
      <View style={styles.hintContainer}>
        <TouchableOpacity
          style={styles.hintHeader}
          onPress={() => setShowHint(!showHint)}
          activeOpacity={0.8}
        >
          <View style={styles.hintTitleRow}>
            <View style={styles.hintDot} />
            <Text style={styles.hintTitleText}>무엇을 말해야 하나요?</Text>
          </View>
          <Ionicons name={showHint ? 'chevron-down' : 'chevron-up'} size={16} color="#888" />
        </TouchableOpacity>
        {showHint && (
          <View style={styles.hintContent}>
            <Text style={styles.hintEnglish}>I'm feeling a bit under the weather.</Text>
            <Text style={styles.hintKorean}>나 오늘 몸 컨디션이 좀 별로야</Text>
          </View>
        )}
      </View>

      {/* ── STT 자막 ── */}
      <View style={styles.subtitleArea}>
        <Text style={styles.subtitleText}>{sttText}</Text>
      </View>

      {/* ── 하단 컨트롤 ── */}
      <View style={styles.controlBar}>
        {/* 다시듣기 */}
        <TouchableOpacity style={styles.subButton} onPress={replayAudio}>
          <View style={styles.iconCircleSub}>
            <Ionicons name="volume-medium" size={22} color="#888" />
          </View>
          <Text style={styles.buttonLabel}>다시듣기</Text>
        </TouchableOpacity>

        {/* MicButton (중앙) */}
        <MicButton
          state={micState}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          size={54}
        />

        {/* 통화종료 */}
        <TouchableOpacity style={styles.subButton} onPress={() => setShowEndModal(true)}>
          <View style={[styles.iconCircleSub, { backgroundColor: '#FFE0E0' }]}>
            <MaterialCommunityIcons name="phone-hangup" size={22} color="#F6A3A6" />
          </View>
          <Text style={styles.buttonLabel}>통화종료</Text>
        </TouchableOpacity>
      </View>

      {/* ── 통화 종료 모달 ── */}
      {showEndModal && (
        <View style={styles.endModalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowEndModal(false)} />
          <View style={styles.endModalContent}>
            <Text style={styles.modalTitle}>정말 통화를 종료하시겠습니까?</Text>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                setShowEndModal(false);
                router.push('/(main)/session-result' as any);
              }}
            >
              <Text style={styles.modalConfirmButtonText}>통화 종료하기</Text>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // 헤더
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  charName: { flex: 1, fontSize: 22, fontWeight: '700', color: '#0B0B12' },
  charRole: { fontSize: 18, fontWeight: '400', color: '#888888' },
  liveContainer: { flexDirection: 'row', alignItems: 'center' },

  // 호감도 바
  affinityWrapper: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, marginBottom: 16,
  },
  affinityPercent: {
    fontSize: 13, fontWeight: '600', color: '#888888',
    width: 36, marginRight: 8, marginTop: 2,
  },
  progressBarBg: {
    flex: 1, height: 8, backgroundColor: '#F0F0F0',
    borderRadius: 4, position: 'relative', marginTop: 6,
  },
  progressBarFill: { height: '100%', backgroundColor: '#F6A3A6', borderRadius: 4 },
  pointHeartWrapper: { position: 'absolute', top: 8, transform: [{ translateX: -7 }] },

  // 캐릭터 영역
  characterArea: {
    flex: 1, marginHorizontal: 20, marginVertical: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  aiSpeechBubble: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14,
    maxWidth: '90%',
  },
  aiSpeechText: {
    fontSize: 15, color: '#1C1C1E', lineHeight: 22, textAlign: 'center',
  },



  // 힌트
  hintContainer: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#FFF5F5', borderRadius: 12, overflow: 'hidden',
  },
  hintHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  hintTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F6A3A6' },
  hintTitleText: { fontSize: 14, fontWeight: '600', color: '#333' },
  hintContent: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  hintEnglish: { fontSize: 14, color: '#E87C7C', fontWeight: '500' },
  hintKorean: { fontSize: 13, color: '#888' },

  // STT 자막
  subtitleArea: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#F8F8F8', borderRadius: 14,
    padding: 20, minHeight: 72,
    justifyContent: 'center', alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16, color: '#0B0B12', textAlign: 'center',
    lineHeight: 24, fontWeight: '500',
  },

  // 하단 컨트롤
  controlBar: {
    flexDirection: 'row', justifyContent: 'space-evenly',
    alignItems: 'center', paddingBottom: 36, paddingHorizontal: 20,
  },
  subButton: { alignItems: 'center', width: 72 },
  iconCircleSub: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  buttonLabel: { fontSize: 12, color: '#888', fontWeight: '500' },

  // 통화종료 모달 (Modal 제거 — absolute View)
  endModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  endModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 48,
    alignItems: 'center', gap: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#0B0B12' },
  modalConfirmButton: {
    width: '100%', paddingVertical: 16,
    borderRadius: 14, backgroundColor: '#F6A3A6', alignItems: 'center',
  },
  modalConfirmButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});