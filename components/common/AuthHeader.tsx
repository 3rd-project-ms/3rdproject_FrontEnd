// 인증 화면 상단 커스텀 헤더 컴포넌트

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, SPACING } from '../../constants/theme';

interface AuthHeaderProps {
  title: string;
  onBack: () => void;
}

export default function AuthHeader({ title, onBack }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 28,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: COLORS.text,
    lineHeight: 36,
  },
  title: {
    marginLeft: 4,
    fontSize: FONT.medium,
    fontWeight: '700',
    color: COLORS.text,
  },
});
