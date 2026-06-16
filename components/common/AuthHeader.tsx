// 인증 화면 상단 커스텀 헤더 컴포넌트

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface AuthHeaderProps {
  title: string;
  onBack: () => void;
  rightElement?: ReactNode;
}

export default function AuthHeader({
  title,
  onBack,
  rightElement,
}: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightArea}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 28,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.black,
  },
  title: {
    marginLeft: 4,
    ...TYPOGRAPHY.semibold20,
  },
  rightArea: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
