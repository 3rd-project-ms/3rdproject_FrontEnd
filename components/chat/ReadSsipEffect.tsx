import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

/**
 * 읽씹 애니메이션 컴포넌트
 * is_read_ssip: true 일 때 채팅창 위에 표시
 * 부모에서 조건부 렌더링으로 show/hide 제어
 *
 * 사용 예:
 *   {showReadSsip && <ReadSsipEffect />}
 */
export default function ReadSsipEffect() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    // 페이드인
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {/* 점 3개 깜빡임 */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <BlinkDot key={i} delay={i * 200} />
        ))}
      </View>
      <Text style={styles.label}>읽음</Text>
    </Animated.View>
  );
}

function BlinkDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
    marginBottom: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
  },
  label: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
});