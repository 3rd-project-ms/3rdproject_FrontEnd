// app/(main)/chat-text.tsx
// 카카오톡 / 인스타 DM 스타일 텍스트 채팅 화면
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import ChatBubble, { ChatMessage } from '../../components/chat/ChatBubble';
import InputBar from '../../components/chat/InputBar';
import ReadSsipEffect from '../../components/chat/ReadSsipEffect';
import { useChatStore, CHARACTERS } from '../../store/useChatStore';
import { chatService } from '../../services/chatService';
import { colors, fonts, spacing, radius, shadow } from '../../constants/theme';

// 현재 시각 → "HH:MM" 형식
function nowTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

let msgCounter = 0;
const makeId = () => `msg_${++msgCounter}_${Date.now()}`;

export default function ChatTextScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);

  const {
    characterId,
    characterGender,
    messages,
    affection,
    isReadSsip,
    correctionPopup,
    isLoading,
    addMessage,
    addAITyping,
    removeAITyping,
    updateAffection,
    setReadSsip,
    showCorrectionPopup,
    hideCorrectionPopup,
    setLoading,
  } = useChatStore();

  const character = CHARACTERS[characterId];

  // ── 스크롤 하단 이동 ──
  const scrollToBottom = () => {
    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ── 메시지 전송 로직 ──
  const sendMessage = useCallback(
    async (text: string, mode: 'normal' | 'provoke' | 'mumble' = 'normal') => {
      if (isLoading) return;

      // 1. 내 메시지 추가
      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        text,
        timestamp: nowTime(),
      };
      addMessage(userMsg);
      scrollToBottom();

      // 2. 로딩 + 타이핑 버블
      setLoading(true);
      addAITyping();
      setReadSsip(false);
      scrollToBottom();

      try {
        // 3. API 호출
        const res = await chatService.sendText({
          character_id: characterId,
          gender: characterGender,
          user_message: text,
          mode,
        });

        removeAITyping();

        // 4. AI 메시지 추가
        const aiMsg: ChatMessage = {
          id: makeId(),
          role: 'ai',
          text: res.character_reply,
          timestamp: nowTime(),
          showAvatar: true,
          correction: res.correction || undefined,
        };
        addMessage(aiMsg);

        // 5. 호감도 업데이트
        if (res.affection_change !== 0) {
          updateAffection(res.affection_change);
        }

        // 6. 읽씹 처리
        if (res.is_read_ssip) {
          setReadSsip(true);
        }

        // 7. 교정 팝업 (correction 있을 때)
        if (res.correction) {
          showCorrectionPopup({
            correction: res.correction,
            betterExpression: res.better_expression,
            learningPoint: res.learning_point,
          });
        }

        scrollToBottom();
      } catch (e) {
        removeAITyping();
        const errMsg: ChatMessage = {
          id: makeId(),
          role: 'ai',
          text: '연결이 끊겼어요. 다시 시도해볼게요! 😅',
          timestamp: nowTime(),
          showAvatar: true,
        };
        addMessage(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [isLoading, characterId, characterGender]
  );

  // ── 도발하기 / 웅얼거리기 ──
  const handleProvoke = () => sendMessage('(도발하기)', 'provoke');
  const handleMumble = () => sendMessage('(웅얼거리기)', 'mumble');

  // ── 렌더 아이템 ──
  const renderItem = ({ item }: { item: ChatMessage }) => (
    <ChatBubble
      message={item}
      // TODO: 실제 캐릭터 이미지로 교체
      // characterAvatar={require(`../../assets/characters/${characterId}_${characterGender}.png`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg_dark} />

      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back_btn}>
          <Text style={styles.back_icon}>‹</Text>
        </TouchableOpacity>

        {/* 캐릭터 아바타 자리 */}
        <View style={styles.header_avatar}>
          <Text style={styles.header_avatar_emoji}>{character.emoji}</Text>
        </View>

        <View style={styles.header_info}>
          <Text style={styles.header_name}>
            {character.name} · {characterGender === 'F' ? '여' : '남'}
          </Text>
          <Text style={styles.header_status}>
            {isLoading ? '입력 중...' : `♥ 호감도 ${affection}`}
          </Text>
        </View>

        {/* 통화 모드 전환 */}
        <TouchableOpacity
          style={styles.voice_btn}
          onPress={() => router.replace('/(main)/chat-voice')}
        >
          <Text style={styles.voice_icon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* ── 호감도 바 (얇게) ── */}
      <View style={styles.affection_track}>
        <View
          style={[styles.affection_fill, { width: `${affection}%` }]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── 메시지 목록 ── */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.list_content}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.empty_emoji}>{character.emoji}</Text>
              <Text style={styles.empty_text}>
                {character.name}에게{'\n'}영어로 말을 걸어보세요!
              </Text>
            </View>
          }
          ListFooterComponent={
            // 읽씹 애니메이션
            isReadSsip ? (
              <ReadSsipEffect
                visible={isReadSsip}
                characterName={character.name}
              />
            ) : null
          }
        />

        {/* ── 입력창 ── */}
        <InputBar
          onSend={(text) => sendMessage(text, 'normal')}
          onProvoke={handleProvoke}
          onMumble={handleMumble}
          onVoiceMode={() => router.replace('/(main)/chat-voice')}
          disabled={isLoading}
        />
      </KeyboardAvoidingView>

      {/* ── 교정 팝업 모달 ── */}
      <Modal
        visible={correctionPopup.visible}
        transparent
        animationType="slide"
        onRequestClose={hideCorrectionPopup}
      >
        <TouchableOpacity
          style={styles.modal_overlay}
          activeOpacity={1}
          onPress={hideCorrectionPopup}
        >
          <View style={styles.correction_modal}>
            <View style={styles.modal_handle} />

            <Text style={styles.modal_title}>📝 문법 교정</Text>

            <View style={styles.correction_section}>
              <Text style={styles.correction_label}>교정된 문장</Text>
              <Text style={styles.correction_value}>{correctionPopup.correction}</Text>
            </View>

            <View style={styles.correction_section}>
              <Text style={styles.correction_label}>더 자연스러운 표현</Text>
              <Text style={styles.correction_value}>{correctionPopup.betterExpression}</Text>
            </View>

            <View style={[styles.correction_section, styles.learning_section]}>
              <Text style={styles.learning_label}>💡 오늘의 학습 포인트</Text>
              <Text style={styles.learning_value}>{correctionPopup.learningPoint}</Text>
            </View>

            <TouchableOpacity style={styles.close_btn} onPress={hideCorrectionPopup}>
              <Text style={styles.close_btn_text}>확인했어요</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg_dark },
  flex: { flex: 1 },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.bg_card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back_btn: { padding: 6, marginRight: 2 },
  back_icon: {
    fontSize: 28,
    color: colors.text_primary,
    lineHeight: 30,
  },
  header_avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg_input,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  header_avatar_emoji: { fontSize: 20 },
  header_info: { flex: 1 },
  header_name: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    color: colors.text_primary,
  },
  header_status: {
    fontSize: fonts.size.xs,
    color: colors.text_secondary,
    marginTop: 2,
  },
  voice_btn: { padding: 8 },
  voice_icon: { fontSize: 22 },

  // ── 호감도 바 ──
  affection_track: {
    height: 3,
    backgroundColor: colors.bg_input,
  },
  affection_fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  // ── 메시지 목록 ──
  list: { flex: 1 },
  list_content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // ── 빈 상태 ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  empty_emoji: { fontSize: 48 },
  empty_text: {
    fontSize: fonts.size.md,
    color: colors.text_muted,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── 교정 팝업 ──
  modal_overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.bg_overlay,
  },
  correction_modal: {
    backgroundColor: colors.bg_card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: colors.border_pink,
  },
  modal_handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modal_title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text_primary,
    marginBottom: spacing.md,
  },
  correction_section: {
    backgroundColor: colors.bg_input,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  correction_label: {
    fontSize: fonts.size.xs,
    color: colors.text_muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  correction_value: {
    fontSize: fonts.size.md,
    color: colors.text_primary,
    lineHeight: 22,
  },
  learning_section: {
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderWidth: 1,
    borderColor: colors.border_pink,
  },
  learning_label: {
    fontSize: fonts.size.sm,
    color: colors.primary,
    fontWeight: fonts.weight.semibold,
    marginBottom: 4,
  },
  learning_value: {
    fontSize: fonts.size.md,
    color: colors.text_primary,
    lineHeight: 22,
  },
  close_btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadow.card,
  },
  close_btn_text: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: '#FFFFFF',
  },
});
