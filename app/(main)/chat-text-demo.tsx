import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, FlatList, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatBubble from '@/components/chat/ChatBubble';
import MissionDrawer from '@/components/chat/MissionDrawer';
import InputBar from '@/components/chat/InputBar';
import PenaltyPopup, { usePenaltyPopup } from '@/components/chat/PenaltyPopup';
import { getStageMissions } from '@/constants/missionData';

const GIFT_MARKERS = [40, 80] as const;

const CHARACTER_ID = 'CH_03_F';
const CHARACTER_NAME = '시엔나';
const CHARACTER_ROLE = '카페 사장님';

const DEMO_MESSAGES = [
  {
    id: '1', sender: 'ai' as const,
    text: "Hello! Welcome to my cafe! I haven't seen you around before. What can I get for you today?",
    action_description: '카운터를 닦다가 고개를 들어 환하게 웃는다. 반가운 눈빛으로 눈을 맞추며 가볍게 손을 흔들어 인사한다.',
    delay: 1000,
    clearMissionIds: [] as number[],
  },
  {
    id: '2', sender: 'user' as const,
    text: 'Hi! Can I get an iced Americano, please?',
    action_description: '',
    delay: 4000,
    typeStart: 2500,
    clearMissionIds: [1, 2],
  },
  {
    id: '3', sender: 'ai' as const,
    text: 'One iced Americano, coming right up! You look new to this area. Did you just move to this neighborhood?',
    action_description: '포스기에 주문을 입력하며 경쾌하게 대답한다. 호기심 어린 표정으로 살짝 고개를 갸웃하며 묻는다.',
    delay: 7000,
    clearMissionIds: [] as number[],
  },
  {
    id: '4', sender: 'user' as const,
    text: 'yes 며칠 전에 이사왔어요. the neighborhood is very nice',
    action_description: '',
    delay: 12000,
    typeStart: 9500,
    clearMissionIds: [] as number[],
  },
  {
    id: '5', sender: 'ai' as const,
    text: "That's lovely! I'm Sienna, the owner here. How are you liking the area so far?",
    action_description: '컵에 얼음을 담다 말고 눈을 반짝이며 활짝 웃는다. 자랑스러운 듯 가볍게 자기 가슴에 손을 얹으며 자기소개를 한다.',
    delay: 16000,
    clearMissionIds: [] as number[],
  },
  {
    id: '6', sender: 'user' as const,
    text: "It's quiet and peaceful. And your cafe is really pretty!",
    action_description: '',
    delay: 21000,
    typeStart: 18000,
    clearMissionIds: [3],
  },
  {
    id: '7', sender: 'ai' as const,
    text: "Aw, thank you so much! I decorated it myself. As a welcome gift, would you like a free chocolate chip cookie with your coffee?",
    action_description: '칭찬에 기분이 좋아져 양볼이 살짝 발그레해진다. 쇼케이스 쪽을 가리키며 다정하고 장난스러운 윙크를 보낸다.',
    delay: 25000,
    clearMissionIds: [] as number[],
  },
  {
    id: '8', sender: 'user' as const,
    text: "Wow, thank you! I'd love that.",
    action_description: '',
    delay: 31000,
    typeStart: 28500,
    clearMissionIds: [] as number[],
  },
];

const getTimeString = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? '오후' : '오전';
  return `${ampm} ${h % 12 || 12}:${m}`;
};

