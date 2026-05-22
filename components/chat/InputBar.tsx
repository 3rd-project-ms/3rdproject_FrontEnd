// components/chat/InputBar.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../../constants/theme';

interface InputBarProps {
  onSend: (text: string) => void;
  onProvoke?: () => void;        // 도발하기
  onMumble?: () => void;         // 웅얼거리기
  onVoiceMode?: () => void;      // 통화 모드 전환
  disabled?: boolean;
  placeholder?: string;
}

export default function InputBar({
  onSend,
  onProvoke,
  onMumble,
  onVoiceMode,
  disabled = false,
  placeholder = '영어로 입력하세요...',
}: InputBarProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    Keyboard.dismiss();
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.wrapper}>
      {/* ── 상단 액션 버튼 줄 (도발하기 / 웅얼거리기) ── */}
      <View style={styles.action_row}>
        <TouchableOpacity
          style={[styles.action_btn, styles.provoke_btn]}
          onPress={onProvoke}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={styles.action_icon}>😈</Text>
          <Text style={styles.action_label}>도발하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action_btn, styles.mumble_btn]}
          onPress={onMumble}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={styles.action_icon}>🫠</Text>
          <Text style={styles.action_label}>웅얼거리기</Text>
        </TouchableOpacity>

        {/* 통화 모드 전환 버튼 */}
        {onVoiceMode && (
          <TouchableOpacity
            style={[styles.action_btn, styles.voice_switch_btn]}
            onPress={onVoiceMode}
            activeOpacity={0.75}
          >
            <Text style={styles.action_icon}>📞</Text>
            <Text style={[styles.action_label, { color: colors.primary }]}>
              통화
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── 입력창 행 ── */}
      <View style={styles.input_row}>
        <TextInput
          ref={inputRef}
          style={[styles.input, disabled && styles.input_disabled]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.text_muted}
          multiline
          maxLength={300}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />

        {/* 전송 버튼 */}
        <TouchableOpacity
          style={[styles.send_btn, canSend && styles.send_btn_active]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Text style={[styles.send_icon, canSend && styles.send_icon_active]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg_card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 10,
    paddingHorizontal: spacing.md,
  },

  // ── 액션 버튼 줄 ──
  action_row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 10,
  },
  action_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  provoke_btn: {
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderColor: colors.border_pink,
  },
  mumble_btn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.border,
  },
  voice_switch_btn: {
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderColor: colors.border_pink,
    marginLeft: 'auto',
  },
  action_icon: {
    fontSize: 14,
  },
  action_label: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    fontWeight: fonts.weight.medium,
  },

  // ── 입력창 ──
  input_row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg_input,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: fonts.size.md,
    color: colors.text_primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input_disabled: {
    opacity: 0.5,
  },

  // ── 전송 버튼 ──
  send_btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg_input,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  send_btn_active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  send_icon: {
    fontSize: 18,
    color: colors.text_muted,
    fontWeight: fonts.weight.bold,
  },
  send_icon_active: {
    color: '#FFFFFF',
  },
});
