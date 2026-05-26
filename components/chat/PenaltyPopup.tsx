import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 팝업 타입 정의
export type PopupType =
  | 'pronunciation_error'   // 발음 미스
  | 'repetitive_phrases'    // 반복 표현
  | 'off_topic'             // 동문서답
  | 'affection_good'        // 호감도 상승 (일반)
  | 'affection_perfect';    // 호감도 상승 (완벽)

interface PopupConfig {
  title: string;
  description: string;
  footer: string;
  type: 'penalty' | 'affection';
  points?: string;          // 호감도용 포인트 표시
}

const POPUP_CONFIGS: Record<PopupType, PopupConfig> = {
  pronunciation_error: {
    title: '⚠️ 발음 주의!',
    description:
      '방금 부분은 발음이 조금 뭉개졌어요. 단어를 조금 더 명확하게 끊어서 말해볼까요?',
    footer: '시스템 페널티 적용 (다시 말하기를 시도해보세요!)',
    type: 'penalty',
  },
  repetitive_phrases: {
    title: '⚠️ 표현이 중복되었어요!',
    description:
      '짧은 시간 동안 같은 단어(표현)를 너무 자주 사용하셨어요. 조금 더 다양한 표현을 섞어 대화해 보세요!',
    footer: '어휘 다양성 점수 감점',
    type: 'penalty',
  },
  off_topic: {
    title: '⚠️ 어라, 질문과 다른 대답이에요!',
    description:
      '상대방(강사님)의 질문 흐름과 맞지 않는 답변을 선택하셨어요. 대화 맥락을 다시 한번 확인해 볼까요?',
    footer: '대화 집중도 페널티 부여',
    type: 'penalty',
  },
  affection_good: {
    title: '❤️ 호감도 상승!',
    description:
      '센스 있는 답변 덕분에 상대방의 기분이 좋아졌습니다. 대화가 아주 매끄럽게 이어지고 있어요!',
    footer: '',
    type: 'affection',
    points: '+5 pts',
  },
  affection_perfect: {
    title: '✨ 완벽한 티키타카!',
    description:
      '자연스러운 발음과 찰떡같은 답변으로 상대방의 호감을 샀습니다. 지금 페이스를 유지하세요!',
    footer: '',
    type: 'affection',
    points: '+10 pts',
  },
};

interface PenaltyPopupProps {
  visible: boolean;
  popupType: PopupType;
  onClose: () => void;
  /** 호감도 감점 표시용 (페널티 팝업에서 affection_change 음수값) */
  penaltyPoints?: number;
}

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
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            isPenalty ? styles.cardPenalty : styles.cardAffection,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* 상단 색상 바 */}
          <View style={[styles.topBar, isPenalty ? styles.topBarPenalty : styles.topBarAffection]} />

          {/* 컨텐츠 */}
          <View style={styles.content}>
            {/* 타이틀 + 포인트 */}
            <View style={styles.titleRow}>
              <Text style={[styles.title, isPenalty ? styles.titlePenalty : styles.titleAffection]}>
                {config.title}
              </Text>
              {config.points && (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{config.points}</Text>
                </View>
              )}
              {isPenalty && penaltyPoints !== undefined && (
                <View style={[styles.pointsBadge, styles.pointsBadgePenalty]}>
                  <Text style={[styles.pointsText, styles.pointsTextPenalty]}>
                    {penaltyPoints > 0 ? `-${penaltyPoints}` : penaltyPoints} pts
                  </Text>
                </View>
              )}
            </View>

            {/* 설명 */}
            <Text style={styles.description}>{config.description}</Text>

            {/* 구분선 */}
            {config.footer ? (
              <>
                <View style={styles.divider} />
                <Text style={[styles.footer, isPenalty ? styles.footerPenalty : styles.footerAffection]}>
                  {config.footer}
                </Text>
              </>
            ) : null}
          </View>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={[styles.closeBtn, isPenalty ? styles.closeBtnPenalty : styles.closeBtnAffection]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── 편의 훅: 팝업 표시 상태 관리 ───────────────────────────────────────────
import { useState, useCallback } from 'react';

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

// ─── 스타일 ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
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
  cardPenalty: {
    borderWidth: 1,
    borderColor: '#FFE0E6',
  },
  cardAffection: {
    borderWidth: 1,
    borderColor: '#D4F5D4',
  },

  topBar: {
    height: 6,
    width: '100%',
  },
  topBarPenalty: {
    backgroundColor: '#FF6B8A',
  },
  topBarAffection: {
    backgroundColor: '#4CD97B',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  titlePenalty: {
    color: '#D63060',
  },
  titleAffection: {
    color: '#1DAA55',
  },

  pointsBadge: {
    backgroundColor: '#E8F9EE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pointsBadgePenalty: {
    backgroundColor: '#FFF0F3',
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1DAA55',
  },
  pointsTextPenalty: {
    color: '#D63060',
  },

  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  footer: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerPenalty: {
    color: '#FF6B8A',
  },
  footerAffection: {
    color: '#1DAA55',
  },

  closeBtn: {
    marginHorizontal: 22,
    marginBottom: 18,
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnPenalty: {
    backgroundColor: '#FF6B8A',
  },
  closeBtnAffection: {
    backgroundColor: '#4CD97B',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});