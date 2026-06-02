import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

type MicState = 'idle' | 'recording' | 'disabled';

interface MicButtonProps {
  state: MicState;
  onPressIn: () => void;
  onPressOut: () => void;
  size?: number;
}

// 웨이브 바 1개
function WaveBar({ delay, isActive }: { delay: number; isActive: boolean }) {
  const height = useRef(new Animated.Value(4)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(height, { toValue: 4 + Math.random() * 16 + 8, duration: 300 + delay, useNativeDriver: false }),
          Animated.timing(height, { toValue: 4, duration: 300 + delay, useNativeDriver: false }),
        ])
      );
      anim.current.start();
    } else {
      anim.current?.stop();
      Animated.timing(height, { toValue: 4, duration: 200, useNativeDriver: false }).start();
    }
  }, [isActive]);

  return (
    <Animated.View
      style={{
        width: 3,
        height,
        borderRadius: 2,
        backgroundColor: isActive ? colors.primary : '#D0D0D0',
        marginHorizontal: 2,
      }}
    />
  );
}

export default function MicButton({
  state,
  onPressIn,
  onPressOut,
  size = 54, // 양옆 버튼과 동일
}: MicButtonProps) {
  const isRecording = state === 'recording';
  const isDisabled  = state === 'disabled';

  const bgColor = isDisabled ? '#E0E0E0' : isRecording ? '#E8355A' : colors.primary;

  // 웨이브 바 8개 — 각각 다른 딜레이
  const BAR_DELAYS = [80, 120, 60, 180, 100, 140, 70, 160];

  return (
    <View style={styles.wrapper}>

      {/* 웨이브 바 — 녹음 중에만 표시 */}
      <View style={[styles.waveContainer, !isRecording && styles.waveHidden]}>
        {BAR_DELAYS.map((delay, i) => (
          <WaveBar key={i} delay={delay} isActive={isRecording} />
        ))}
      </View>

      {/* 마이크 버튼 */}
      <TouchableOpacity
        onPressIn={() => { if (!isDisabled) onPressIn(); }}
        onPressOut={() => { if (!isDisabled) onPressOut(); }}
        activeOpacity={0.85}
        disabled={isDisabled}
      >
        <View
          style={[
            styles.button,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
            isRecording && styles.buttonRecording,
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={size * 0.42}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>

      {/* 안내 텍스트 */}
      <Text style={[styles.hint, isRecording && styles.hintRecording]}>
        {isRecording ? '놓으면 전송' : isDisabled ? '잠깐만요...' : '누르고 말하기'}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    marginBottom: 10,
    position: 'absolute',  // 버튼 위에 absolute로 띄움 — 레이아웃 영향 없음
    top: -42,
  },
  waveHidden: {
    opacity: 0,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonRecording: {
    shadowColor: '#E8355A',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  hint: {
    marginTop: 8,
    fontSize: 11,
    color: colors.text_secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintRecording: {
    color: '#E8355A',
    fontWeight: '600',
  },
});