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
  size = 54, // 양옆 버튼과 동일
}: MicButtonProps) {
  const isRecording = state === 'recording';
  const isDisabled  = state === 'disabled';

  const bgColor = isDisabled ? '#E0E0E0' : isRecording ? '#E8355A' : colors.primary;

  return (
    <View style={styles.wrapper}>

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