import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export type TutorialStep = 'intro' | 'controls' | 'recording' | 'result' | 'start';

interface LevelTestTutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

export default function LevelTestTutorialOverlay({
  step,
  onNext,
  onSkip,
}: LevelTestTutorialOverlayProps) {
  void onSkip;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.dimLayer} onPress={onNext} />
      {step === 'intro' && (
        <View style={styles.introModal}>
          <Text style={styles.introTitle}>튜토리얼을 시작하겠습니다.</Text>
          <Pressable onPress={onNext} style={styles.introButton}>
            <Text style={styles.introButtonText}>화면을 터치하면 다음으로 넘어가요</Text>
          </Pressable>
        </View>
      )}
      {step === 'controls' && (
        <>
          {/* 문항 카드 핑크 테두리 */}
          <View style={styles.questionCardHighlight}>
            <Text style={styles.questionCardText}>
              {'Oh, you just arrived?\nWhere did you come from?\nHow long are you planning to stay?'}
            </Text>
          </View>

          {/* < 버튼 강조 박스 */}
          <View style={styles.prevButtonHighlight}>
            <Text style={styles.navButtonIcon}>‹</Text>
          </View>

          {/* > 버튼 강조 박스 */}
          <View style={styles.nextButtonHighlight}>
            <Text style={styles.navButtonIcon}>›</Text>
          </View>

          {/* 이전 문항 설명 박스 (< 버튼 왼쪽 위) + DOWN 화살표 */}
          <View style={styles.navPrevDescBox}>
            <Text style={styles.navPrevDescText}>이전 문항들 확인하기</Text>
          </View>
          <View style={styles.navPrevArrow}>
            <View style={styles.navPrevArrowLine} />
            <View style={styles.navArrowHeadDown} />
          </View>

          {/* 현재 문항 설명 박스 (> 버튼 오른쪽 아래) + UP 화살표 */}
          <View style={styles.navNextArrow}>
            <View style={styles.navArrowHeadUp} />
            <View style={styles.navNextArrowLine} />
          </View>
          <View style={styles.navNextDescBox}>
            <Text style={styles.navNextDescText}>현재문항으로 돌아가기</Text>
          </View>

          {/* 문항 카드 중앙 설명 박스 (카드 아래) + UP 화살표 */}
          <View style={styles.navCardArrow}>
            <View style={styles.navArrowHeadUp} />
            <View style={styles.navCardArrowLine} />
          </View>
          <Pressable onPress={onNext} style={styles.navCardDescBox}>
            <Text style={styles.navCardDescText}>
              {'해당칸에서 문제 지문 확인가능,\n문항을 음성으로 2번 반복하여 들려줍니다.'}
            </Text>
          </Pressable>
        </>
      )}
      {step === 'recording' && (
        <>
          {/* 진행바 강조 테두리 복제본 */}
          <View style={styles.recProgressHighlight} />

          {/* 진행바 세그먼트 복제본 */}
          <View style={styles.recProgressBarReplica}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.recProgressSegment,
                  i < 2 && styles.recProgressSegmentActive,
                ]}
              />
            ))}
          </View>

          {/* 진행바 오른쪽 숫자 뱃지 */}
          <View style={styles.recProgressBadge}>
            <Text style={styles.recProgressBadgeText}>2/6</Text>
          </View>

          {/* 진행바 → 설명 박스 화살표 (↑) */}
          <View style={styles.recProgressArrow}>
            <View style={styles.recArrowHeadUp} />
            <View style={styles.recArrowLineShort} />
          </View>

          {/* 진행바 설명 박스 */}
          <View style={styles.recProgressDescBox}>
            <Text style={styles.recProgressDescText}>현재까지 완료한 문제를 한 눈에 확인</Text>
          </View>

          {/* 정지 버튼 설명 박스 */}
          <View style={styles.recStopDescBox}>
            <Text style={styles.recStopDescText}>녹음이 끝났다면 다시 버튼을 눌러 중단</Text>
          </View>

          {/* 설명 박스 → 정지 버튼 화살표 (↓) */}
          <View style={styles.recStopArrow}>
            <View style={styles.recArrowLineLong} />
            <View style={styles.recArrowHeadDown} />
          </View>

          {/* 녹음 정지 버튼 복제본 */}
          <Pressable onPress={onNext} style={styles.recStopButton}>
            <Ionicons name="square" size={34} color="#FF4F73" />
          </Pressable>
        </>
      )}
      {step === 'start' && (
        <View style={styles.startModal}>
          <Text style={styles.startTitle}>🎉 그럼 테스트를 시작해볼까요?</Text>
          <Pressable onPress={onNext} style={styles.startButton}>
            <Text style={styles.startButtonText}>레벨테스트 진행하기</Text>
          </Pressable>
        </View>
      )}
      {step === 'result' && (
        <>
          {/* 답변 결과 카드 복제본 */}
          <View style={styles.resAnswerBox}>
            <Text style={styles.resAnswerText}>
              {"I'm going to study here for a semester."}
            </Text>
          </View>

          {/* 다시하기 버튼 복제본 */}
          <Pressable onPress={onNext} style={styles.resRetryButton}>
            <Text style={styles.resRetryText}>다시하기</Text>
          </Pressable>

          {/* 다음으로 넘어가기 버튼 복제본 */}
          <Pressable onPress={onNext} style={styles.resSubmitButton}>
            <Text style={styles.resSubmitText}>다음으로 넘어가기</Text>
          </Pressable>

          {/* 답변 카드 화살표 (↓) */}
          <View style={styles.resAnswerArrow}>
            <View style={styles.resArrowLine} />
            <View style={styles.resArrowHeadDown} />
          </View>

          {/* 다시하기 화살표: 설명박스(bottom:130) → 버튼(bottom:98), 32px 연결 */}
          <View style={styles.resRetryArrow}>
            <View style={styles.resButtonArrowLine} />
            <View style={styles.resArrowHeadDown} />
          </View>

          {/* 다음으로 넘어가기 화살표: 설명박스(bottom:130) → 버튼(bottom:98) */}
          <View style={styles.resSubmitArrow}>
            <View style={styles.resButtonArrowLine} />
            <View style={styles.resArrowHeadDown} />
          </View>

          {/* 답변 카드 설명 박스 */}
          <View style={styles.resAnswerDescBox}>
            <Text style={styles.resAnswerDescText}>
              {'녹음 결과를 여기서 확인,\n해당 칸을 터치하면 녹음 음성도 확인 가능'}
            </Text>
          </View>

          {/* 다시하기 설명 박스 */}
          <View style={styles.resRetryDescBox}>
            <Text style={styles.resRetryDescText}>다시하기 버튼으로 재녹음</Text>
          </View>

          {/* 다음으로 넘어가기 설명 박스 */}
          <View style={styles.resSubmitDescBox}>
            <Text style={styles.resSubmitDescText}>{'녹음이 끝났다면\n다음으로 넘어가기'}</Text>
          </View>
        </>
      )}
      {step === 'controls' && (
        <>
          {/* 마이크 설명 박스 */}
          <View style={styles.micDescriptionBox}>
            <Text style={styles.micDescriptionText}>
              마이크 버튼을 눌러 음성 녹음 시작
            </Text>
          </View>
          {/* 마이크 화살표 (↓) */}
          <View style={styles.micArrow}>
            <View style={styles.micArrowLine} />
            <View style={styles.micArrowHead} />
          </View>
          {/* 마이크 버튼 복제본 + 강조 테두리 */}
          <View style={styles.micHighlight}>
            <Pressable onPress={onNext} style={styles.micButton}>
              <Ionicons name="mic" size={48} color={COLORS.gray0} />
            </Pressable>
          </View>
          {/* 키보드 버튼 복제본 + 강조 테두리 */}
          <View style={styles.keyboardHighlight}>
            <Pressable onPress={onNext} style={styles.keyboardButton}>
              <Ionicons name="keypad" size={36} color={COLORS.gray0} />
            </Pressable>
          </View>
          {/* 키보드 화살표 (↑) */}
          <View style={styles.keyboardArrow}>
            <View style={styles.keyboardArrowHead} />
            <View style={styles.keyboardArrowLine} />
          </View>
          {/* 키보드 설명 박스 */}
          <View style={styles.keyboardDescriptionBox}>
            <Text style={styles.keyboardDescriptionText}>
              키보드 버튼을 누르면 키보드로 입력가능
            </Text>
          </View>
        </>
      )}
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
    backgroundColor: 'rgba(47, 47, 47, 0.4)',
  },
  // --- intro step styles ---
  introModal: {
    position: 'absolute',
    top: '35%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B0B12',
    marginBottom: 20,
  },
  introButton: {
    backgroundColor: '#F6A3A6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  introButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // --- navigation step styles ---
  // QuestionCard: top=78 (header56+progress6+mt16), left/right=18, height=100
  questionCardHighlight: {
    position: 'absolute',
    top: 78,
    left: 18,
    right: 18,
    height: 100,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 58,
    zIndex: 10,
  },
  questionCardText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#000000',
    textAlign: 'center',
  },
  // < button: within card left=18, width=44 → center x=40; 36x36 centered: left=22, top=110
  prevButtonHighlight: {
    position: 'absolute',
    top: 110,
    left: 22,
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 12,
  },
  // > button: within card right=18, width=44 → center from right=40; 36x36: right=22, top=110
  nextButtonHighlight: {
    position: 'absolute',
    top: 110,
    right: 22,
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 12,
  },
  navButtonIcon: {
    fontSize: 32,
    color: '#222222',
    textAlign: 'center',
  },
  // prev desc box: top-left, above < button
  // box top:8, paddingV:8, text~18px → height~34 → bottom~42
  navPrevDescBox: {
    position: 'absolute',
    top: 8,
    left: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  navPrevDescText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
  },
  // prev arrow: top:45 (desc box bottom) → line(57) + head(8) = 65px → top:110 (< button top)
  navPrevArrow: {
    position: 'absolute',
    top: 45,
    left: 39,
    alignItems: 'center',
    zIndex: 20,
  },
  navPrevArrowLine: {
    width: 2,
    height: 57,
    backgroundColor: '#F43F5E',
  },
  // next arrow: top:146, right:34 (center=right:40 = > button center)
  navNextArrow: {
    position: 'absolute',
    top: 146,
    right: 34,
    alignItems: 'center',
    zIndex: 20,
  },
  navNextArrowLine: {
    width: 2,
    height: 16,
    backgroundColor: '#F43F5E',
  },
  // next desc box: below > button, right side
  navNextDescBox: {
    position: 'absolute',
    top: 170,
    right: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  navNextDescText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
  },
  // card arrow: top:178 (card bottom) → head(8) + line(22) → reaches top:208
  navCardArrow: {
    position: 'absolute',
    top: 178,
    alignSelf: 'center',
    alignItems: 'center',
  },
  navCardArrowLine: {
    width: 2,
    height: 22,
    backgroundColor: '#F43F5E',
  },
  navCardDescBox: {
    position: 'absolute',
    top: 208,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  navCardDescText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  navArrowHeadDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F43F5E',
  },
  navArrowHeadUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F43F5E',
  },
  // --- end navigation step styles ---

  // --- controls step styles ---
  // 마이크 설명 박스: 마이크 버튼 위 중앙
  micDescriptionBox: {
    position: 'absolute',
    bottom: 240,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  micDescriptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
  },
  // 마이크 화살표 (↓): 설명 박스 아래 → 마이크 버튼 방향
  micArrow: {
    position: 'absolute',
    bottom: 212,
    alignSelf: 'center',
    alignItems: 'center',
  },
  micArrowLine: {
    width: 2,
    height: 20,
    backgroundColor: '#F43F5E',
  },
  micArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F43F5E',
  },
  // 마이크 버튼 복제본: 하단 중앙, 강조 테두리 포함
  micHighlight: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    padding: 4,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 5,
  },
  micButton: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 50,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  // 키보드 버튼 복제본: 하단 오른쪽, 강조 테두리 포함
  keyboardHighlight: {
    position: 'absolute',
    right: 24,
    bottom: 108,
    padding: 4,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 5,
  },
  keyboardButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  // 키보드 화살표 (↑): desc box top(72) → button bottom(108), 36px 연결
  // button center from right: 24 + 68/2 = 58 → arrow center right:52 (52+6=58)
  keyboardArrow: {
    position: 'absolute',
    right: 52,
    bottom: 72,
    alignItems: 'center',
  },
  keyboardArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F43F5E',
  },
  keyboardArrowLine: {
    width: 2,
    height: 28,
    backgroundColor: '#F43F5E',
  },
  // 키보드 설명 박스: 화살표 아래, 오른쪽 정렬
  keyboardDescriptionBox: {
    position: 'absolute',
    right: 5,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: 220,
  },
  keyboardDescriptionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  // --- end controls step styles ---

  // --- recording step styles ---
  recProgressBarReplica: {
    position: 'absolute',
    top: 56,
    left: 18,
    right: 18,
    height: 6,
    flexDirection: 'row',
    gap: 4,
  },
  recProgressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8C8C8',
  },
  recProgressSegmentActive: {
    backgroundColor: '#F43F5E',
  },
  recProgressHighlight: {
    position: 'absolute',
    top: 53,
    left: 14,
    right: 14,
    height: 12,
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 6,
  },
  recProgressBadge: {
    position: 'absolute',
    top: 48,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  recProgressBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F43F5E',
  },
  recProgressArrow: {
    position: 'absolute',
    top: 65,
    left: 60,
    alignItems: 'center',
  },
  recArrowHeadUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F43F5E',
  },
  recArrowLineShort: {
    width: 2,
    height: 8,
    backgroundColor: '#F43F5E',
  },
  recProgressDescBox: {
    position: 'absolute',
    top: 72,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  recProgressDescText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  recStopDescBox: {
    position: 'absolute',
    bottom: 230,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  recStopDescText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  // recStopArrow: desc box bottom(230) → button top(208) = 22px
  recStopArrow: {
    position: 'absolute',
    bottom: 208,
    alignSelf: 'center',
    alignItems: 'center',
  },
  recArrowLineLong: {
    width: 2,
    height: 14,
    backgroundColor: '#F43F5E',
  },
  recArrowHeadDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F43F5E',
  },
  recStopButton: {
    position: 'absolute',
    bottom: 108,
    alignSelf: 'center',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4F73',
    borderRadius: 50,
    backgroundColor: '#FFE1E6',
  },
  // --- end recording step styles ---

  // --- result step styles ---
  resAnswerBox: {
    position: 'absolute',
    top: 430,
    left: 18,
    right: 18,
    height: 102,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.black,
  },
  resRetryButton: {
    position: 'absolute',
    bottom: 50,
    left: 18,
    width: '42%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#999999',
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  resRetryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AFAFAF',
  },
  resSubmitButton: {
    position: 'absolute',
    bottom: 50,
    right: 18,
    width: '42%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  resSubmitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // 화살표 공통
  resArrowLine: {
    width: 2,
    height: 20,
    backgroundColor: '#F43F5E',
  },
  // 버튼 화살표 전용: desc box(bottom:130) → button(bottom:98) = 32px 연결
  resButtonArrowLine: {
    width: 2,
    height: 24,
    backgroundColor: '#F43F5E',
  },
  resArrowHeadDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F43F5E',
  },
  // 답변 카드 화살표: top:410, 중앙
  resAnswerArrow: {
    position: 'absolute',
    top: 410,
    alignSelf: 'center',
    alignItems: 'center',
  },
  resRetryArrow: {
    position: 'absolute',
    bottom: 98,
    left: 60,
    alignItems: 'center',
  },
  resSubmitArrow: {
    position: 'absolute',
    bottom: 98,
    right: 60,
    alignItems: 'center',
  },
  // 답변 카드 설명 박스: top:360
  resAnswerDescBox: {
    position: 'absolute',
    top: 360,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  resAnswerDescText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222222',
  },
  resRetryDescBox: {
    position: 'absolute',
    bottom: 130,
    left: 18,
    right: '52%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resRetryDescText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  resRetryArrowH: {
    position: 'absolute',
    bottom: 120,
    left: 18,
    width: 43,
    height: 2,
    backgroundColor: '#F43F5E',
  },
  resSubmitArrowH: {
    position: 'absolute',
    bottom: 120,
    right: 18,
    width: 43,
    height: 2,
    backgroundColor: '#F43F5E',
  },
  resSubmitDescBox: {
    position: 'absolute',
    bottom: 130,
    right: 18,
    left: '52%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resSubmitDescText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  // --- end result step styles ---

  // --- start step styles ---
  startModal: {
    position: 'absolute',
    top: '35%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B0B12',
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#F6A3A6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // --- end start step styles ---
});
