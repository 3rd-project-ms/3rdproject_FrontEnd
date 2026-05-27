import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onPress, variant = 'primary', style, icon, disabled }: PrimaryButtonProps) {
  const [pressed, setPressed] = useState(false);

  const buttonStyle = variant === 'outline' ? styles.outline : styles.primary;
  const labelStyle = variant === 'outline' ? styles.outlineLabel : styles.primaryLabel;
  const pressedStyle = variant === 'outline' ? styles.outlinePressed : styles.primaryPressed;

  return (
    <TouchableOpacity
      style={[styles.base, buttonStyle, pressed && pressedStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
      disabled={disabled}
    >
      {icon}
      <Text style={labelStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primary: {
    backgroundColor: '#F6A3A6',
  },
  primaryPressed: {
    backgroundColor: '#F6A3A6',
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outlinePressed: {
    backgroundColor: '#E0E0E0',
  },
  outlineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAAAAA',
  },
  disabled: {
    opacity: 0.5,
  },
});
