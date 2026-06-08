// 로그인 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthHeader from '../../components/common/AuthHeader';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

const mockAccounts = [
  { id: 'team4', password: 'team4123!' },
  { id: 'user1', password: 'user1234!' },
];

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const canLogin =
    loginId.trim().length > 0 && loginPassword.trim().length > 0;

  const handleChangeLoginId = (value: string) => {
    setLoginId(value);
    setLoginError('');
  };

  const handleChangeLoginPassword = (value: string) => {
    setLoginPassword(value);
    setLoginError('');
  };

  const handleLogin = () => {
    const normalizedId = loginId.trim().toLowerCase();
    const matched = mockAccounts.find(
      (account) =>
        account.id === normalizedId && account.password === loginPassword
    );

    if (matched) {
      setLoginError('');
      setAuth({ isLoggedIn: true, email: matched.id });
      router.replace('/(main)/home');
      return;
    }

    setLoginError('*아이디 또는 비밀번호가 일치하지 않습니다.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title="로그인" onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.formSection}>
          <TextInput
            value={loginId}
            onChangeText={handleChangeLoginId}
            placeholder="이메일(아이디)"
            placeholderTextColor={COLORS.gray1}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={loginPassword}
            onChangeText={handleChangeLoginPassword}
            placeholder="비밀번호"
            placeholderTextColor={COLORS.gray1}
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
          />
          <View style={styles.errorArea}>
            {loginError ? (
              <Text style={styles.errorText}>{loginError}</Text>
            ) : null}
          </View>
          <Button
            title="로그인"
            disabled={!canLogin}
            onPress={handleLogin}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.bottomSection}>
          <Pressable
            onPress={() => router.push('/(auth)/terms')}
            style={styles.linkWrapper}
          >
            <Text style={styles.linkText}>
              계정이 없으신가요? <Text style={styles.underlineText}>회원가입</Text>
            </Text>
          </Pressable>
          <View style={styles.findLinks}>
            <Pressable onPress={() => Alert.alert('추후 구현 예정')}>
              <Text style={styles.findLinkText}>아이디 찾기</Text>
            </Pressable>
            <Text style={styles.dividerText}>|</Text>
            <Pressable onPress={() => Alert.alert('추후 구현 예정')}>
              <Text style={styles.findLinkText}>비밀번호 재설정</Text>
            </Pressable>
          </View>
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
    paddingTop: 56,
  },
  input: {
    height: LAYOUT.inputHeight,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray0,
    color: COLORS.black,
    ...TYPOGRAPHY.regular14,
    paddingHorizontal: SPACING.xs,
  },
  passwordInput: {
    marginTop: 18,
  },
  errorArea: {
    minHeight: 20,
    justifyContent: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.regular10,
    color: COLORS.error,
  },
  submitButton: {
    marginTop: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 88,
  },
  linkWrapper: {
    padding: SPACING.sm,
  },
  linkText: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  findLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  findLinkText: {
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
    textDecorationLine: 'underline',
  },
  dividerText: {
    marginHorizontal: 10,
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray0,
  },
});
