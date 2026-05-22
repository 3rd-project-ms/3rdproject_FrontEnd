// app/(main)/chat-voice.tsx
// 음성 통화 화면 — 마이크 누르고 말하기 → STT → TTS 재생 → 발음 점수 표시
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import MicButton from '../../components/chat/MicButton';
import { useChatStore, CHARACTERS } from '../../store/useChatStore';
import { chatService } from '../../services/chatService';
import { colors, fonts, spacing, radius, shadow } from '../../constants/theme';

type VoicePhase =
  | 'idle'           // 대기
  | 'recording'      // 녹음 중
  | 'processing'     // 서버 처리 중
  | 'playing'        // TTS 재생 중
  | 'result';        // 결과 표시

interface VoiceResult {
  sttText: string;
  score: number;
  reply: string;
  correction: string;
}

export default function ChatVoiceScreen() {
  const router = useRouter();
  const { characterId, characterGender, affection, updateAffection } = useChatStore();
  const character = CHARACTERS[characterId];

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [statusText, setStatusText] = useState('누르고 말하기');
  const [error, setError] = useState<string | null>(null);

  // expo-av 녹음 객체
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 물결 애니메이션 (녹음 중)
  const wave1 = useRef(new Animated.Value(1)).current;
  const wave2 = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      // 화면 이탈 시 리소스 정리
      recordingRef.current?.stopAndUnloadAsync();
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ── 물결 애니메이션 시작/중지 ──
  const startWave = () => {
    waveAnim.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(wave1, { toValue: 1.4, duration: 700, useNativeDriver: true }),
          Animated.timing(wave1, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(350),
          Animated.timing(wave2, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(wave2, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ])
    );
    waveAnim.current.start();
  };

  const stopWave = () => {
    waveAnim.current?.stop();
    wave1.setValue(1);
    wave2.setValue(1);
  };

  // ── 녹음 시작 ──
  const handleRecordStart = async () => {
    try {
      setError(null);
      setResult(null);

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('마이크 권한이 필요해요.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setPhase('recording');
      setStatusText('말하는 중... 놓으면 전송');
      startWave();
    } catch (e) {
      setError('녹음을 시작할 수 없어요.');
    }
  };

  // ── 녹음 종료 + 전송 ──
  const handleRecordStop = async () => {
    if (!recordingRef.current) return;

    stopWave();
    setPhase('processing');
    setStatusText('분석하는 중...');

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('녹음 파일 없음');

      // API 전송
      const res = await chatService.sendVoice(uri, characterId, characterGender);

      // 호감도 업데이트
      if (res.affection_change !== 0) {
        updateAffection(res.affection_change);
      }

      setResult({
        sttText: res.stt_result,
        score: res.pronunciation_score,
        reply: res.character_reply,
        correction: res.correction,
      });

      // TTS 재생
      if (res.tts_audio_url) {
        setPhase('playing');
        setStatusText('재생 중...');
        const { sound } = await Audio.Sound.createAsync(
          { uri: res.tts_audio_url },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            setPhase('result');
            setStatusText('누르고 말하기');
          }
        });
      } else {
        setPhase('result');
        setStatusText('누르고 말하기');
      }
    } catch (e) {
      setError('서버 연결에 실패했어요. 다시 시도해주세요.');
      setPhase('idle');
      setStatusText('누르고 말하기');
    }
  };

  // 발음 점수 색상
  const scoreColor = (score: number) => {
    if (score >= 80) return colors.score_high;
    if (score >= 60) return colors.score_mid;
    return colors.score_low;
  };

  const micState =
    phase === 'recording' ? 'recording' :
    phase === 'processing' || phase === 'playing' ? 'disabled' :
    'idle';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg_dark} />

      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back_btn}>
          <Text style={styles.back_icon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.header_info}>
          <Text style={styles.header_name}>
            {character.name} {characterGender === 'F' ? '👩' : '👨'}
          </Text>
          <Text style={styles.header_status}>
            {phase === 'recording' ? '🔴 녹음 중' :
             phase === 'processing' ? '⏳ 분석 중' :
             phase === 'playing' ? '🔊 재생 중' :
             `♥ 호감도 ${affection}`}
          </Text>
        </View>
        {/* 텍스트 모드 전환 */}
        <TouchableOpacity
          style={styles.text_mode_btn}
          onPress={() => router.replace('/(main)/chat-text')}
        >
          <Text style={styles.text_mode_icon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 캐릭터 영역 ── */}
        <View style={styles.character_area}>
          {/* 물결 애니메이션 뒤에 배치 */}
          <Animated.View
            style={[styles.wave_outer, { transform: [{ scale: wave2 }] }]}
          />
          <Animated.View
            style={[styles.wave_inner, { transform: [{ scale: wave1 }] }]}
          />

          {/* 캐릭터 아바타 */}
          <View style={styles.character_avatar}>
            <Text style={styles.character_emoji}>{character.emoji}</Text>
          </View>
        </View>

        {/* ── STT 결과 / 상태 텍스트 ── */}
        <View style={styles.stt_area}>
          {result ? (
            <Text style={styles.stt_text}>"{result.sttText}"</Text>
          ) : (
            <Text style={styles.status_text}>{statusText}</Text>
          )}
        </View>

        {/* ── 발음 점수 카드 ── */}
        {result && (
          <View style={styles.result_card}>
            {/* 점수 원형 */}
            <View style={styles.score_section}>
              <View
                style={[
                  styles.score_circle,
                  { borderColor: scoreColor(result.score) },
                ]}
              >
                <Text
                  style={[styles.score_number, { color: scoreColor(result.score) }]}
                >
                  {result.score}
                </Text>
                <Text style={styles.score_label}>점</Text>
              </View>
              <Text style={styles.score_title}>발음 점수</Text>
            </View>

            {/* 캐릭터 답변 */}
            <View style={styles.reply_section}>
              <Text style={styles.reply_label}>{character.emoji} 답변</Text>
              <Text style={styles.reply_text}>{result.reply}</Text>
            </View>

            {/* 교정 */}
            {result.correction ? (
              <View style={styles.correction_section}>
                <Text style={styles.correction_label}>✏️ 교정</Text>
                <Text style={styles.correction_text}>{result.correction}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── 에러 ── */}
        {error && (
          <View style={styles.error_banner}>
            <Text style={styles.error_text}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── 마이크 버튼 ── */}
        <View style={styles.mic_area}>
          <MicButton
            state={micState}
            onPressIn={handleRecordStart}
            onPressOut={handleRecordStop}
            size={96}
          />
        </View>

        {/* ── 하단 힌트 ── */}
        <Text style={styles.bottom_hint}>
          누르고 있는 동안 녹음됩니다
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg_dark },
  scroll: { flex: 1 },
  content: { alignItems: 'center', paddingBottom: 48 },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.bg_card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back_btn: { padding: 6, marginRight: 4 },
  back_icon: { fontSize: 28, color: colors.text_primary, lineHeight: 30 },
  header_info: { flex: 1 },
  header_name: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    color: colors.text_primary,
  },
  header_status: {
    fontSize: fonts.size.xs,
    color: colors.text_secondary,
    marginTop: 2,
  },
  text_mode_btn: { padding: 8 },
  text_mode_icon: { fontSize: 22 },

  // ── 캐릭터 영역 ──
  character_area: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  wave_outer: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,107,157,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.15)',
  },
  wave_inner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  character_avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bg_card,
    borderWidth: 2.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.pink_glow,
  },
  character_emoji: { fontSize: 46 },

  // ── STT / 상태 텍스트 ──
  stt_area: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 50,
  },
  stt_text: {
    fontSize: fonts.size.lg,
    color: colors.text_primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  status_text: {
    fontSize: fonts.size.md,
    color: colors.text_secondary,
    textAlign: 'center',
  },

  // ── 결과 카드 ──
  result_card: {
    width: '90%',
    backgroundColor: colors.bg_card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },

  // 점수
  score_section: {
    alignItems: 'center',
    marginBottom: 4,
  },
  score_circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg_input,
  },
  score_number: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    lineHeight: 32,
  },
  score_label: {
    fontSize: fonts.size.xs,
    color: colors.text_muted,
  },
  score_title: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    marginTop: 4,
  },

  // 답변
  reply_section: {
    backgroundColor: colors.bg_input,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  reply_label: {
    fontSize: fonts.size.xs,
    color: colors.text_muted,
    marginBottom: 4,
  },
  reply_text: {
    fontSize: fonts.size.md,
    color: colors.text_primary,
    lineHeight: 22,
  },

  // 교정
  correction_section: {
    backgroundColor: 'rgba(255,107,157,0.06)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border_pink,
  },
  correction_label: {
    fontSize: fonts.size.xs,
    color: colors.primary,
    marginBottom: 4,
  },
  correction_text: {
    fontSize: fonts.size.md,
    color: colors.text_primary,
  },

  // ── 에러 ──
  error_banner: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    width: '90%',
  },
  error_text: {
    fontSize: fonts.size.sm,
    color: colors.error,
    textAlign: 'center',
  },

  // ── 마이크 버튼 ──
  mic_area: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },

  // ── 하단 힌트 ──
  bottom_hint: {
    marginTop: spacing.lg,
    fontSize: fonts.size.xs,
    color: colors.text_muted,
    letterSpacing: 0.3,
  },
});
