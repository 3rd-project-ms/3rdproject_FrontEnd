// 회원가입 2단계 화면

import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { api, ApiError } from '../../services/api';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';

type Gender = 'male' | 'female' | null;
type IdCheckStatus = 'idle' | 'available' | 'duplicated';

const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

export default function SignupScreen() {
  const router = useRouter();
  const { guest } = useLocalSearchParams<{ guest?: string }>();
  const isGuest = guest === '1';
  const setAuth = useAuthStore((state) => state.setAuth);
  // 게스트는 계정 생성(1단계)을 건너뛰고 초기설정(2단계)부터 시작
  const [step, setStep] = useState<1 | 2>(isGuest ? 2 : 1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>('idle');
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCheckId = email.trim().length > 0;
  const isPasswordValid = passwordRegex.test(password);
  const isPasswordConfirmValid =
    passwordConfirm.length > 0 && password === passwordConfirm;
  const canGoNext =
    email.trim().length > 0 &&
    idCheckStatus === 'available' &&
    isPasswordValid &&
    isPasswordConfirmValid;
  const canSubmit =
    nickname.trim().length > 0 && selectedGender !== null && !isSubmitting;

  const handleChangeEmail = (value: string) => {
    setEmail(value);
    setIdCheckStatus('idle');
  };

  // 백엔드에 아이디 중복확인 전용 엔드포인트가 없어, 형식만 통과시키고
  // 실제 중복 여부는 회원가입(signup) 시점의 에러로 처리한다.
  // TODO(api): 중복확인 엔드포인트가 추가되면 여기서 호출하도록 변경
  const handleCheckId = () => {
    const normalizedEmail = email.trim();
    setIdCheckStatus(normalizedEmail ? 'available' : 'idle');
  };

  const handleBack = () => {
    // 게스트는 2단계만 사용하므로 항상 이전 화면으로
    if (step === 1 || isGuest) {
      router.back();
      return;
    }

    setStep(1);
  };

  const handleSubmit = async () => {
    if (!canSubmit || selectedGender === null) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isGuest) {
        // 게스트: guest_id를 생성해 게스트 로그인으로 user_id 발급
        const guestId = `guest-${Date.now()}`;
        const res = await authService.guestLogin(guestId);
        setAuth({
          isLoggedIn: true,
          userId: res.user_id,
          email: '',
          nickname: nickname.trim() || res.nickname,
          selectedGender,
        });
        // 닉네임·성별 프로필 업데이트 (실패해도 로그인 자체는 진행)
        try {
          await api.put(`/api/auth/${res.user_id}/profile`, {
            nickname: nickname.trim(),
            preferred_partner_gender: selectedGender ?? 'male',
          });
        } catch {}
      } else {
        const res = await authService.signup({
          login_id: email.trim(),
          password,
          nickname: nickname.trim(),
          preferred_partner_gender: selectedGender,
        });
        setAuth({
          isLoggedIn: true,
          userId: res.user_id,
          email: res.login_id,
          nickname: res.nickname,
          selectedGender,
        });
      }
      router.replace('/(auth)/level-select');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
      Alert.alert('알림', message);
    } finally {
      setIsSubmitting(false);
    }
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
              title={isSubmitting ? '처리 중...' : '설정완료하기'}
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
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    backgroundColor: COLORS.white,
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
