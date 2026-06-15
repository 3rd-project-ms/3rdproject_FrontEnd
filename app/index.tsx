// 앱 시작 화면

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

export default function StartScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleDevLogin = () => {
    setAuth({ isLoggedIn: true, userId: 9999, nickname: '개발자', email: 'dev@test.com' });
    router.replace('/(main)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <Text style={styles.subtitle}>대화하며 호감을 쌓아보세요</Text>
        </View>

        <View style={styles.bottomSection}>
          <Button title="시작하기" onPress={() => router.push('/(auth)/terms')} />
          <Button
            title="로그인"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
          <Pressable
            onPress={() => router.push('/(auth)/signup?guest=1')}
            style={styles.guestLink}
          >
            <Text style={styles.guestText}>
              계정 없이 <Text style={styles.underlineText}>게스트로 시작하기</Text>
            </Text>
          </Pressable>
          {/* DEV ONLY */}
          <Pressable onPress={handleDevLogin} style={styles.devLink}>
            <Text style={styles.devText}>[DEV] 로그인 없이 홈으로</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: LAYOUT.screenPadding,
    backgroundColor: COLORS.background,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  logoBox: {
    width: 216,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray2,
  },
  logoText: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 12,
    ...TYPOGRAPHY.regular14,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 92,
  },
  loginButton: {
    marginTop: 14,
  },
  guestLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  guestText: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  devLink: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  devText: {
    ...TYPOGRAPHY.regular10,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
