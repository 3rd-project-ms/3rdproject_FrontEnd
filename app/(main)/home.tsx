// 홈 화면 placeholder

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT } from '../../constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>홈 화면 (추후 구현)</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: FONT.medium,
    color: COLORS.text,
  },
});
