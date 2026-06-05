import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/tokens';

import PrimaryButton from '@/components/common/PrimaryButton';

const BAR_COUNT = 24;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 48;

export interface AudioControlButtonsProps {
  initialPlayingMy?: boolean;
  initialPlayingNative?: boolean;
  isRecording?: boolean;
  stopSignal?: number;
  style?: StyleProp<ViewStyle>;
}

export default function AudioControlButtons({
  initialPlayingMy = false,
  initialPlayingNative = false,
  isRecording = false,
  stopSignal = 0,
  style,
}: AudioControlButtonsProps) {
  const [isPlayingMy, setIsPlayingMy] = useState(initialPlayingMy);
  const [isPlayingNative, setIsPlayingNative] = useState(initialPlayingNative);

  const isPlaying = isPlayingMy || isPlayingNative || isRecording;

  useEffect(() => {
    if (stopSignal > 0) {
      setIsPlayingMy(false);
      setIsPlayingNative(false);
    }
  }, [stopSignal]);

  const animatedValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_HEIGHT))
  ).current;

  const activeAnims = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    activeAnims.current.forEach((a) => a.stop());
    activeAnims.current = [];

    if (isPlaying) {
      activeAnims.current = animatedValues.map((val) => {
        const toValue = MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT);
        const duration = 300 + Math.random() * 400;
        const anim = Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue, duration, useNativeDriver: false }),
            Animated.timing(val, { toValue: MIN_HEIGHT, duration, useNativeDriver: false }),
          ])
        );
        anim.start();
        return anim;
      });
    } else {
      animatedValues.forEach((val) =>
        Animated.timing(val, { toValue: MIN_HEIGHT, duration: 200, useNativeDriver: false }).start()
      );
    }

    return () => {
      activeAnims.current.forEach((a) => a.stop());
    };
  }, [isPlaying]);

  const statusText = isRecording
    ? '현재 상태: 녹음 중 .. (말씀하세요)'
    : isPlayingMy
    ? '현재 상태: 내 발음 듣기'
    : isPlayingNative
    ? '현재 상태: 원어민 발음 가이드'
    : '현재 상태: 대기 중';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <PrimaryButton
          label="내 발음 듣기"
          variant="outline"
          onPress={() => { setIsPlayingMy((v) => !v); setIsPlayingNative(false); }}
          icon={<Ionicons name={isPlayingMy ? 'pause-circle' : 'volume-medium'} size={20} color={Colors.textMuted} />}
          style={styles.button}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label="원어민 발음 가이드"
          variant="primary"
          onPress={() => { setIsPlayingNative((v) => !v); setIsPlayingMy(false); }}
          icon={<Ionicons name={isPlayingNative ? 'pause-circle' : 'play-circle'} size={20} color={Colors.white} />}
          style={styles.button}
        />
      </View>
      <View style={styles.statusCard}>
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.waveform}>
          {animatedValues.map((val, i) => (
            <Animated.View key={i} style={[styles.bar, { height: val }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
  },
  gap: {
    width: 18,
  },
  statusCard: {
    height: 97,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    padding: 16,
    gap: 12,
  },
  statusText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: MAX_HEIGHT,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
