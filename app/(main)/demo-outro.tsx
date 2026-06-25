import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DemoOutroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* 로고 */}
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* 슬로건 */}
        <Text style={styles.slogan}>외우지 마세요, 시뮬레이션하세요</Text>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 소개 텍스트 */}
        <Text style={styles.desc}>
          SimSpeak은 AI 캐릭터와의 실제 대화를 통해{'\n'}
          자연스러운 영어 실력을 키울 수 있는 앱입니다.
        </Text>

        {/* 연락처 */}
        <View style={styles.contactBox}>
          <Text style={styles.contactLabel}>문의 및 피드백</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:simspeak.2026@gmail.com')}
          >
            <Text style={styles.contactEmail}>simspeak.2026@gmail.com</Text>
          </TouchableOpacity>
        </View>

        {/* 팀 정보 */}
        <Text style={styles.teamText}>ⓒ 2026 SimSpeak Team. All rights reserved.</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  logo: { width: 200, height: 80 },
  slogan: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#F6A3A6',
    borderRadius: 1,
  },
  desc: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
  },
  contactBox: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  contactEmail: {
    fontSize: 15,
    color: '#F6A3A6',
    fontWeight: '700',
  },
  teamText: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 8,
  },
});
