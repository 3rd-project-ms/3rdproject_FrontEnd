import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChatVoiceScreen() {
  const router = useRouter();

  const [character] = useState({ name: 'Jamie', role: '카페 사장님' });
  const [affinity] = useState(42);
  const [lives] = useState(2);
  const [showHint, setShowHint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sttText] = useState("I'm going to study here for a semester.");
  const [showEndModal, setShowEndModal] = useState(false);

  // ─── 하트 목숨 렌더링 ───────────────────────────────────────
  const renderLives = () => {
    return (
      <View style={styles.liveContainer}>
        {[1, 2, 3].map((i) => (
          <Ionicons
            key={i}
            name={i <= lives ? 'heart' : 'heart-outline'}
            size={22}
            color={i <= lives ? '#F6A3A6' : '#D0D0D0'}
            style={{ marginLeft: 2 }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── 헤더: 뒤로가기 + 캐릭터명 + 하트 목숨 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0B0B12" />
        </TouchableOpacity>

        <Text style={styles.charName}>
          {character.name}
          <Text style={styles.charRole}> · {character.role}</Text>
        </Text>

        {renderLives()}
      </View>

      {/* ── 친밀도 상태바 ── */}
      <View style={styles.affinityWrapper}>
        <Text style={styles.affinityPercent}>{affinity}%</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />

          {/* 1/3 포인트 하트 - 바 아래 */}
          <View style={[styles.pointHeartWrapper, { left: '33%' }]}>
            <Ionicons
              name="heart"
              size={14}
              color={affinity >= 33 ? '#F6A3A6' : '#D0D0D0'}
            />
          </View>
          {/* 2/3 포인트 하트 - 바 아래 */}
          <View style={[styles.pointHeartWrapper, { left: '66%' }]}>
            <Ionicons
              name="heart"
              size={14}
              color={affinity >= 66 ? '#F6A3A6' : '#D0D0D0'}
            />
          </View>
        </View>
      </View>

      {/* ── 캐릭터 영역 (일러스트 추후 삽입) ── */}
      <View style={styles.characterArea} />

      {/* ── 힌트 버튼 + 내용 ── */}
      <View style={styles.hintContainer}>
        <TouchableOpacity
          style={styles.hintHeader}
          onPress={() => setShowHint(!showHint)}
          activeOpacity={0.8}
        >
          <View style={styles.hintTitleRow}>
            <View style={styles.hintDot} />
            <Text style={styles.hintTitleText}>무엇을 말해야 하나요?</Text>
          </View>
          <Ionicons
            name={showHint ? 'chevron-down' : 'chevron-up'}
            size={16}
            color="#888"
          />
        </TouchableOpacity>

        {showHint && (
          <View style={styles.hintContent}>
            <Text style={styles.hintEnglish}>I'm feeling a bit under the weather.</Text>
            <Text style={styles.hintKorean}>나 오늘 몸 컨디션이 좀 별로야</Text>
          </View>
        )}
      </View>

      {/* ── STT 자막 ── */}
      <View style={styles.subtitleArea}>
        <Text style={styles.subtitleText}>{sttText}</Text>
      </View>

      {/* ── 하단 컨트롤 ── */}
      <View style={styles.controlBar}>
        {/* 녹음하기 */}
        <TouchableOpacity
          style={styles.subButton}
          onPress={() => setIsRecording(!isRecording)}
        >
          <View style={[styles.iconCircleSub, isRecording && styles.iconCircleActive]}>
            <Ionicons name="mic" size={22} color={isRecording ? '#FFFFFF' : '#888'} />
          </View>
          <Text style={styles.buttonLabel}>녹음하기</Text>
        </TouchableOpacity>

        {/* 통화종료 (중앙 강조) */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => setShowEndModal(true)}
        >
          <View style={styles.iconCircleMain}>
            <MaterialCommunityIcons name="phone-hangup" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.mainButtonLabel}>통화종료</Text>
        </TouchableOpacity>

        {/* 다시듣기 */}
        <TouchableOpacity style={styles.subButton}>
          <View style={styles.iconCircleSub}>
            <Ionicons name="volume-medium" size={22} color="#888" />
          </View>
          <Text style={styles.buttonLabel}>다시듣기</Text>
        </TouchableOpacity>
      </View>

      {/* ── 통화 종료 모달 ── */}
      <Modal
        visible={showEndModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEndModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>정말 통화를 종료하시겠습니까?</Text>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                setShowEndModal(false);
                router.push('/(main)/session-result');
              }}
            >
              <Text style={styles.modalConfirmButtonText}>통화 종료하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  charName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0B0B12',
  },
  charRole: {
    fontSize: 18,
    fontWeight: '400',
    color: '#888888',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── 친밀도 바
  affinityWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  affinityPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    width: 36,
    marginRight: 8,
    marginTop: 2,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    position: 'relative',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F6A3A6',
    borderRadius: 4,
  },
  pointHeartWrapper: {
    position: 'absolute',
    top: 8,                    // 바 아래로 하트 배치
    transform: [{ translateX: -7 }],
  },

  // ── 캐릭터 영역
  characterArea: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },

  // ── 힌트
  hintContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  hintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F6A3A6',
  },
  hintTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  hintContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  hintEnglish: {
    fontSize: 14,
    color: '#E87C7C',
    fontWeight: '500',
  },
  hintKorean: {
    fontSize: 13,
    color: '#888',
  },

  // ── STT 자막
  subtitleArea: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    padding: 20,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#0B0B12',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  // ── 하단 컨트롤
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  subButton: {
    alignItems: 'center',
    width: 72,
  },
  iconCircleSub: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircleActive: {
    backgroundColor: '#F6A3A6',
  },
  buttonLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  mainButton: {
    alignItems: 'center',
    width: 90,
  },
  iconCircleMain: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F6A3A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mainButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F6A3A6',
  },

  // ── 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B12',
  },
  modalConfirmButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F6A3A6',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});