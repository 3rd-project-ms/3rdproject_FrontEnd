import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; //

interface ChatBubbleProps {
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

export default function ChatBubble({ text, sender, time }: ChatBubbleProps) {
  const isAi = sender === 'ai';

  return (
    <View style={[styles.bubbleWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
      {/* AI인 경우에만 왼쪽에 깔끔한 프로필 아이콘 노출 */}
      {isAi && (
        <View style={styles.profileImagePlaceholder}>
          <Ionicons name="cafe" size={16} color="#FFFFFF" />
        </View>
      )}

      {/* 핵심: 말풍선과 시간을 가로(Row)로 배치하여 우측 이미지와 동일하게 구현 */}
      <View style={[styles.bubbleRow, isAi ? styles.aiRowDirection : styles.userRowDirection]}>
        <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
            {text}
          </Text>
        </View>
        
        {/* 시간 표시 */}
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
}

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
  profileImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A2B1C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '78%',
  },
  aiRowDirection: {
    // AI 메시지는 [말풍선 - 시간] 순서
  },
  userRowDirection: {
    // 내 메시지는 오른쪽 정렬이므로 [시간 - 말풍선] 순서로 뒤집음
    flexDirection: 'row-reverse',
  },
  bubble: {
    // 우측 이미지처럼 꼬리 없는 완전 둥근 미니멀 디자인
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  aiBubble: {
    backgroundColor: '#F2F2F7', // 부드러운 연그레이
  },
  userBubble: {
    backgroundColor: '#2C2C2E', // 대비감이 좋은 깔끔한 다크 차콜
  },
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
    marginHorizontal: 6, // 말풍선과 시간 사이의 여백 확보
    marginBottom: 2,     // 바닥 정렬 기준 미세 조정
  },
});