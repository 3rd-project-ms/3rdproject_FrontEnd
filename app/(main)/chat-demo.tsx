import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const DEMO_SCRIPT = [
  { time: 0.5,  sender: 'ai',   text: "Hello! Welcome to my cafe! I haven't seen you around before. What can I get for you today?" },
  { time: 6.0,  sender: 'user', text: 'Hi! Can I get an iced Americano, please?' },
  { time: 9.5,  sender: 'ai',   text: 'One iced Americano, coming right up! You look new to this area. Did you just move to this neighborhood?' },
  { time: 15.0, sender: 'user', text: 'Yes, I moved here a few days ago. The neighborhood is very nice!' },
  { time: 19.5, sender: 'ai',   text: "That's lovely! I'm Sienna, the owner here. How are you liking the area so far?" },
  { time: 24.0, sender: 'user', text: "It's quiet and peaceful. And your cafe is really pretty!" },
  { time: 27.5, sender: 'ai',   text: "Aw, thank you so much! I decorated it myself. As a welcome gift, would you like a free chocolate chip cookie with your coffee?" },
  { time: 33.0, sender: 'user', text: "Wow, thank you! I'd love that." },
];

export default function ChatDemoScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [currentAiText, setCurrentAiText]   = useState('');
  const [currentUserText, setCurrentUserText] = useState('');
  const [showEndModal, setShowEndModal]       = useState(false);
  const shownIndexRef = useRef(0);
  const aiCaptionOpacity   = useRef(new Animated.Value(0)).current;
  const userTextOpacity    = useRef(new Animated.Value(0)).current;

  const fadeIn = (animVal: Animated.Value) => {
    animVal.setValue(0);
    Animated.timing(animVal, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    const currentTime = status.positionMillis / 1000;

    while (
      shownIndexRef.current < DEMO_SCRIPT.length &&
      currentTime >= DEMO_SCRIPT[shownIndexRef.current].time
    ) {
      const item = DEMO_SCRIPT[shownIndexRef.current];
      if (item.sender === 'ai') {
        setCurrentAiText(item.text);
        fadeIn(aiCaptionOpacity);
      } else {
        setCurrentUserText(item.text);
        fadeIn(userTextOpacity);
      }
      shownIndexRef.current += 1;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowEndModal(true)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0B0B12" />
        </TouchableOpacity>
        <Text style={styles.charName}>
          시엔나<Text style={styles.charRole}> · 카페 사장님</Text>
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {/* 영상 영역 */}
      <View style={styles.videoArea}>
        <Video
          ref={videoRef}
          source={require('../../assets/demo/stage1_시연영상.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </View>

      {/* 자막 영역 */}
      <View style={styles.textDisplayArea}>
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeAi}>
            <Text style={styles.speakerBadgeTextAi}>시엔나</Text>
          </View>
          <Animated.Text style={[styles.speechTextAi, { opacity: aiCaptionOpacity }]} numberOfLines={2}>
            {currentAiText || '—'}
          </Animated.Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeUser}>
            <Text style={styles.speakerBadgeTextUser}>나</Text>
          </View>
          <Animated.Text style={[styles.speechTextUser, { opacity: userTextOpacity }]} numberOfLines={2}>
            {currentUserText || '말하는 중...'}
          </Animated.Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.subButton} onPress={() => setShowEndModal(true)}>
          <View style={[styles.iconCircleSub, { backgroundColor: '#FFE0E0' }]}>
            <MaterialCommunityIcons name="phone-hangup" size={22} color="#F6A3A6" />
          </View>
          <Text style={styles.buttonLabel}>통화종료</Text>
        </TouchableOpacity>
      </View>

      {/* 통화 종료 모달 */}
      {showEndModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowEndModal(false)} activeOpacity={1} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleText}>통화를 종료하시겠어요?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowEndModal(false)}>
                <Text style={styles.modalCancelButtonText}>계속하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={() => router.back()}>
                <Text style={styles.modalConfirmButtonText}>종료하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 10,
  },
  backBtn:  { padding: 4, marginRight: 8 },
  charName: { flex: 1, fontSize: 22, fontWeight: '700', color: '#0B0B12' },
  charRole: { fontSize: 18, fontWeight: '400', color: '#888888' },

  videoArea: { flex: 1, marginHorizontal: 16, marginVertical: 8, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F9F9F9' },
  video:     { flex: 1 },

  textDisplayArea: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#F8F8F8', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#EFEFEF', gap: 8,
  },
  speechRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  speakerBadgeAi:       { backgroundColor: '#F6A3A6', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextAi:   { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  speechTextAi:         { flex: 1, fontSize: 14, color: '#1C1C1E', lineHeight: 20, fontWeight: '500' },
  speakerBadgeUser:     { backgroundColor: '#EFEFEF', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextUser: { fontSize: 11, fontWeight: '700', color: '#888888' },
  speechTextUser:       { flex: 1, fontSize: 14, color: '#555555', lineHeight: 20 },
  divider:              { height: 1, backgroundColor: '#EBEBEB', marginVertical: 2 },

  controlBar:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 36, paddingHorizontal: 20 },
  subButton:     { alignItems: 'center', width: 72 },
  iconCircleSub: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  buttonLabel:   { fontSize: 12, color: '#888', fontWeight: '500' },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 999, paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 28, alignItems: 'center', gap: 14,
  },
  modalTitleText:         { fontSize: 17, fontWeight: '700', color: '#0B0B12' },
  modalButtonRow:         { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  modalCancelButton:      { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center' },
  modalCancelButtonText:  { fontSize: 15, fontWeight: '600', color: '#555555' },
  modalConfirmButton:     { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F6A3A6', alignItems: 'center' },
  modalConfirmButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
