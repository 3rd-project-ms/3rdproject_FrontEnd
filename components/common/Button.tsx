// 공통 와이어프레임 버튼 컴포넌트

import type { ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONT, LAYOUT } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  selected = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.button,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: LAYOUT.buttonHeight,
    width: '100%',
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius,
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT.regular,
  },
});
