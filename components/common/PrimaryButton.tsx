import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  style,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, variant === 'outline' ? styles.outline : styles.filled, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, variant === 'outline' ? styles.labelOutline : styles.labelFilled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: '#1A1A1A',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelFilled: {
    color: '#FFFFFF',
  },
  labelOutline: {
    color: '#1A1A1A',
  },
});
