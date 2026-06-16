// 앱 시작 화면

import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function StartScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
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

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    backgroundColor: COLORS.white,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  logoImage: {
    width: 432,
    height: 216,
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
});
