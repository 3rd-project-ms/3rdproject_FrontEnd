import { Stack } from 'expo-router';

export default function ReportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pronunciation" />
      <Stack.Screen name="pronunciation-detail" />
    </Stack>
  );
}
