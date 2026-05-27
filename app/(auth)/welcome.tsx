// 회원가입 완료 후 환영 화면

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const nickname = useAuthStore((state) => state.nickname);
  const displayName = nickname || 'OOO';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/level-select');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>환영합니다{'\n'}{displayName}님!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.screenPadding,
    backgroundColor: COLORS.background,
  },
  welcomeText: {
    ...TYPOGRAPHY.semibold36,
    lineHeight: 46,
    textAlign: 'center',
  },
});
