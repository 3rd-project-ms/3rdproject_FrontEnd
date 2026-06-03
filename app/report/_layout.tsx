import { Stack } from 'expo-router';

export default function ReportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mode-report" />
      <Stack.Screen name="pronunciation-overview" />
      <Stack.Screen name="pronunciation-detail" />
      <Stack.Screen name="pronunciation-practice" />
    </Stack>
  );
}
