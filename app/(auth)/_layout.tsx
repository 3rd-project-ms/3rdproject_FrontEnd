// 인증 화면 네비게이션 레이아웃

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="terms" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="level-select" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="level-test" />
    </Stack>
  );
}
