// 로그인 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import Button from '../../components/common/Button';
import { COLORS, FONT, LAYOUT, SPACING } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title="로그인" onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.guideText}>계속하려면 로그인해주세요</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일(아이디)"
            placeholderTextColor={COLORS.text}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor={COLORS.text}
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
          />
          <Button
            title="로그인"
            onPress={() => router.replace('/(main)/home')}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.orText}>또는</Text>
          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={styles.linkWrapper}
          >
            <Text style={styles.linkText}>
              계정이 없으신가요? <Text style={styles.underlineText}>회원가입</Text>
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    backgroundColor: COLORS.background,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 72,
  },
  guideText: {
    marginBottom: SPACING.md,
    fontSize: FONT.regular,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  input: {
    height: LAYOUT.inputHeight,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius,
    color: COLORS.text,
    fontSize: FONT.regular,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    marginTop: SPACING.sm,
  },
  submitButton: {
    marginTop: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  orText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  linkWrapper: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
