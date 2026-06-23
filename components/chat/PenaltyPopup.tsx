import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type PopupType =
  | 'pronunciation_error'
  | 'repetitive_phrases'
  | 'off_topic'
  | 'korean_mixed'
  | 'grammar_error'
  | 'affection_good'
  | 'affection_perfect';

interface PopupConfig {
  title: string;
  description: string;
  footer: string;
  type: 'penalty' | 'affection';
}

const POPUP_CONFIGS: Record<PopupType, PopupConfig> = {
  pronunciation_error: {
    title: '발음 주의!',
    description: '방금 부분은 발음이 조금 뭉개졌어요.\n단어를 조금 더 명확하게 끊어서 말해볼까요?',
    footer: '시스템 페널티 적용 (다시 말하기를 시도해보세요!)',
    type: 'penalty',
  },
  repetitive_phrases: {
    title: '표현이 중복되었어요!',
    description: '짧은 시간 동안 같은 표현를 자주 사용하셨어요.\n조금 더 다양한 표현을 섞어 대화해 보세요!',
    footer: '어휘 다양성 점수 감점',
    type: 'penalty',
  },
  off_topic: {
    title: '어라, 질문과 다른 대답이에요!',
    description: '상대방의 질문 흐름과 맞지 않는 답변이에요.\n대화 맥락을 다시 한번 확인해 볼까요?',
    footer: '대화 집중도 페널티 부여',
    type: 'penalty',
  },
  korean_mixed: {
    title: '한국어는 잠깐 넣어둘까요?',
    description: '영어로만 대화를 이어가면 실력이 더 빠르게 늘어요!\n다음 답변은 영어로만 도전해 보세요.',
    footer: '대화 집중도 페널티 부여',
    type: 'penalty',
  },
  grammar_error: {
    title: '문장을 다시 살펴봐요!',
    description: '문법이 조금 어긋났어요.\n올바른 문장으로 다시 한번 시도해 볼까요?',
    footer: '문법 점수 감점',
    type: 'penalty',
  },
  affection_good: {
    title: '호감도 상승!',
    description: '센스 있는 답변으로 상대방의 기분이 좋아졌습니다.\n대화가 아주 매끄럽게 이어지고 있어요!',
    footer: '',
    type: 'affection',
  },
  affection_perfect: {
    title: '완벽한 티키타카!',
    description: '자연스러운 발음과 답변으로 호감을 얻었습니다.\n지금 페이스를 유지하세요!',
    footer: '',
    type: 'affection',
  },
};

interface PenaltyPopupProps {
  visible: boolean;
  popupType: PopupType;
  onClose: () => void;
  penaltyPoints?: number;
}

// ─────────────────────────────────────────
// Modal 없는 오버레이 팝업 — Android 키보드 버그 방지
// ─────────────────────────────────────────
export default function PenaltyPopup({
  visible,
  popupType,
  onClose,
  penaltyPoints,
}: PenaltyPopupProps) {
  const config = POPUP_CONFIGS[popupType];
  const isPenalty = config.type === 'penalty';

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // visible=false면 렌더 자체를 안 함 (Modal 없으므로 키보드에 영향 없음)
  if (!visible) return null;

  return (
    // Modal 대신 absolute View로 화면 전체 덮기
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <View style={styles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.iconBadge, isPenalty ? styles.iconBadgePenalty : styles.iconBadgeAffection]}>
              <Ionicons
                name={isPenalty ? 'alert-circle' : 'heart'}
                size={20}
                color={isPenalty ? 'rgba(255,77,90,0.9)' : 'rgba(246,163,166,0.9)'}
              />
            </View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isPenalty ? styles.titlePenalty : styles.titleAffection]}>
                {config.title}
              </Text>
              {!isPenalty && penaltyPoints !== undefined && (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{penaltyPoints} pts</Text>
                </View>
              )}
              {isPenalty && penaltyPoints !== undefined && (
                <View style={[styles.pointsBadge, styles.pointsBadgePenalty]}>
                  <Text style={[styles.pointsText, styles.pointsTextPenalty]}>
                    -{penaltyPoints} pts
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.description}>{config.description}</Text>

          {config.footer ? (
            <>
              <View style={styles.divider} />
              <Text style={[styles.footer, isPenalty ? styles.footerPenalty : styles.footerAffection]}>
                {config.footer}
              </Text>
            </>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.closeBtn, isPenalty ? styles.closeBtnPenalty : styles.closeBtnAffection]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>확인</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── 편의 훅 ─────────────────────────────
export function usePenaltyPopup() {
  const [visible, setVisible] = useState(false);
  const [currentType, setCurrentType] = useState<PopupType>('off_topic');
  const [penaltyPoints, setPenaltyPoints] = useState<number | undefined>();

  const show = useCallback((type: PopupType, points?: number) => {
    setCurrentType(type);
    setPenaltyPoints(points);
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return { visible, currentType, penaltyPoints, show, hide };
}

// ─── 스타일 ──────────────────────────────
const styles = StyleSheet.create({
  // Modal 대신 absolute overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,  // 부모(SafeAreaView) 전체를 덮음
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    width: SCREEN_WIDTH * 0.84,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 12, gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  iconBadgePenalty:   { backgroundColor: 'rgba(255,77,90,0.12)' },
  iconBadgeAffection: { backgroundColor: 'rgba(246,163,166,0.15)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  titlePenalty:   { color: COLORS.error },
  titleAffection: { color: COLORS.subColor3 },
  pointsBadge: { backgroundColor: 'rgba(246,163,166,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pointsBadgePenalty: { backgroundColor: 'rgba(255,77,90,0.1)' },
  pointsText: { fontSize: 13, fontWeight: '700', color: COLORS.subColor3 },
  pointsTextPenalty: { color: COLORS.error },
  description: { fontSize: 14, color: '#444', lineHeight: 21 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  footer: { fontSize: 12, fontWeight: '600' },
  footerPenalty:   { color: COLORS.error },
  footerAffection: { color: COLORS.primary },
  closeBtn: { marginHorizontal: 22, marginBottom: 18, marginTop: 6, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  closeBtnPenalty:   { backgroundColor: COLORS.error },
  closeBtnAffection: { backgroundColor: COLORS.primary },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});