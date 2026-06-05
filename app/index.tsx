<<<<<<< HEAD
import { Redirect } from 'expo-router';

export default function Index() {
  // 앱이 켜지자마자 캐릭터 선택(home) 화면으로 자동 리다이렉트(이동)시킵니다.
  return <Redirect href="/(main)/home" />;
}

// 참고용 (나중에 로그인 연동 시 사용)
// export default function Index() {
//   const isLoggedIn = false; // 로그인 여부 체크 로직
//   if (!isLoggedIn) {
//     return <Redirect href="/(auth)/login" />;
//   }
//   return <Redirect href="/(main)/home" />;
// }
=======
// ⚠️ 임시 개발용 이동 허브 — 실제 홈/캐릭터선택 완성되면 교체 또는 삭제

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryButton from '@/components/common/PrimaryButton';
import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing } from '@/constants/tokens';

const HUB_BUTTONS: { label: string; href: string }[] = [
  { label: '리포트 메인', href: ROUTES.REPORT },
  { label: '모드 리포트 (히스토리)', href: ROUTES.MODE_REPORT },
  { label: '발음 요약', href: ROUTES.PRON_OVERVIEW },
  { label: '발음 정밀진단', href: ROUTES.PRON_DETAIL },
  { label: '복습 페이지', href: ROUTES.REVIEW },
];

export default function DevHubScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>개발용 이동 허브</Text>
      <Text style={styles.subtitle}>임시 화면 — 실제 홈 완성 시 삭제</Text>

      <View style={styles.buttonList}>
        {HUB_BUTTONS.map((item) => (
          <PrimaryButton
            key={item.href}
            label={item.label}
            variant="primary"
            onPress={() => router.push(item.href as any)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 80,
    paddingBottom: 40,
    gap: 0,
  },
  title: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  buttonList: {
    gap: 12,
  },
});
>>>>>>> fdbcec90a153012ece0abb7c6e8682480800204b
