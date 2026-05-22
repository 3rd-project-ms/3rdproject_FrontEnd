// components/chat/ReadSsipEffect.tsx
// is_read_ssip: true 일 때 채팅창에 표시되는 읽씹 애니메이션
// "···" 점 3개 순차 페이드 + 읽씹 텍스트
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../../constants/theme';

interface ReadSsipEffectProps {
  visible: boolean;
  characterName?: string;
}

export default function ReadSsipEffect({
  visible,
  characterName = '캐릭터',
}: ReadSsipEffectProps) {
  // 점 3개 각각 애니메이션 값
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // 전체 카드 페이드
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    // 카드 페이드 인
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 점 순차 반복 애니메이션
    const dotLoop = Animated.loop(
      Animated.sequence([
        // dot1
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        // dot2
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        // dot3
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        // 잠깐 대기
        Animated.delay(300),
      ])
    );

    dotLoop.start();
    return () => dotLoop.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
      {/* 읽씹 아이콘 */}
      <Text style={styles.ghost_icon}>👻</Text>

      {/* 텍스트 + 점 */}
      <View style={styles.content}>
        <Text style={styles.label}>
          <Text style={styles.name}>{characterName}</Text>
          {'가 메시지를 읽고 답장 안 함'}
        </Text>

        {/* 점 3개 */}
        <View style={styles.dots_row}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>

      {/* 읽씹 학습 힌트 */}
      <Text style={styles.hint}>
        더 자연스러운 표현을 써보세요 💬
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: 'rgba(255,107,157,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },

  ghost_icon: {
    fontSize: 28,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  label: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    lineHeight: 18,
  },

  name: {
    color: colors.primary_light,
    fontWeight: fonts.weight.medium,
  },

  dots_row: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  hint: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: fonts.size.xs,
    color: colors.text_muted,
  },
});
