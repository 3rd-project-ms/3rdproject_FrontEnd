import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Modal, Pressable,
  Platform, Dimensions, Animated, ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── 배경 이미지 매핑 ────────────────────────────────────────────────────
const STAGE_BACKGROUNDS: Record<string, any> = {
  '서핑 강사': require('../../assets/stage/beach_stage.png'),
  '대학원 선배': require('../../assets/stage/school_stage.png'),
  '카페 사장님': require('../../assets/stage/cafe_stage.png'),
};

// ─── 호감도 설정 ──────────────────────────────────────────────────────────
const AFFINITY_PER_STAGE = 10;
const SPECIAL_UNLOCK_1   = 40;
const SPECIAL_UNLOCK_2   = 80;

// ─── 스테이지 데이터 ──────────────────────────────────────────────────────
const MAIN_STAGES = [
  { id: 1, stageLabel: 'Stage 1', title: '카페에서 생긴 일',  hint: '첫 번째 에피소드',         isSpecial: false },
  { id: 2, stageLabel: 'Stage 2', title: '취향 저격',         hint: '좋아하는 에스프레소',       isSpecial: false },
  { id: 3, stageLabel: 'Stage 3', title: '뜻밖의 공통점',     hint: '취미 공유 바이브',          isSpecial: false },
  { id: 4, stageLabel: 'Stage 4', title: '깊어지는 밤',       hint: '비밀스러운 고백 타임',      isSpecial: false },
  { id: 5, stageLabel: 'Stage 5', title: '흔들리는 마음',     hint: '설레임이 시작되는 순간',    isSpecial: false },
  { id: 6, stageLabel: 'Stage 6', title: '결정적 순간',       hint: '선택의 기로에서',           isSpecial: false },
  { id: 7, stageLabel: 'Stage 7', title: '약속',              hint: '다시 만나고 싶은 사람',     isSpecial: false },
  { id: 8, stageLabel: 'Stage 8', title: '우리 사이',         hint: '이게 사랑인 걸까',          isSpecial: false },
];

const SPECIAL_STAGES = [
  { id: 9,  stageLabel: 'Special 1', title: '달빛 아래서', hint: '호감도 40% 달성 보상', isSpecial: true, unlockAt: SPECIAL_UNLOCK_1 },
  { id: 10, stageLabel: 'Special 2', title: '둘만의 시간', hint: '호감도 80% 달성 보상', isSpecial: true, unlockAt: SPECIAL_UNLOCK_2 },
];

type AnyStage = (typeof MAIN_STAGES[0] | typeof SPECIAL_STAGES[0]) & {
  isLocked: boolean;
  affinityRequired?: number;
};

// ─── 레이아웃 상수 ────────────────────────────────────────────────────────
const X_RATIOS  = [0.35, 0.65, 0.25, 0.70, 0.35, 0.65, 0.25, 0.70];
const NODE_SIZE = 68;
const SPECIAL_NODE_SIZE = 60;
const ROW_H     = 130;
const PAD_H     = 24;

function nodeCenter(index: number) {
  const x = (SCREEN_W - 32) * X_RATIOS[index % X_RATIOS.length];
  const y = PAD_H + ROW_H * index + NODE_SIZE / 2;
  return { x, y };
}

function specialNodeCenter(unlockAt: number) {
  if (unlockAt === SPECIAL_UNLOCK_1) {
    const x = (SCREEN_W - 32) * 0.90;
    const y = PAD_H + ROW_H * 2.2 + NODE_SIZE / 2;
    return { x, y };
  } else {
    const x = (SCREEN_W - 32) * 0.20;
    const y = PAD_H + ROW_H * 5.2 + NODE_SIZE / 2;
    return { x, y };
  }
}

function buildStageList(affinity: number): AnyStage[] {
  const mainList: AnyStage[] = MAIN_STAGES.map((s, i) => ({
    ...s,
    isLocked: affinity < i * AFFINITY_PER_STAGE,
  }));
  const specialList: AnyStage[] = SPECIAL_STAGES.map((s) => ({
    ...s,
    isLocked: affinity < s.unlockAt,
    affinityRequired: s.unlockAt,
  }));
  return [...mainList, ...specialList];
}

