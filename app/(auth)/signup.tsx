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

type Gender = 'male' | 'female' | null;

const duplicatedIds = ['team4', 'test', 'admin'];
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>(null);

  const isDuplicatedId = duplicatedIds.includes(email.trim().toLowerCase());
  const canGoNext =
    email.trim().length > 0 && !isDuplicatedId && passwordRegex.test(password);
  const canSubmit = nickname.trim().length > 0 && selectedGender !== null;

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
          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일(아이디)"
              placeholderTextColor={COLORS.gray1}
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
              placeholderTextColor={COLORS.gray1}
              secureTextEntry
              style={[styles.input, styles.passwordInput]}
            />
            <Text style={styles.helperText}>
              *8~20자의 영문, 숫자, 특수문자 조합을 사용해주세요.
            </Text>
            <Button
              title="다음"
              disabled={!canGoNext}
              onPress={() => setStep(2)}
              style={styles.nextButton}
            />
          </View>
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
              title="회원가입하기"
              disabled={!canSubmit}
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
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 56,
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
    color: COLORS.error,
  },
  passwordInput: {
    marginTop: 20,
  },
  nextButton: {
    marginTop: 40,
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