export default function ChatTextDemoScreen() {
  const router = useRouter();
  const stageNum = 1;
  const { stageName, missions: missionDefs, hint } = getStageMissions(stageNum, 'text');
  const [messages, setMessages] = useState<typeof DEMO_MESSAGES>([]);
  const [affinity, setAffinity] = useState(0);
  const [missions, setMissions] = useState(missionDefs.map((m) => ({ ...m, cleared: false })));
  const [showMission, setShowMission] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<any>(null);
  const popup = usePenaltyPopup();
  const timeStr = getTimeString();

  useEffect(() => {
    const openTimer = setTimeout(() => {
      setShowMission(true);
    }, 500);
    const closeTimer = setTimeout(() => {
      setShowMission(false);
      setChatStarted(true);
    }, 3500);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const typeInInput = (text: string, onComplete: () => void) => {
    inputRef.current?.focus();
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setInputText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 80);
  };

  useEffect(() => {
    if (!chatStarted) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    DEMO_MESSAGES.forEach((msg) => {
      if (msg.sender === 'user' && msg.typeStart) {
        timers.push(setTimeout(() => {
          typeInInput(msg.text, () => {
            setInputText('');
            setMessages((prev) => [...prev, msg]);
            if (msg.id === '2') { setAffinity(30); }
            if (msg.id === '4') { popup.show('korean_mixed'); setAffinity((prev) => Math.max(0, prev - 3)); setTimeout(() => popup.hide(), 2500); }
            if (msg.id === '6') {
              setAffinity((prev) => Math.min(100, prev + 1));
              setTimeout(() => { popup.show('affection_good', 1); setTimeout(() => popup.hide(), 2500); }, 1000);
            }
            if (msg.clearMissionIds?.length) {
              setMissions((prev) =>
                prev.map((m) =>
                  msg.clearMissionIds!.includes(m.id) ? { ...m, cleared: true } : m
                )
              );
            }
            flatListRef.current?.scrollToEnd({ animated: true });
          });
        }, msg.typeStart));
      } else if (msg.sender === 'ai') {
        timers.push(setTimeout(() => {
          setMessages((prev) => [...prev, msg]);
          flatListRef.current?.scrollToEnd({ animated: true });
        }, msg.delay));
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [chatStarted]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0B0B12" />
        </TouchableOpacity>
        <Text style={styles.charName}>
          {CHARACTER_NAME}<Text style={styles.charRole}> · {CHARACTER_ROLE}</Text>
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
            {GIFT_MARKERS.map((point) => (
              <View key={point} style={[styles.barDivider, { left: `${point}%` }]} />
            ))}
          </View>
        </View>
        <View style={styles.affinityMarkerRow}>
          <View style={styles.affinityMarkerSpacer} />
          <View style={styles.affinityMarkerTrack}>
            {GIFT_MARKERS.map((point) => {
              const unlocked = affinity >= point;
              return (
                <View key={point} style={[styles.affinityMarkerItem, { left: `${point}%` }]}>
                  <Ionicons
                    name={unlocked ? 'heart' : 'heart-outline'}
                    size={14}
                    color={unlocked ? '#F6A3A6' : '#C8C8C8'}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 말풍선 + 입력창 */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              sender={item.sender}
              time={timeStr}
              character_id={CHARACTER_ID}
              action_description={item.action_description || undefined}
              isNew={true}
            />
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.hintRow}>
          <TouchableOpacity onPress={() => setShowHintModal(true)} style={styles.hintBtn}>
            <Ionicons name="bulb-outline" size={18} color="#888" />
            <Text style={styles.hintBtnText}>힌트 보기</Text>
          </TouchableOpacity>
        </View>
        <InputBar
          inputRef={inputRef}
          value={inputText}
          onChangeText={setInputText}
          onSend={() => {}}
          disabled={false}
        />
      </KeyboardAvoidingView>

      <MissionDrawer
        visible={showMission}
        onClose={() => { setShowMission(false); setChatStarted(true); }}
        onGoReport={() => setShowMission(false)}
        stageName={stageName}
        missions={missions}
      />

      <PenaltyPopup
        visible={popup.visible}
        popupType={popup.currentType}
        penaltyPoints={popup.penaltyPoints}
        onClose={popup.hide}
      />

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
  backBtn: { padding: 4, marginRight: 8 },
  charName: { flex: 1, fontSize: 22, fontWeight: '700', color: '#0B0B12' },
  charRole: { fontSize: 18, fontWeight: '400', color: '#888888' },
  affinitySection: { paddingHorizontal: 16, marginBottom: 4 },
  affinityRow: { flexDirection: 'row', alignItems: 'center' },
  affinityPercent: { fontSize: 13, fontWeight: '600', color: '#888888', width: 36, marginRight: 8 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#F6A3A6', borderRadius: 4 },
  barDivider: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(255,255,255,0.7)' },
  affinityMarkerRow: { flexDirection: 'row', marginTop: 6 },
  affinityMarkerSpacer: { width: 44 },
  affinityMarkerTrack: { flex: 1, position: 'relative', height: 28 },
  affinityMarkerItem: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -10 }] },
  menuBtnWrapper: { position: 'relative' },
  missionBadge: {
    position: 'absolute', top: -4, right: -6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F6A3A6',
    justifyContent: 'center', alignItems: 'center',
  },
  missionBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  hintRow: { paddingHorizontal: 16, paddingBottom: 4 },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintBtnText: { fontSize: 13, color: '#888', fontWeight: '500' },
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
});
