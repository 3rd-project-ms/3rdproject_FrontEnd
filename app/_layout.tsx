import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
      </Stack>
    </SafeAreaProvider>
  );
}
