// 공통 버튼 컴포넌트

import type { ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, LAYOUT } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  selected = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.button,
        isSecondary && styles.secondary,
        disabled && styles.disabled,
        selected && styles.selected,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSecondary && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: LAYOUT.buttonHeight,
    width: '100%',
    borderRadius: LAYOUT.buttonRadius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  disabled: {
    backgroundColor: COLORS.gray2,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryText: {
    color: COLORS.gray1,
  },
  disabledText: {
    color: COLORS.gray1,
  },
});