// ─── 메인 하트 노드 ───────────────────────────────────────────────────────
function HeartNode({ stage, index, onPress }: {
  stage: AnyStage; index: number; onPress: (s: AnyStage) => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay: index * 80, useNativeDriver: true, tension: 55, friction: 7 }).start();
  }, []);
  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 1] });
  const center  = nodeCenter(index);

  return (
    <Animated.View style={[styles.nodeAbsolute, {
      left: center.x - NODE_SIZE / 2, top: center.y - NODE_SIZE / 2,
      transform: [{ scale }], opacity,
    }]}>
      <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(stage)}
        style={[styles.heartNodeBtn, stage.isLocked ? styles.nodeLocked : styles.nodeUnlocked]}>
        {stage.isLocked
          ? <Ionicons name="lock-closed" size={22} color="#C8C8C8" />
          : <Ionicons name="heart"       size={26} color="#F6A3A6" />}
      </TouchableOpacity>
      <View style={[styles.stageBadge, stage.isLocked && styles.stageBadgeLocked]}>
        <Text style={[styles.stageBadgeTxt, stage.isLocked && styles.stageBadgeTxtLocked]}>
          {stage.stageLabel}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── 스페셜 노드 ──────────────────────────────────────────────────────────
function SpecialNode({ stage, onPress }: {
  stage: AnyStage; onPress: (s: AnyStage) => void;
}) {
  const anim   = useRef(new Animated.Value(0)).current;
  const unlockAt = (stage as any).unlockAt as number;
  const center = specialNodeCenter(unlockAt);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, []);

  const scale   = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.15, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });

  return (
    <Animated.View style={[styles.nodeAbsolute, {
      left: center.x - SPECIAL_NODE_SIZE / 2,
      top:  center.y - SPECIAL_NODE_SIZE / 2,
      transform: [{ scale }],
      opacity,
      zIndex: 6,
    }]}>
      <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(stage)}
        style={styles.specialNodeBtn}>
        <Ionicons name="heart" size={24} color="#F6A3A6" />
      </TouchableOpacity>
      <View style={styles.specialNodeBadge}>
        <Text style={styles.specialNodeBadgeTxt}>{stage.stageLabel}</Text>
      </View>
    </Animated.View>
  );
}

// ─── 연결선 ───────────────────────────────────────────────────────────────
function ConnectLine({ fromIndex, toIndex, nextIsLocked }: {
  fromIndex: number; toIndex: number; nextIsLocked: boolean;
}) {
  const from   = nodeCenter(fromIndex);
  const to     = nodeCenter(toIndex);
  const dx     = to.x - from.x;
  const dy     = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle  = Math.atan2(dy, dx) * (180 / Math.PI);
  const margin = NODE_SIZE / 2 + 2;
  const ratio  = margin / length;
  const startX = from.x + dx * ratio;
  const startY = from.y + dy * ratio;
  const lineLen = length - margin * 2;

  return (
    <View style={[styles.connectLineContainer, {
      left: startX, top: startY, width: lineLen,
      transform: [{ rotate: `${angle}deg` }],
    }]}>
      <View style={[styles.lineTrack, nextIsLocked && styles.lineTrackLocked]} />
      <View style={styles.dotHeartOverlayRow}>
        <Text style={[styles.dotText, nextIsLocked && styles.dotTextLocked]}>• •</Text>
        <Ionicons name="heart" size={9} color={nextIsLocked ? '#E0E0E0' : '#F6A3A6'} />
        <Text style={[styles.dotText, nextIsLocked && styles.dotTextLocked]}>• •</Text>
      </View>
    </View>
  );
}

// ─── 호감도 바 ────────────────────────────────────────────────────────────
function AffinityBar({ affinity }: { affinity: number }) {
  const animW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animW, { toValue: affinity, duration: 800, useNativeDriver: false }).start();
  }, [affinity]);

  const widthPct = animW.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  const BAR_SIDE_PAD = 20;
  const barW = SCREEN_W - BAR_SIDE_PAD * 2;
  const marker1X = barW * 0.4;
  const marker2X = barW * 0.8;

  return (
    <View style={styles.affinityWrapper}>
      <View style={styles.affinityLabelRow}>
        <Text style={styles.affinityLabel}>호감도</Text>
        <Text style={styles.affinityValue}>{affinity}%</Text>
      </View>
      <View style={styles.affinityTrack}>
        <Animated.View style={[styles.affinityFill, { width: widthPct }]} />
      </View>
      <View style={styles.affinityMarkerRow}>
        <View style={[styles.affinityMarkerGroup, { left: marker1X - 7 }]}>
          <Ionicons
            name={affinity >= SPECIAL_UNLOCK_1 ? 'heart' : 'heart-outline'}
            size={14}
            color={affinity >= SPECIAL_UNLOCK_1 ? '#F6A3A6' : '#C8C8C8'}
          />
        </View>
        <View style={[styles.affinityMarkerGroup, { left: marker2X - 7 }]}>
          <Ionicons
            name={affinity >= SPECIAL_UNLOCK_2 ? 'heart' : 'heart-outline'}
            size={14}
            color={affinity >= SPECIAL_UNLOCK_2 ? '#F6A3A6' : '#C8C8C8'}
          />
        </View>
      </View>
    </View>
  );
}

