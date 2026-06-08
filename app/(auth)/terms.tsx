// 서비스 이용 동의 화면

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import Button from '../../components/common/Button';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface TermRowProps {
  title: string;
  checked: boolean;
  onPress: () => void;
  showArrow?: boolean;
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkOuter, checked && styles.checkOuterActive]}>
      {checked && <View style={styles.checkInner} />}
    </View>
  );
}

function TermRow({ title, checked, onPress, showArrow = false }: TermRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.termRow}>
      <View style={styles.termLeft}>
        <CheckCircle checked={checked} />
        <Text style={styles.termText}>{title}</Text>
      </View>
      {showArrow && <Text style={styles.arrowText}>›</Text>}
    </Pressable>
  );
}

export default function TermsScreen() {
  const router = useRouter();
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const canProceed = agreeService && agreePrivacy;

  const syncAgreeAll = (service: boolean, privacy: boolean, marketing: boolean) => {
    setAgreeAll(service && privacy && marketing);
  };

  const handleAgreeAll = () => {
    const nextValue = !agreeAll;
    setAgreeAll(nextValue);
    setAgreeService(nextValue);
    setAgreePrivacy(nextValue);
    setAgreeMarketing(nextValue);
  };

  const handleService = () => {
    const nextValue = !agreeService;
    setAgreeService(nextValue);
    syncAgreeAll(nextValue, agreePrivacy, agreeMarketing);
  };

  const handlePrivacy = () => {
    const nextValue = !agreePrivacy;
    setAgreePrivacy(nextValue);
    syncAgreeAll(agreeService, nextValue, agreeMarketing);
  };

  const handleMarketing = () => {
    const nextValue = !agreeMarketing;
    setAgreeMarketing(nextValue);
    syncAgreeAll(agreeService, agreePrivacy, nextValue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader title="서비스 이용 동의" onBack={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.content}>
          <TermRow title="약관 전체 동의" checked={agreeAll} onPress={handleAgreeAll} />
          <View style={styles.divider} />
          <TermRow
            title="(필수) 서비스 이용약관"
            checked={agreeService}
            onPress={handleService}
            showArrow
          />
          <TermRow
            title="(필수) 개인정보 수집/이용 동의"
            checked={agreePrivacy}
            onPress={handlePrivacy}
            showArrow
          />
          <TermRow
            title="(선택) 마케팅 수신 동의"
            checked={agreeMarketing}
            onPress={handleMarketing}
            showArrow
          />
        </View>

        <View style={styles.buttonArea}>
          <Button
            title="다음"
            disabled={!canProceed}
            onPress={() => router.push('/(auth)/signup')}
          />
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
  content: {
    paddingTop: 44,
  },
  termRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOuterActive: {
    borderColor: COLORS.primary,
  },
  checkInner: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  termText: {
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.regular14,
  },
  arrowText: {
    fontSize: 24,
    lineHeight: 28,
    color: COLORS.gray1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.gray2,
  },
  buttonArea: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
});
