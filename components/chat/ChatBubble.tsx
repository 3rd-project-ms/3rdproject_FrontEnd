// components/chat/ChatBubble.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../../constants/theme';

export type BubbleRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: BubbleRole;
  text: string;
  timestamp: string;
  showAvatar?: boolean;      // AI 말풍선 아바타 표시 여부 (연속 메시지 마지막에만)
  correction?: string;       // 교정된 문장 (있으면 말풍선 아래 노출)
  isTyping?: boolean;        // AI 타이핑 중 상태
}

interface ChatBubbleProps {
  message: ChatMessage;
  characterAvatar?: any;     // require('../assets/characters/A_f.png') 형태
  style?: ViewStyle;
}

export default function ChatBubble({
  message,
  characterAvatar,
  style,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // 타이핑 중 버블 (AI 전용)
  if (message.isTyping) {
    return (
      <View style={[styles.row, styles.row_ai]}>
        {/* 아바타 자리 (항상 공간 차지) */}
        <View style={styles.avatar_placeholder}>
          {message.showAvatar && characterAvatar && (
            <Image source={characterAvatar} style={styles.avatar} />
          )}
        </View>

        <View style={[styles.bubble, styles.bubble_ai]}>
          <View style={styles.typing_dots}>
            <TypingDot delay={0} />
            <TypingDot delay={150} />
            <TypingDot delay={300} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isUser ? styles.row_user : styles.row_ai, style]}>
      {/* AI — 아바타 영역 */}
      {!isUser && (
        <View style={styles.avatar_placeholder}>
          {message.showAvatar && characterAvatar ? (
            <Image source={characterAvatar} style={styles.avatar} />
          ) : null}
        </View>
      )}

      <View style={styles.bubble_wrapper}>
        {/* 말풍선 본체 */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubble_user : styles.bubble_ai,
          ]}
        >
          <Text
            style={[
              styles.bubble_text,
              isUser ? styles.text_user : styles.text_ai,
            ]}
          >
            {message.text}
          </Text>
        </View>

        {/* 타임스탬프 */}
        <Text style={[styles.timestamp, isUser ? styles.ts_user : styles.ts_ai]}>
          {message.timestamp}
        </Text>

        {/* 교정 인디케이터 (내 메시지에 correction 있을 때) */}
        {isUser && message.correction && (
          <View style={styles.correction_badge}>
            <Text style={styles.correction_icon}>✏️</Text>
            <Text style={styles.correction_text} numberOfLines={1}>
              {message.correction}
            </Text>
          </View>
        )}
      </View>

      {/* 유저 — 오른쪽 여백 (아바타 없음) */}
      {isUser && <View style={styles.user_right_pad} />}
    </View>
  );
}

// ─── 타이핑 점 (간단 애니메이션) ───────────────────────────
function TypingDot({ delay }: { delay: number }) {
  // Reanimated 없이도 동작하도록 기본 View로 구현
  // 실제 프로젝트에서는 Reanimated withRepeat 로 교체
  return <View style={styles.typing_dot} />;
}

const styles = StyleSheet.create({
  // ── 행 레이아웃 ──
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row_ai: {
    justifyContent: 'flex-start',
  },
  row_user: {
    justifyContent: 'flex-end',
  },

  // ── 아바타 ──
  avatar_placeholder: {
    width: 36,
    height: 36,
    marginRight: spacing.sm,
    marginBottom: 2,
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg_card,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  // ── 버블 래퍼 ──
  bubble_wrapper: {
    maxWidth: '72%',
    alignItems: 'flex-start',
  },

  // ── 말풍선 ──
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubble_ai: {
    backgroundColor: colors.bubble_ai,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble_user: {
    backgroundColor: colors.bubble_user,
    borderBottomRightRadius: 4,
  },

  // ── 텍스트 ──
  bubble_text: {
    fontSize: fonts.size.md,
    lineHeight: 22,
  },
  text_ai: {
    color: colors.bubble_ai_text,
    fontWeight: fonts.weight.regular,
  },
  text_user: {
    color: colors.bubble_user_text,
    fontWeight: fonts.weight.medium,
  },

  // ── 타임스탬프 ──
  timestamp: {
    fontSize: fonts.size.xs,
    color: colors.text_muted,
    marginTop: 3,
  },
  ts_ai: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  ts_user: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },

  // ── 교정 배지 ──
  correction_badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,157,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border_pink,
    maxWidth: '100%',
  },
  correction_icon: {
    fontSize: 11,
    marginRight: 4,
  },
  correction_text: {
    fontSize: fonts.size.xs,
    color: colors.primary_light,
    flex: 1,
  },

  // ── 타이핑 애니메이션 ──
  typing_dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  typing_dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.text_secondary,
  },

  // ── 유저 오른쪽 패딩 ──
  user_right_pad: {
    width: 36,
    marginLeft: spacing.sm,
  },
});
