import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { Colors, Typography, Spacing } from '@/constants/tokens';

export type ChatMode = '채팅' | '통화';

const MODES: ChatMode[] = ['채팅', '통화'];

export interface ReportChatTabsProps {
  activeMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  style?: StyleProp<ViewStyle>;
}

export default function ReportChatTabs({
  activeMode,
  onModeChange,
  style,
}: ReportChatTabsProps) {
  return (
    <View style={[styles.row, style]}>
      {MODES.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.chip, activeMode === mode && styles.chipActive]}
          onPress={() => onModeChange(mode)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>
            {mode}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    height: 33,
    borderRadius: Spacing.borderRadius.button,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primaryAlpha,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  label: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
});
