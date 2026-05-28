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

export default function MicButton({
  state,
  onPressIn,
  onPressOut,
  size = 54, // 다른 버튼과 동일한 크기
}: MicButtonProps) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const isRecording = state === 'recording';
  const isDisabled  = state === 'disabled';

  useEffect(() => {
    if (isRecording) {
      // 링 페이드인
      Animated.timing(pulseOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      // 링 박동
      pulseAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseAnim.current.start();
    } else {
      pulseAnim.current?.stop();
      Animated.parallel([
        Animated.timing(pulseScale,   { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isRecording]);

  const bgColor = isDisabled ? '#E0E0E0' : isRecording ? '#E8355A' : colors.primary;
  const iconName = isRecording ? 'stop' : 'mic';
  const iconSize = size * 0.42;

  return (
    <View style={styles.wrapper}>

      {/* 박동 링 — 녹음 중에만 보임 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size + 30,
            height: size + 30,
            borderRadius: (size + 30) / 2,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />

      {/* 버튼 */}
      <TouchableOpacity
        onPressIn={() => { if (!isDisabled) onPressIn(); }}
        onPressOut={() => { if (!isDisabled) onPressOut(); }}
        activeOpacity={0.85}
        disabled={isDisabled}
      >
        <View
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bgColor,
            },
            isRecording && styles.buttonRecording,
          ]}
        >
          <Ionicons name={iconName} size={iconSize} color="#FFFFFF" />
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
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(232,53,90,0.35)',
    backgroundColor: 'rgba(232,53,90,0.08)',
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