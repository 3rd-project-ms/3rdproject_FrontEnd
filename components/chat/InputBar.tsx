import React, { useRef } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputBarProps {
  inputRef?: React.RefObject<TextInput>;  // ⭐ 외부에서 제어용
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  hintText?: string;
  disabled?: boolean;
}

export default function InputBar({
  inputRef,
  value,
  onChangeText,
  onSend,
  hintText,
  disabled = false,
}: InputBarProps) {
  const internalRef = useRef<TextInput>(null);
  const ref = inputRef ?? internalRef; // 외부 ref 있으면 우선 사용

  const isDisabled = disabled || value.trim() === '';

  const handleSend = () => {
    onSend();
    setTimeout(() => ref.current?.focus(), 100);
  };

  return (
    <View style={styles.footerContainer}>
      {hintText && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText} numberOfLines={1}>{hintText}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          ref={ref}
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#C7C7CC"
          value={value}
          onChangeText={onChangeText}
          multiline
          editable={!disabled}
          blurOnSubmit={false}
          showSoftInputOnFocus={true}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, isDisabled ? styles.disabledBtn : styles.activeBtn]}
          onPress={handleSend}
          disabled={isDisabled}
        >
          <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  hintContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  hintText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1C1C1E',
    maxHeight: 70,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {
    backgroundColor: '#2C2C2E',
  },
  disabledBtn: {
    backgroundColor: '#E5E5EA',
  },
});