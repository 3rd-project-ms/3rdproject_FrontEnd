// components/chat/MicButton.tsx
// 음성 모드 화면에서 사용하는 마이크 버튼
// 상태: idle → recording(누르는 동안) → disabled
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, radius } from '../../constants/theme';

type MicState = 'idle' | 'recording' | 'disabled';

interface MicButtonProps {
  state: MicState;
  onPressIn: () => void;    // 녹음 시작
  onPressOut: () => void;   // 녹음 종료 + 전송
  size?: number;
}

export default function MicButton({
  state,
  onPressIn,
  onPressOut,
  size = 88,
}: MicButtonProps) {
  // 누르고 있는 동안 맥박 애니메이션
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.current.start();
  };

  const stopPulse = () => {
    pulseAnim.current?.stop();
    Animated.timing(pulse, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    if (state === 'disabled') return;
    startPulse();
    onPressIn();
  };

  const handlePressOut = () => {
    if (state === 'disabled') return;
    stopPulse();
    onPressOut();
  };

  const isRecording = state === 'recording';
  const isDisabled = state === 'disabled';

  return (
    <View style={styles.container}>
      {/* 바깥 링 (녹음 중 핑크 글로우) */}
      <Animated.View
        style={[
          styles.outer_ring,
          {
            width: size + 32,
            height: size + 32,
            borderRadius: (size + 32) / 2,
            transform: [{ scale: pulse }],
            opacity: isRecording ? 1 : 0,
          },
        ]}
      />

      {/* 중간 링 */}
      <Animated.View
        style={[
          styles.mid_ring,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            transform: [{ scale: pulse }],
            opacity: isRecording ? 0.6 : 0,
          },
        ]}
      />

      {/* 메인 버튼 */}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          isRecording && styles.button_recording,
          isDisabled && styles.button_disabled,
        ]}
      >
        <Text style={[styles.mic_icon, { fontSize: size * 0.38 }]}>
          {isRecording ? '🔴' : '🎙️'}
        </Text>
      </TouchableOpacity>

      {/* 하단 안내 텍스트 */}
      <Text style={styles.hint}>
        {isRecording
          ? '놓으면 전송돼요'
          : isDisabled
          ? '잠깐만요...'
          : '누르고 말하기'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 링들
  outer_ring: {
    position: 'absolute',
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.25)',
  },
  mid_ring: {
    position: 'absolute',
    backgroundColor: 'rgba(255,107,157,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.35)',
  },

  // 메인 버튼
  button: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // iOS shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    // Android
    elevation: 10,
  },
  button_recording: {
    backgroundColor: '#FF3D7F',
    shadowOpacity: 0.7,
    shadowRadius: 24,
  },
  button_disabled: {
    backgroundColor: colors.bg_input,
    shadowOpacity: 0,
    elevation: 0,
  },

  mic_icon: {
    textAlign: 'center',
  },

  hint: {
    marginTop: 16,
    fontSize: 13,
    color: colors.text_secondary,
    letterSpacing: 0.3,
  },
});
