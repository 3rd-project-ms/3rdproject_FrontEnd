import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Shadow } from '@/constants/tokens';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  style,
  icon,
  disabled,
}: PrimaryButtonProps) {
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
    borderRadius: Spacing.borderRadius.action,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  primaryPressed: {
    backgroundColor: Colors.primaryDark,
  },
  primaryLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.white,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.cardFull,
  },
  outlinePressed: {
    backgroundColor: Colors.border,
  },
  outlineLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  },
  disabled: {
    opacity: 0.5,
  },
});
