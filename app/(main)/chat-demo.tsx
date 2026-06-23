import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Platform, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import MissionDrawer from '@/components/chat/MissionDrawer';
import MicButton from '@/components/chat/MicButton';
import { getStageMissions } from '@/constants/missionData';

const STAGE1_SCRIPT = [
  { time: 0.0,   duration: 5.5,  sender: 'ai',   instant: true, text: "Hello! Welcome to my cafe! I haven't seen you around before. What can I get for you today?" },
  { time: 8.0,   duration: 3.0,  sender: 'user', text: 'Hi! Can I get an iced Americano, please?', clearMissionIds: [1, 2], userStart: 6.0,  userEnd: 11.0, affinityDelta: 30 },
  { time: 10.56, duration: 7.44, sender: 'ai',   text: 'One iced Americano, coming right up! You look new to this area. Did you just move to this neighborhood?' },
  { time: 18.0,  duration: 4.36, sender: 'user', text: 'yes 며칠 전에 이사왔어요. the neighborhood is very nice', userStart: 18.0, userEnd: 22.0, affinityDelta: -3 },
  { time: 22.36, duration: 6.06, sender: 'ai',   text: "That's lovely! I'm Sienna, the owner here. How are you liking the area so far?" },
  { time: 28.42, duration: 5.0,  sender: 'user', text: "It's quiet and peaceful. And your cafe is really pretty!", clearMissionIds: [3], userStart: 28.42, userEnd: 32.8, affinityDelta: 1 },
];

const HIDDEN_SCRIPT = [
  { time: 0.0,  duration: 6.0,  sender: 'ai',   instant: true, text: "The night breeze is so nice, isn't it? Thank you for taking a walk with me. I really wanted to see you today." },
  { time: 7.0,  duration: 4.0,  sender: 'user', text: 'Me too. The night view of the river is so beautiful today.', clearMissionIds: [1], userStart: 7.0,  userEnd: 11.0 },
  { time: 11.0, duration: 7.0,  sender: 'ai',   text: "It really is... but honestly, I haven't been looking at the view at all. Can you guess what I've been looking at?" },
  { time: 18.0, duration: 4.0,  sender: 'user', text: "Me? You're making me blush. Since when did you look at me like that?", clearMissionIds: [2], userStart: 18.0, userEnd: 22.0 },
  { time: 22.0, duration: 8.0,  sender: 'ai',   text: "Probably since the very first day you walked into my cafe. I've been making up excuses just to talk to you longer. Did you really not notice?" },
];

