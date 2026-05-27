import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Modal, Pressable,
  Platform, Dimensions, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

const STAGE_DATA = [
  { id: 1, stageLabel: 'Stage 1-1', title: '카페에서 생긴 일',    hint: '첫 번째 에피소드',    isLocked: false },
  { id: 2, stageLabel: 'Stage 1-2', title: '취향 저격',           hint: '좋아하는 에스프레소',    isLocked: false },
  { id: 3, stageLabel: 'Stage 2-1', title: '뜻밖의 공통점',       hint: '취미 공유 바이브',       isLocked: true  },
  { id: 4, stageLabel: 'Stage 2-2', title: '깊어지는 밤',         hint: '비밀스러운 고백 타임',   isLocked: true  },
  { id: 5, stageLabel: 'Stage 3-1', title: '흔들리는 마음',       hint: '설레임이 시작되는 순간', isLocked: true  },
  { id: 6, stageLabel: 'Stage 3-2', title: '결정적 순간',         hint: '선택의 기로에서',        isLocked: true  },
];

// 지그재그 비율 밸런스 조정
const X_RATIOS  = [0.35, 0.65, 0.25, 0.70, 0.35, 0.65];
const NODE_SIZE = 72;
const ROW_H     = 140; 
const PAD_H     = 30;  

type Stage = typeof STAGE_DATA[0];

function nodeCenter(index: number) {
  const x = (SCREEN_W - 32) * X_RATIOS[index]; 
  const y = PAD_H + ROW_H * index + NODE_SIZE / 2;
  return { x, y };
}

