import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export type TutorialStep =
  | 'intro'
  | 'controls'
  | 'recording'
  | 'keyboard'
  | 'start';

interface LevelTestTutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

const POINT = '#F43F5E';
const SAMPLE_QUESTION =
  'Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?';
const SAMPLE_ANSWER = "I'm going to study here for a semester.";
const WARNING_TEXT =
  '*답 제출 후 다음 문제로 넘어가면\n이전 문제로 돌아갈 수 없습니다.';

// 설명창 ↔ 버튼을 잇는 완전한 화살표(선 + 화살촉). 항상 둘을 연결한다.
function ConnDown({
  style,
  lineHeight,
}: {
  style: StyleProp<ViewStyle>;
  lineHeight: number;
}) {
  return (
    <View style={[styles.conn, style]}>
      <View style={[styles.connLine, { height: lineHeight }]} />
      <View style={styles.connHeadDown} />
    </View>
  );
}

function ConnUp({
  style,
  lineHeight,
}: {
  style: StyleProp<ViewStyle>;
  lineHeight: number;
}) {
  return (
    <View style={[styles.conn, style]}>
      <View style={styles.connHeadUp} />
      <View style={[styles.connLine, { height: lineHeight }]} />
    </View>
  );
}

export default function LevelTestTutorialOverlay({
  step,
  onNext,
  onSkip,
}: LevelTestTutorialOverlayProps) {
  // intro와 start(마지막)는 버튼으로만 진행, 그 사이 단계는 화면 터치로 진행.
  const advanceOnTap = step !== 'intro' && step !== 'start';
  const showSkip =
    step === 'intro' || step === 'controls' || step === 'recording' || step === 'keyboard';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      {/* 딤/블러는 풀스크린 (상태바·내비바 영역까지 덮음) */}
      {advanceOnTap ? (
        <Pressable style={styles.dimLayer} onPress={onNext} />
      ) : (
        <View style={styles.dimLayer} />
      )}

      {/* 주석 요소들은 안전영역만큼 오프셋해 본문과 정렬 */}
      <View
        style={[styles.insetLayer, { top: insets.top, bottom: insets.bottom }]}
        pointerEvents="box-none"
      >
      {showSkip && (
        <Pressable onPress={onSkip} style={styles.skipButton} hitSlop={8}>
          <Text style={styles.skipText}>튜토리얼 건너뛰기 ›</Text>
        </Pressable>
      )}

      {step === 'intro' && (
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>튜토리얼을 시작하겠습니다.</Text>
          <Pressable onPress={onNext} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>
              버튼을 터치하면 다음으로 넘어갑니다
            </Text>
          </Pressable>
        </View>
      )}

      {step === 'controls' && (
        <>
          {/* 질문 카드 강조 + 설명 (카드 아래, 위로 연결) */}
          <View style={styles.questionHighlight}>
            <Text style={styles.questionHighlightText}>{SAMPLE_QUESTION}</Text>
          </View>
          <ConnUp style={styles.cardConn} lineHeight={9} />
          <View style={[styles.descBox, styles.cardDescBox]}>
            <Text style={styles.descText}>
              현재 문제 지문 확인,{'\n'}음성으로 2번 반복하여 들려줍니다.
            </Text>
          </View>

          {/* 마이크 설명 (위) → 버튼으로 연결 */}
          <View style={[styles.descBox, styles.micDescBox]}>
            <Text style={styles.descText}>마이크 버튼을 눌러 음성 녹음 시작</Text>
          </View>
          <ConnDown style={styles.micConn} lineHeight={64} />
          <View style={styles.micHighlight}>
            <View style={styles.micReplica}>
              <Ionicons name="mic" size={34} color={COLORS.gray0} />
            </View>
          </View>

          {/* 키보드 설명 (위) → 버튼으로 연결 */}
          <View style={[styles.descBox, styles.keyboardDescBox]}>
            <Text style={styles.descText}>키보드 버튼을 눌러 키보드로 입력</Text>
          </View>
          <ConnDown style={styles.keyboardConn} lineHeight={19} />
          <View style={styles.keyboardHighlight}>
            <View style={styles.keyboardReplica}>
              <Ionicons name="keypad" size={24} color={COLORS.gray0} />
            </View>
          </View>
        </>
      )}

      {step === 'recording' && (
        <>
          {/* 진행바: dim 위에 다시 그려 잘 보이게 */}
          <View style={styles.progressBarReplica}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i < 2 && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.progressHighlight} />
          {/* 진행 숫자: 진행바 위쪽 */}
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>2/6</Text>
          </View>
          {/* 진행바 → 설명 (아래, 위로 연결) */}
          <ConnUp style={styles.progressConn} lineHeight={9} />
          <View style={[styles.descBox, styles.progressDescBox]}>
            <Text style={styles.descText}>현재까지 완료한 문제를 한 눈에 확인</Text>
          </View>

          {/* 중앙 경고 배너 */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>{WARNING_TEXT}</Text>
          </View>

          {/* 녹음 결과 카드 설명 (위) → 카드로 연결 */}
          <View style={[styles.descBox, styles.resultDescBox]}>
            <Text style={styles.descText}>녹음 결과를 여기서 확인</Text>
          </View>
          <ConnDown style={styles.resultConn} lineHeight={18} />
          <View style={styles.resultCardReplica}>
            <Text style={styles.resultCardText}>{SAMPLE_ANSWER}</Text>
          </View>

          {/* 정지 버튼 설명 (위) → 버튼으로 연결 */}
          <View style={[styles.descBox, styles.stopDescBox]}>
            <Text style={styles.descText}>
              녹음이 끝났다면 버튼을 눌러 음성녹음 중단,{'\n'}다음 문제로 넘어갑니다.
            </Text>
          </View>
          <ConnDown style={styles.stopConn} lineHeight={14} />
          <View style={styles.stopReplica}>
            <Ionicons name="square" size={26} color="#FF4F73" />
          </View>
        </>
      )}

      {step === 'keyboard' && (
        <>
          {/* 중앙 경고 배너 */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>{WARNING_TEXT}</Text>
          </View>

          {/* 입력 필드 설명 (위) → 입력필드로 연결 */}
          <View style={[styles.descBox, styles.inputDescBox]}>
            <Text style={styles.descText}>입력메세지 확인</Text>
          </View>
          <ConnDown style={styles.inputConn} lineHeight={13} />

          {/* 전송 버튼 설명 (위) → 전송버튼으로 연결 */}
          <View style={[styles.descBox, styles.sendDescBox]}>
            <Text style={styles.descText}>해당 버튼을 누르면 제출</Text>
          </View>
          <ConnDown style={styles.sendConn} lineHeight={13} />

          {/* 입력 행 복제본 */}
          <View style={styles.inputRowReplica}>
            <View style={styles.inputFieldReplica}>
              <TextInput
                editable={false}
                placeholder="메세지를 입력하세요 ..."
                placeholderTextColor={COLORS.gray0}
                style={styles.inputFieldText}
              />
            </View>
            <View style={styles.sendReplica}>
              <Ionicons name="arrow-up" size={24} color={COLORS.white} />
            </View>
          </View>
        </>
      )}

      {step === 'start' && (
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>🎉 그럼 테스트를 시작해볼까요?</Text>
          <Pressable onPress={onNext} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>레벨테스트 진행하기</Text>
          </Pressable>
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  dimLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(47, 47, 47, 0.45)',
  },
  // 안전영역만큼 오프셋된 주석 레이어 (top/bottom은 인라인 insets로 지정)
  insetLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

  // --- 건너뛰기 ---
  skipButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 30,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // --- 설명 박스 / 화살표 공통 ---
  descBox: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  descText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  conn: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  connLine: {
    width: 2,
    backgroundColor: POINT,
  },
  connHeadDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: POINT,
  },
  connHeadUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: POINT,
  },

  // --- 중앙 모달 ---
  modal: {
    position: 'absolute',
    top: '34%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 40,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B0B12',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#F6A3A6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // --- 중앙 경고 배너 ---
  warningBanner: {
    position: 'absolute',
    top: '36%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 25,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: POINT,
    textAlign: 'center',
    lineHeight: 20,
  },

  // --- controls 단계 ---
  questionHighlight: {
    position: 'absolute',
    top: 86,
    left: 18,
    right: 18,
    minHeight: 106,
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10,
  },
  questionHighlightText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
  },
  cardConn: {
    top: 192,
    alignSelf: 'center',
  },
  cardDescBox: {
    top: 210,
    left: 24,
    right: 24,
  },
  micDescBox: {
    bottom: 179,
    alignSelf: 'center',
  },
  micConn: {
    bottom: 106,
    alignSelf: 'center',
  },
  micHighlight: {
    position: 'absolute',
    bottom: 26,
    alignSelf: 'center',
    padding: 4,
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 8,
    zIndex: 20,
  },
  micReplica: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#EFF1F0',
  },
  keyboardDescBox: {
    right: 12,
    bottom: 122,
    maxWidth: 165,
  },
  keyboardConn: {
    right: 28,
    width: 48,
    bottom: 94,
  },
  keyboardHighlight: {
    position: 'absolute',
    right: 24,
    bottom: 38,
    padding: 4,
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 8,
    zIndex: 20,
  },
  keyboardReplica: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: COLORS.white,
  },

  // --- recording 단계 ---
  progressBarReplica: {
    position: 'absolute',
    top: 68,
    left: 18,
    right: 18,
    height: 6,
    flexDirection: 'row',
    gap: 6,
    zIndex: 15,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: '#FB7185',
  },
  progressHighlight: {
    position: 'absolute',
    top: 64,
    left: 14,
    right: 14,
    height: 14,
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 7,
    zIndex: 16,
  },
  progressBadge: {
    position: 'absolute',
    top: 42,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: POINT,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 20,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: POINT,
  },
  progressConn: {
    top: 78,
    left: 60,
  },
  progressDescBox: {
    top: 96,
    left: 24,
    right: 24,
  },
  resultDescBox: {
    bottom: 261,
    alignSelf: 'center',
  },
  resultConn: {
    bottom: 234,
    alignSelf: 'center',
  },
  resultCardReplica: {
    position: 'absolute',
    bottom: 170,
    left: 18,
    right: 18,
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    zIndex: 15,
  },
  resultCardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.black,
  },
  stopDescBox: {
    bottom: 129,
    alignSelf: 'center',
  },
  stopConn: {
    bottom: 106,
    alignSelf: 'center',
  },
  stopReplica: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4F73',
    borderRadius: 36,
    backgroundColor: '#FFE1E6',
    zIndex: 20,
  },

  // --- keyboard 단계 ---
  inputRowReplica: {
    position: 'absolute',
    bottom: 150,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  inputFieldReplica: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: POINT,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  inputFieldText: {
    fontSize: 14,
    color: COLORS.black,
    padding: 0,
  },
  sendReplica: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: POINT,
  },
  inputDescBox: {
    bottom: 220,
    left: 8,
  },
  inputConn: {
    bottom: 198,
    left: 42,
    width: 48,
  },
  sendDescBox: {
    bottom: 220,
    right: 8,
  },
  sendConn: {
    bottom: 198,
    right: 18,
    width: 48,
  },

});
