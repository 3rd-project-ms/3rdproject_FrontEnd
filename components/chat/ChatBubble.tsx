import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────
// 캐릭터 프로필 설정
// ─────────────────────────────────────────
const CHARACTER_CONFIG: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  image?: any;
}> = {
  'CH_01_M': { icon: 'cafe',         color: '#A2B1C6' }, // 카페 사장님 남
  'CH_01_F': { icon: 'cafe',         color: '#C6A2B1' }, // 카페 사장님 여
  'CH_02_M': { icon: 'school',       color: '#A2C6B1' }, // 학교 선배 남
  'CH_02_F': { icon: 'school',       color: '#B1A2C6' }, // 학교 선배 여
  'CH_03_M': { icon: 'sunny',        color: '#C6C2A2' }, // 서퍼 친구 남
  'CH_03_F': { icon: 'sunny',        color: '#A2BEC6' }, // 서퍼 친구 여
};

const DEFAULT_CHARACTER = { icon: 'person' as keyof typeof Ionicons.glyphMap, color: '#A2B1C6' };

// ─────────────────────────────────────────
// Props 타입
// ─────────────────────────────────────────
interface ChatBubbleProps {
  // 기본
  text: string;
  sender: 'ai' | 'user';
  time: string;

  // API 연동 필드
  character_id?: string;          // 캐릭터 구분용
  action_description?: string;    // AI 연출 스크립트 (AI 말풍선 아래 표시)
  grammar_feedback?: string;      // 교정 피드백 (유저 말풍선 아래 표시)
  is_penalty?: boolean;           // 페널티 여부 (빨간 테두리 표시)
  isNew?: boolean;                // 새 메시지 여부 (fade-in 애니메이션)
}

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function ChatBubble({
  text,
  sender,
  time,
  character_id,
  action_description,
  grammar_feedback,
  is_penalty = false,
  isNew = false,
}: ChatBubbleProps) {
  const isAi = sender === 'ai';
  const charConfig = character_id
    ? (CHARACTER_CONFIG[character_id] ?? DEFAULT_CHARACTER)
    : DEFAULT_CHARACTER;

  // 새 메시지 fade-in
  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isNew ? 8 : 0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        isAi ? styles.aiWrapper : styles.userWrapper,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {/* AI 프로필 — 아이콘 없이 색상 원만 표시 */}
      {isAi && (
        <View style={[styles.profileImagePlaceholder, { backgroundColor: charConfig.color }]} />
      )}

      {/* 말풍선 영역 */}
      <View style={[styles.bubbleColumn, isAi ? styles.aiColumn : styles.userColumn]}>

        {/* 말풍선 + 시간 */}
        <View style={[styles.bubbleRow, isAi ? styles.aiRowDirection : styles.userRowDirection]}>
          <View style={[
            styles.bubble,
            isAi ? styles.aiBubble : styles.userBubble,
            is_penalty && styles.penaltyBubble,  // 페널티 시 빨간 테두리
          ]}>
            <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
              {text}
            </Text>
          </View>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        {/* AI 연출 스크립트 */}
        {isAi && action_description && (
          <Text style={styles.actionDescription}>
            {action_description}
          </Text>
        )}

        {/* 유저 문법 피드백 */}
        {!isAi && grammar_feedback && (
          <View style={styles.feedbackContainer}>
            <Ionicons name="bulb-outline" size={11} color="#FFD60A" />
            <Text style={styles.feedbackText}>{grammar_feedback}</Text>
          </View>
        )}

      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  bubbleWrapper: {
    width: '100%',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },

  // 프로필
  profileImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // 말풍선 컬럼 (말풍선 + 피드백 세로 배치)
  bubbleColumn: {
    maxWidth: '78%',
    flexDirection: 'column',
  },
  aiColumn: {
    alignItems: 'flex-start',
  },
  userColumn: {
    alignItems: 'flex-end',
  },

  // 말풍선 + 시간 가로 배치
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aiRowDirection: {
    flexDirection: 'row',
  },
  userRowDirection: {
    flexDirection: 'row-reverse',
  },

  // 말풍선
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  aiBubble: {
    backgroundColor: '#F2F2F7',
  },
  userBubble: {
    backgroundColor: '#2C2C2E',
  },
  penaltyBubble: {
    borderWidth: 1.5,
    borderColor: '#FF453A',
  },

  // 텍스트
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  aiText: {
    color: '#1C1C1E',
  },
  userText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#AEAEB2',
    marginHorizontal: 6,
    marginBottom: 2,
  },

  // AI 연출 스크립트
  actionDescription: {
    fontSize: 11,
    color: '#636366',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
    lineHeight: 15,
  },

  // 유저 문법 피드백
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginRight: 4,
  },
  feedbackText: {
    fontSize: 11,
    color: '#FFD60A',
    lineHeight: 15,
    flexShrink: 1,
  },
});