// ─── [수정] 하트 노드 컴포넌트 (나사 레이아웃 완전 폐기) ──────────────────
function HeartNode({
  stage, index, onPress,
}: {
  stage: Stage; index: number; onPress: (s: Stage) => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 55,
      friction: 7,
    }).start();
  }, []);

  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 1] });
  const center  = nodeCenter(index);

  return (
    <Animated.View
      style={[
        styles.nodeAbsolute,
        {
          left:      center.x - NODE_SIZE / 2,
          top:       center.y - NODE_SIZE / 2,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onPress(stage)}
        style={[
          styles.heartNodeBtn,
          stage.isLocked ? styles.nodeLocked : styles.nodeUnlocked,
        ]}
      >
        {stage.isLocked ? (
          // 잠긴 노드도 투박한 자물쇠 대신 톤다운된 미니 하트로 교체하여 디자인 일체감 부여
          <Ionicons name="heart-outline" size={24} color="#E0E0E0" />
        ) : (
          <Ionicons name="heart" size={28} color="#F6A3A6" />
        )}
      </TouchableOpacity>

      {/* 스테이지 번호 뱃지 가독성 업그레이드 */}
      <View style={[styles.stageBadge, stage.isLocked && styles.stageBadgeLocked]}>
        <Text style={[styles.stageBadgeTxt, stage.isLocked && styles.stageBadgeTxtLocked]}>
          {stage.stageLabel}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── [수정] 연결선 컴포넌트 (하트 도트 패스 연출) ──────────────────────
function ConnectLine({ fromIndex, toIndex, nextIsLocked }: { fromIndex: number; toIndex: number; nextIsLocked: boolean }) {
  const from = nodeCenter(fromIndex);
  const to   = nodeCenter(toIndex);

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
    <View
      style={[
        styles.connectLineContainer,
        {
          left:   startX,
          top:    startY,
          width:  lineLen,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    >
      {/* 배경과 스무스하게 이어지는 도트-하트 라인 트랙 */}
      <View style={[styles.lineTrack, nextIsLocked && styles.lineTrackLocked]} />
      <View style={styles.dotHeartOverlayRow}>
        <Text style={[styles.dotText, nextIsLocked && styles.dotTextLocked]}>• •</Text>
        <Ionicons name="heart" size={10} color={nextIsLocked ? "#E0E0E0" : "#F6A3A6"} />
        <Text style={[styles.dotText, nextIsLocked && styles.dotTextLocked]}>• •</Text>
      </View>
    </View>
  );
}

// ─── 메인 스크린 ────────────────────────────────────────────────────────
export default function StageScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams();
  const charName = (params.name as string) || '서태양';

  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const totalH = PAD_H + ROW_H * STAGE_DATA.length + 60;

  return (
    <SafeAreaView style={styles.container}>

      {/* 헤더 바 영역 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0B0B12" />
          <Text style={styles.backLabel}>뒤로가기</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{charName}의 스토리</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* 실시간 패스 연출 맵 */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.mapScrollView}>
        <View style={[styles.mapCanvas, { height: totalH }]}>

          {/* 연결선 먼저 배치 (z-index: 1) */}
          {STAGE_DATA.map((stage, i) =>
            i < STAGE_DATA.length - 1 ? (
              <ConnectLine 
                key={`line-${i}`} 
                fromIndex={i} 
                toIndex={i + 1} 
                nextIsLocked={STAGE_DATA[i + 1].isLocked}
              />
            ) : null
          )}

          {/* 상위 인터랙션 노드 배치 (z-index: 5) */}
          {STAGE_DATA.map((stage, i) => (
            <HeartNode key={stage.id} stage={stage} index={i} onPress={setActiveStage} />
          ))}

        </View>
      </ScrollView>

      {/* 완벽 화이트 스킨 모달 윈도우 */}
      <Modal
        visible={activeStage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveStage(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setActiveStage(null)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>

            <View style={[styles.modalIconBadge, { backgroundColor: activeStage?.isLocked ? '#F5F5F5' : '#FFF0F1' }]}>
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
                ? '아직 호감도가 부족합니다.\n이전 에피소드에서 하트를 더 획득해보세요!'
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
  );
}

// ─── [수정 및 검수] 하트-점선 트랙 전용 스타일시트 ──────────────────────
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#F8F9FA',
    backgroundColor: '#FFFFFF',
  },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 2, width: 80 },
  backLabel:   { fontSize: 15, fontWeight: '600', color: '#0B0B12' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0B0B12' },

  mapScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapCanvas: {
    position: 'relative',
    paddingHorizontal: 16,
  },

  // 💎 수평 정렬 후 각도 회전 기법을 통한 하트 융합형 커넥트 트랙 구조
  connectLineContainer: {
    position: 'absolute',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    transformOrigin: '0px 10px', // 컴포넌트 정중앙 축 회전 고정 보정
  },
  lineTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#F6A3A6',
    opacity: 0.3,
  },
  lineTrackLocked: {
    backgroundColor: '#E0E0E0',
    opacity: 0.4,
  },
  dotHeartOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  dotText: {
    fontSize: 10,
    color: '#F6A3A6',
    fontWeight: '700',
    letterSpacing: 1,
    bottom: 1,
  },
  dotTextLocked: {
    color: '#E0E0E0',
  },

  // 노드 스타일시트 최적화
  nodeAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  heartNodeBtn: {
    width:        NODE_SIZE,
    height:       NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems:   'center',
    borderWidth:  3,
    backgroundColor: '#FFFFFF',
    shadowColor:  '#F6A3A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation:    4,
  },
  nodeUnlocked: { 
    borderColor: '#F6A3A6' 
  },
  nodeLocked: { 
    borderColor: '#E0E0E0', 
    backgroundColor: '#FCFCFC', 
    shadowColor: '#000', 
    shadowOpacity: 0.03 
  },

  stageBadge: {
    marginTop: 8,
    backgroundColor: '#F6A3A6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  stageBadgeLocked:   { backgroundColor: '#E0E0E0' },
  stageBadgeTxt:      { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  stageBadgeTxtLocked:{ color: '#AAAAAA' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11,11,18,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  modalIconBadge: {
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  modalStageLabel: { fontSize: 13, fontWeight: '700', color: '#FF9F43', marginBottom: 6 },
  modalTitle:      { fontSize: 21, fontWeight: '800', color: '#0B0B12', marginBottom: 6, textAlign: 'center' },
  modalSub:        { fontSize: 14, color: '#616161', marginBottom: 14 },
  modalDesc:       { fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 20, marginBottom: 26 },

  modalBtnRow:       { flexDirection: 'row', width: '100%', gap: 10 },
  modalBtn:          { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalBtnCancel:    { backgroundColor: '#EEF2F6' },
  modalBtnChat:      { backgroundColor: '#EEF2F6' },
  modalBtnVoice:     { backgroundColor: '#F6A3A6' },
  modalBtnCancelTxt: { fontSize: 14, fontWeight: '700', color: '#2C3A5F' },
  modalBtnChatTxt:   { fontSize: 14, fontWeight: '700', color: '#2C3A5F' },
  modalBtnVoiceTxt:  { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});