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
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

type Gender = 'male' | 'female' | null;
type IdCheckStatus = 'idle' | 'available' | 'duplicated';

const duplicatedIds = ['team4', 'test', 'admin'];
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

export default function SignupScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>('idle');
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>(null);

  const canCheckId = email.trim().length > 0;
  const isPasswordValid = passwordRegex.test(password);
  const isPasswordConfirmValid =
    passwordConfirm.length > 0 && password === passwordConfirm;
  const canGoNext =
    email.trim().length > 0 &&
    idCheckStatus === 'available' &&
    isPasswordValid &&
    isPasswordConfirmValid;
  const canSubmit = nickname.trim().length > 0 && selectedGender !== null;

  const handleChangeEmail = (value: string) => {
    setEmail(value);
    setIdCheckStatus('idle');
  };

  const handleCheckId = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setIdCheckStatus('idle');
      return;
    }

    const isDuplicated = duplicatedIds.includes(normalizedEmail);
    setIdCheckStatus(isDuplicated ? 'duplicated' : 'available');
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep(1);
  };

  const handleSubmit = () => {
    setAuth({
      isLoggedIn: true,
      email: email.trim().toLowerCase(),
      nickname: nickname.trim(),
      selectedGender,
    });
    router.push('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title={step === 1 ? '회원가입' : '초기설정'} onBack={handleBack} />
      <View style={styles.content}>
        {step === 1 ? (
          <>
            <View style={styles.form}>
              <View style={styles.idInputRow}>
                <TextInput
                  value={email}
                  onChangeText={handleChangeEmail}
                  placeholder="이메일(아이디)"
                  placeholderTextColor={COLORS.gray1}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.idInput}
                />
                <Pressable
                  onPress={canCheckId ? handleCheckId : undefined}
                  style={[
                    styles.checkButton,
                    !canCheckId && styles.checkButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.checkButtonText,
                      !canCheckId && styles.checkButtonTextDisabled,
                    ]}
                  >
                    중복확인하기
                  </Text>
                </Pressable>
              </View>
              {idCheckStatus === 'idle' && (
                <Text style={styles.helperText}>
                  *아이디 입력 후 중복확인을 진행해주세요.
                </Text>
              )}
              {idCheckStatus === 'duplicated' && (
                <Text style={styles.errorText}>*중복되는 아이디입니다.</Text>
              )}
              {idCheckStatus === 'available' && (
                <Text style={styles.successText}>*사용 가능한 아이디입니다.</Text>
              )}
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor={COLORS.gray1}
                secureTextEntry
                style={[styles.input, styles.passwordInput]}
              />
              <Text style={styles.helperText}>
                *8~20자의 영문, 숫자, 특수문자 조합을 사용해주세요.
              </Text>
              <TextInput
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호 확인"
                placeholderTextColor={COLORS.gray1}
                secureTextEntry
                style={[styles.input, styles.passwordConfirmInput]}
              />
              {passwordConfirm.length > 0 && !isPasswordConfirmValid ? (
                <Text style={styles.errorText}>
                  *비밀번호가 일치하지 않습니다.
                </Text>
              ) : null}
              <Button
                title="다음"
                disabled={!canGoNext}
                onPress={() => setStep(2)}
                style={styles.nextButton}
              />
            </View>

            <View style={styles.bottomSection}>
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                style={styles.linkWrapper}
              >
                <Text style={styles.linkText}>
                  이미 계정이 있으신가요?{' '}
                  <Text style={styles.underlineText}>로그인</Text>
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.form}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor={COLORS.gray1}
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
                <Text
                  style={[
                    styles.genderButtonText,
                    selectedGender === 'male' && styles.selectedGenderButtonText,
                  ]}
                >
                  남자 캐릭터
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedGender('female')}
                style={[
                  styles.genderButton,
                  selectedGender === 'female' && styles.selectedGenderButton,
                ]}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    selectedGender === 'female' && styles.selectedGenderButtonText,
                  ]}
                >
                  여자 캐릭터
                </Text>
              </Pressable>
            </View>
            <Button
              title="설정완료하기"
              disabled={!canSubmit}
              onPress={handleSubmit}
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
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 56,
  },
  idInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray0,
  },
  idInput: {
    flex: 1,
    height: LAYOUT.inputHeight,
    color: COLORS.black,
    ...TYPOGRAPHY.regular14,
    paddingHorizontal: SPACING.xs,
  },
  checkButton: {
    minWidth: 82,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.gray2,
    borderColor: COLORS.gray2,
  },
  checkButtonText: {
    ...TYPOGRAPHY.semibold12,
    fontSize: 10,
    color: COLORS.gray0,
  },
  checkButtonTextDisabled: {
    color: COLORS.gray1,
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
  helperText: {
    marginTop: 6,
    ...TYPOGRAPHY.regular10,
    color: COLORS.gray0,
  },
  errorText: {
    marginTop: 6,
    ...TYPOGRAPHY.regular10,
    color: COLORS.error,
  },
  successText: {
    marginTop: 6,
    ...TYPOGRAPHY.regular10,
    color: COLORS.error,
  },
  passwordInput: {
    marginTop: 20,
  },
  passwordConfirmInput: {
    marginTop: 18,
  },
  nextButton: {
    marginTop: 40,
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
  genderLabel: {
    marginTop: 32,
    marginBottom: 10,
    ...TYPOGRAPHY.regular14,
    color: COLORS.gray1,
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
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  selectedGenderButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.subColor3Light,
  },
  genderButtonText: {
    ...TYPOGRAPHY.semibold14,
    color: COLORS.gray1,
  },
  selectedGenderButtonText: {
    color: COLORS.primary,
  },
  signupButton: {
    marginTop: 32,
  },
});