export default function ChatDemoScreen() {
  const router = useRouter();
  const { stage } = useLocalSearchParams<{ stage: string }>();

  const videoSource = stage === 'hidden'
    ? require('../../assets/demo/hidden2_시연영상.mp4')
    : require('../../assets/demo/stage1_시연영상.mp4');

  const DEMO_SCRIPT = stage === 'hidden' ? HIDDEN_SCRIPT : STAGE1_SCRIPT;

  const stageNum = stage === 'hidden' ? 10 : 1;
  const { stageName, missions: missionDefs, hint } = getStageMissions(stageNum, 'voice');
  const [missions, setMissions] = useState(missionDefs.map((m) => ({ ...m, cleared: false })));
  const [showMission, setShowMission] = useState(false);
  const [affinity, setAffinity] = useState(stage === 'hidden' ? 80 : 0);

  useEffect(() => {
    if (stage !== 'stage1') return;
    if (missions.length > 0 && missions.every((m) => m.cleared)) {
      const timer = setTimeout(() => {
        router.push({ pathname: '/report/demo-report' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [missions]);
  const [micState, setMicState] = useState<'idle' | 'recording' | 'disabled'>('idle');
  const [showHintModal, setShowHintModal] = useState(false);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.play();
  });
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

  const typeText = (text: string, setter: (t: string) => void, animVal: Animated.Value, duration: number, onComplete?: () => void) => {
    setter('');
    animVal.setValue(1);
    let i = 0;
    const delay = (duration * 1000) / text.length;
    const interval = setInterval(() => {
      i += 1;
      setter(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, delay);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = player.status;
      if (!status || status.isBuffering) return;
      const currentTime = player.currentTime;
      const duration = player.duration;
      const isUserTalking = DEMO_SCRIPT.some(
        (item) => (item as any).userStart &&
        currentTime >= (item as any).userStart &&
        currentTime < (item as any).userEnd
      );
      setMicState(isUserTalking ? 'recording' : 'idle');

      if (duration > 0 && currentTime >= duration - 0.5) {
        player.pause();
        setMicState('idle');
        clearInterval(interval);
      }

      while (
        shownIndexRef.current < DEMO_SCRIPT.length &&
        currentTime >= DEMO_SCRIPT[shownIndexRef.current].time
      ) {
        const item = DEMO_SCRIPT[shownIndexRef.current];
        if (item.instant) {
          setTimeout(() => {
            if (item.sender === 'ai') {
              setCurrentAiText(item.text);
              fadeIn(aiCaptionOpacity);
            } else {
              setCurrentUserText(item.text);
              fadeIn(userTextOpacity);
            }
          }, 1500);
        } else {
          const onComplete = (item.clearMissionIds?.length || (item as any).affinityDelta != null)
            ? () => {
                if (item.clearMissionIds?.length) {
                  setMissions((prev) =>
                    prev.map((m) =>
                      item.clearMissionIds!.includes(m.id) ? { ...m, cleared: true } : m
                    )
                  );
                }
                const delta = (item as any).affinityDelta;
                if (delta != null) {
                  setAffinity((prev) => Math.min(100, Math.max(0, prev + delta)));
                }
              }
            : undefined;

          if (item.sender === 'ai') {
            typeText(item.text, setCurrentAiText, aiCaptionOpacity, item.duration, onComplete);
          } else {
            typeText(item.text, setCurrentUserText, userTextOpacity, item.duration, onComplete);
          }
        }
        shownIndexRef.current += 1;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player]);

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
        <TouchableOpacity onPress={() => setShowMission(true)} hitSlop={12}>
          <View style={styles.menuBtnWrapper}>
            <Ionicons name="menu" size={26} color="#0B0B12" />
            {missions.filter((m) => !m.cleared).length > 0 && (
              <View style={styles.missionBadge}>
                <Text style={styles.missionBadgeText}>
                  {missions.filter((m) => !m.cleared).length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* 호감도 바 */}
      <View style={styles.affinitySection}>
        <View style={styles.affinityRow}>
          <Text style={styles.affinityPercent}>{affinity}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
            {[40, 80].map((point) => (
              <View key={point} style={[styles.barDivider, { left: `${point}%` }]} />
            ))}
          </View>
        </View>
        <View style={styles.affinityMarkerRow}>
          <View style={styles.affinityMarkerSpacer} />
          <View style={styles.affinityMarkerTrack}>
            {[40, 80].map((point) => (
              <View key={point} style={[styles.affinityMarkerItem, { left: `${point}%` }]}>
                <Ionicons
                  name={affinity >= point ? 'heart' : 'heart-outline'}
                  size={14}
                  color={affinity >= point ? '#F6A3A6' : '#C8C8C8'}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 영상 영역 */}
      <View style={styles.videoArea}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
      </View>

      {/* 자막 영역 */}
      <View style={styles.textDisplayArea}>
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeAi}>
            <Text style={styles.speakerBadgeTextAi}>시엔나</Text>
          </View>
          <Animated.Text style={[styles.speechTextAi, { opacity: aiCaptionOpacity }]}>
            {currentAiText || '—'}
          </Animated.Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.speechRow}>
          <View style={styles.speakerBadgeUser}>
            <Text style={styles.speakerBadgeTextUser}>나</Text>
          </View>
          <Animated.Text style={[styles.speechTextUser, { opacity: userTextOpacity }]}>
            {currentUserText || '말하는 중...'}
          </Animated.Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.subButton} onPress={() => setShowHintModal(true)}>
          <View style={styles.iconCircleSub}>
            <Ionicons name="bulb-outline" size={22} color="#888" />
          </View>
          <Text style={styles.buttonLabel}>힌트</Text>
        </TouchableOpacity>
        <MicButton state={micState} onPressIn={() => {}} onPressOut={() => {}} size={54} />
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

      {showHintModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowHintModal(false)} activeOpacity={1} />
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="bulb" size={20} color="#F6A3A6" />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#0B0B12' }}>힌트</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#E87C7C', fontWeight: '600', textAlign: 'center' }}>{hint.english}</Text>
            <Text style={{ fontSize: 13, color: '#888888', textAlign: 'center' }}>{hint.korean}</Text>
            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#F6A3A6', alignItems: 'center', marginTop: 4 }}
              onPress={() => setShowHintModal(false)}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <MissionDrawer
        visible={showMission}
        onClose={() => setShowMission(false)}
        onGoReport={() => setShowMission(false)}
        stageName={stageName}
        missions={missions}
      />
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
    height: 150,
  },
  speechRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  speakerBadgeAi:       { backgroundColor: '#F6A3A6', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextAi:   { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  speechTextAi:         { flex: 1, fontSize: 14, color: '#1C1C1E', lineHeight: 20, fontWeight: '500' },
  speakerBadgeUser:     { backgroundColor: '#EFEFEF', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  speakerBadgeTextUser: { fontSize: 11, fontWeight: '700', color: '#888888' },
  speechTextUser:       { flex: 1, fontSize: 14, color: '#555555', lineHeight: 20 },
  divider:              { height: 1, backgroundColor: '#EBEBEB', marginVertical: 2 },

  controlBar:    { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: 36, paddingHorizontal: 20 },
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

  menuBtnWrapper: { position: 'relative' },
  missionBadge: {
    position: 'absolute', top: -4, right: -6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F6A3A6',
    justifyContent: 'center', alignItems: 'center',
  },
  missionBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  affinitySection: { paddingHorizontal: 16, marginBottom: 4 },
  affinityRow: { flexDirection: 'row', alignItems: 'center' },
  affinityPercent: { fontSize: 13, fontWeight: '600', color: '#888888', width: 36, marginRight: 8 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, position: 'relative', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#F6A3A6', borderRadius: 4 },
  barDivider: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(255,255,255,0.7)' },
  affinityMarkerRow: { flexDirection: 'row', marginTop: 6 },
  affinityMarkerSpacer: { width: 44 },
  affinityMarkerTrack: { flex: 1, position: 'relative', height: 28 },
  affinityMarkerItem: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -10 }] },
});