// ─── 메인 스크린 ──────────────────────────────────────────────────────────
export default function StageScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams();
  const charName = (params.name as string) || '서태양';
  const charRole = (params.role as string) || '서핑 강사';

  // 배경 이미지 — role 기준 분기, 매핑 없으면 beach 기본
  const bgImage = STAGE_BACKGROUNDS[charRole] ?? STAGE_BACKGROUNDS['서핑 강사'];

  // TODO: Zustand에서 실제 호감도 주입
  const [affinity, setAffinity] = useState<number>(50);
  const [activeStage, setActiveStage] = useState<AnyStage | null>(null);

  const stageList    = buildStageList(affinity);
  const mainNodes    = stageList.slice(0, 8);
  const specialNodes = stageList.slice(8);

  const totalH = PAD_H + ROW_H * mainNodes.length + 60;

  return (
    <ImageBackground
      source={bgImage}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* 전체 어둠 오버레이 — 노드/텍스트 가독성 확보 */}
      <View style={styles.bgOverlay} />

      <SafeAreaView style={styles.container}>

        {/* 헤더 — 반투명 블러 느낌 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={styles.backLabel}>뒤로가기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{charName}의 스토리</Text>
          <View style={{ width: 80 }} />
        </View>

        {/* 호감도 바 */}
        <AffinityBar affinity={affinity} />

        {/* 맵 */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mapScrollView}>
          <View style={[styles.mapCanvas, { height: totalH }]}>

            {/* 연결선 */}
            {mainNodes.map((_, i) =>
              i < mainNodes.length - 1 ? (
                <ConnectLine
                  key={`line-${i}`}
                  fromIndex={i}
                  toIndex={i + 1}
                  nextIsLocked={mainNodes[i + 1].isLocked}
                />
              ) : null
            )}

            {/* 메인 노드 */}
            {mainNodes.map((stage, i) => (
              <HeartNode key={stage.id} stage={stage} index={i} onPress={setActiveStage} />
            ))}

            {/* 스페셜 노드 */}
            {specialNodes.map((stage) =>
              !stage.isLocked ? (
                <SpecialNode key={stage.id} stage={stage} onPress={setActiveStage} />
              ) : null
            )}

          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 모달 */}
        <Modal
          visible={activeStage !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveStage(null)}
        >
          <Pressable style={styles.overlay} onPress={() => setActiveStage(null)}>
            <Pressable style={styles.modalBox} onPress={() => {}}>

              <View style={[styles.modalIconBadge, {
                backgroundColor: activeStage?.isLocked
                  ? '#F5F5F5'
                  : '#FFF0F1',
              }]}>
                <Ionicons
                  name={activeStage?.isLocked ? 'lock-closed' : 'heart'}
                  size={26}
                  color={activeStage?.isLocked ? '#AAAAAA' : '#F6A3A6'}
                />
              </View>

              <Text style={styles.modalStageLabel}>{activeStage?.stageLabel}</Text>
              <Text style={styles.modalTitle}>{activeStage?.title}</Text>
              <Text style={styles.modalSub}>{activeStage?.hint}</Text>
              <Text style={styles.modalDesc}>
                {activeStage?.isLocked
                  ? `아직 호감도가 부족합니다.\n이전 에피소드에서 하트를 더 획득해보세요!`
                  : '해당 에피소드 스토리로 바로 이동하시겠습니까?'}
              </Text>

              {activeStage?.isLocked ? (
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel, { width: '100%' }]}
                  onPress={() => setActiveStage(null)}
                >
                  <Text style={styles.modalBtnCancelTxt}>돌아가기</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnChat]}
                    onPress={() => {
                      setActiveStage(null);
                      router.push({ pathname: '/(main)/chat-text' as any, params: { name: charName } });
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={15} color="#2C3A5F" style={{ marginRight: 4 }} />
                    <Text style={styles.modalBtnChatTxt}>채팅하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnVoice]}
                    onPress={() => {
                      setActiveStage(null);
                      router.push({ pathname: '/(main)/chat-voice' as any, params: { name: charName } });
                    }}
                  >
                    <Ionicons name="videocam" size={15} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.modalBtnVoiceTxt}>영상통화하기</Text>
                  </TouchableOpacity>
                </View>
              )}

            </Pressable>
          </Pressable>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── 배경 ──
  bgImage: {
    flex: 1,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── 헤더 ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.20)',
    zIndex: 10,
  },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 2, width: 80 },
  backLabel:   { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },

  // ── 호감도 바 ──
  affinityWrapper: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    zIndex: 10,
  },
  affinityLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  affinityLabel:    { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  affinityValue:    { fontSize: 12, fontWeight: '800', color: '#F6A3A6' },
  affinityTrack: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'visible', position: 'relative',
  },
  affinityFill: { height: 10, backgroundColor: '#F6A3A6', borderRadius: 5 },
  affinityMarkerRow: { position: 'relative', height: 18, marginTop: 5 },
  affinityMarkerGroup: { position: 'absolute', alignItems: 'center' },

  // ── 맵 ──
  mapScrollView: { flex: 1 },
  mapCanvas:     { position: 'relative', paddingHorizontal: 16 },

  // ── 연결선 ──
  connectLineContainer: {
    position: 'absolute', height: 20, justifyContent: 'center', alignItems: 'center',
    zIndex: 1, transformOrigin: '0px 10px' as any,
  },
  lineTrack:       { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#F6A3A6', opacity: 0.5 },
  lineTrackLocked: { backgroundColor: '#FFFFFF', opacity: 0.25 },
  dotHeartOverlayRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, borderRadius: 10, gap: 4,
  },
  dotText:       { fontSize: 10, color: '#F6A3A6', fontWeight: '700', letterSpacing: 1, bottom: 1 },
  dotTextLocked: { color: 'rgba(255,255,255,0.35)' },

  // ── 메인 노드 ──
  nodeAbsolute: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  heartNodeBtn: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.90)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  nodeUnlocked: { borderColor: '#F6A3A6' },
  nodeLocked:   { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.55)', shadowOpacity: 0.1 },
  stageBadge:          { marginTop: 8, backgroundColor: '#F6A3A6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  stageBadgeLocked:    { backgroundColor: 'rgba(255,255,255,0.35)' },
  stageBadgeTxt:       { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  stageBadgeTxtLocked: { color: 'rgba(255,255,255,0.7)' },

  // ── 스페셜 노드 ──
  specialNodeBtn: {
    width: SPECIAL_NODE_SIZE, height: SPECIAL_NODE_SIZE, borderRadius: SPECIAL_NODE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#F6A3A6',
    backgroundColor: 'rgba(255,240,241,0.92)',
    shadowColor: '#F6A3A6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 7,
  },
  specialNodeBadge: {
    marginTop: 6, backgroundColor: '#F6A3A6',
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20,
  },
  specialNodeBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },

  // ── 모달 ──
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    width: '82%', backgroundColor: '#FFFFFF', borderRadius: 24,
    paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  modalIconBadge:    { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalStageLabel:   { fontSize: 13, fontWeight: '700', color: '#FF9F43', marginBottom: 6 },
  modalTitle:        { fontSize: 21, fontWeight: '800', color: '#0B0B12', marginBottom: 6, textAlign: 'center' },
  modalSub:          { fontSize: 14, color: '#616161', marginBottom: 14 },
  modalDesc:         { fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 20, marginBottom: 26 },
  modalBtnRow:       { flexDirection: 'row', width: '100%', gap: 10 },
  modalBtn:          { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalBtnCancel:    { backgroundColor: '#EEF2F6' },
  modalBtnChat:      { backgroundColor: '#EEF2F6' },
  modalBtnVoice:     { backgroundColor: '#F6A3A6' },
  modalBtnCancelTxt: { fontSize: 14, fontWeight: '700', color: '#2C3A5F' },
  modalBtnChatTxt:   { fontSize: 14, fontWeight: '700', color: '#2C3A5F' },
  modalBtnVoiceTxt:  { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});