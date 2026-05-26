import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; //

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  hintText?: string;
}

export default function InputBar({ value, onChangeText, onSend, hintText }: InputBarProps) {
  return (
    <View style={styles.footerContainer}>
      {/* 힌트 상자 역시 딱딱한 테두리를 버리고 소프트한 그레이 레이어로 정돈 */}
      {hintText && (
        <View style={styles.hintContainer}>
          <View style={styles.hintContent}>
            <Text style={styles.hintText} numberOfLines={1}>
              {hintText}
            </Text>
          </View>
        </View>
      )}

      {/* 인풋 바 영역 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#C7C7CC"
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, value.trim() === '' ? styles.disabledBtn : styles.activeBtn]} 
          onPress={onSend}
          disabled={value.trim() === ''}
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
    justifyContent: 'center',
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#F2F2F7', // 테두리 선 없이 깔끔하게 배경으로 채움
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1C1C1E',
    maxHeight: 70,
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
    backgroundColor: '#2C2C2E', // 전송 활성화 시 말풍선과 동일한 톤
  },
  disabledBtn: {
    backgroundColor: '#E5E5EA',
  },
});