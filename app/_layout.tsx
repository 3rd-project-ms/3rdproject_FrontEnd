import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useAuthStore } from '../store/useAuthStore';

// 앱이 켜질 때 로딩 화면(스플래시)을 자동으로 숨기지 않도록 설정
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 1. 사용할 Inter 폰트 종류를 비동기로 불러옵니다.
  const [loaded, error] = useFonts({
    'Inter': Inter_400Regular,          // 일반 텍스트용
    'Inter-SemiBold': Inter_600SemiBold,  // 굵은 텍스트용
  });

  // 저장된 user_id로 로그인 세션을 복원한다.
  const restoreSession = useAuthStore((state) => state.restoreSession);
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // 2. 폰트 로드가 완료되었거나, 에러가 발생했다면 로딩 화면을 숨깁니다.
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // 폰트 로딩 중에는 아무것도 렌더링하지 않습니다.
  if (!loaded && !error) {
    return null;
  }

  // 3. 내부 메인 화면 구조들을 렌더링합니다.
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="report" />
        <Stack.Screen name="review" />
      </Stack>
    </SafeAreaProvider>
  );
}
