// 회원가입 2단계 화면

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

type Gender = 'male' | 'female' | null;

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>(null);

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title="회원가입" onBack={handleBack} />
      <View style={styles.content}>
        {step === 1 ? (
          <>
            <View style={styles.stepOneForm}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="이메일(아이디)"
                placeholderTextColor={COLORS.text}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
              <Text style={styles.helperText}>
                *중복되는 아이디 입니다./ 사용가능한 아이디 입니다.
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor={COLORS.text}
                secureTextEntry
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable onPress={() => setStep(2)} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.orText}>또는</Text>
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                style={styles.linkWrapper}
              >
                <Text style={styles.linkText}>
                  이미 계정이 있으신가요? <Text style={styles.underlineText}>로그인</Text>
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.stepTwoForm}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor={COLORS.text}
              style={styles.input}
            />
            <Text style={styles.genderLabel}>상대 캐릭터 성별</Text>
            <View style={styles.genderRow}>
              <Pressable
                onPress={() => setSelectedGender('male')}
                style={[
                  styles.genderButton,
                  selectedGender === 'male' && styles.selectedGenderButton,
                ]}
              >
                <Text style={styles.genderButtonText}>남자 캐릭터</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedGender('female')}
                style={[
                  styles.genderButton,
                  selectedGender === 'female' && styles.selectedGenderButton,
                ]}
              >
                <Text style={styles.genderButtonText}>여자캐릭터</Text>
              </Pressable>
            </View>
            <Button
              title="회원가입하기"
              onPress={() => router.replace('/(main)/home')}
              style={styles.signupButton}
            />
          </View>
        )}
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
  stepOneForm: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 92,
  },
  stepTwoForm: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 52,
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
  helperText: {
    marginTop: 6,
    fontSize: FONT.small,
    color: COLORS.textLight,
  },
  passwordInput: {
    marginTop: 10,
  },
  nextButton: {
    width: 58,
    height: LAYOUT.buttonHeight,
    marginTop: 32,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.buttonBg,
  },
  nextButtonText: {
    color: COLORS.text,
    fontSize: 44,
    lineHeight: 46,
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
  genderLabel: {
    marginTop: 10,
    marginBottom: SPACING.sm,
    fontSize: 13,
    color: COLORS.textLight,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: LAYOUT.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.buttonBg,
  },
  selectedGenderButton: {
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
  },
  genderButtonText: {
    fontSize: FONT.regular,
    color: COLORS.text,
  },
  signupButton: {
    marginTop: 24,
  },
});
