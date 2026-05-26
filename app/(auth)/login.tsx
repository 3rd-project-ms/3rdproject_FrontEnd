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
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title="로그인" onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.formSection}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일(아이디)"
            placeholderTextColor={COLORS.gray1}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor={COLORS.gray1}
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
          <Pressable
            onPress={() => router.push('/(auth)/terms')}
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
  submitButton: {
    marginTop: 32,
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
});
