import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; //
import { useRouter } from 'expo-router'; //

export default function ChatVoiceScreen() {
  const router = useRouter(); //
  
  // 상태 관리 (호감도, 생명, 캡션 등)
  const [affinity, setAffinity] = useState(70);
  const [currentHearts, setCurrentHearts] = useState(3);
  const [captionText, setCaptionText] = useState(`Hello there! Welcome to our cafe. Lovely day to grab a coffee, isn't it? What can I get started for you today, cheers?`);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* [1] 상단 헤더: 카메라 렌즈 간섭 완벽 회피 구조 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>젊은 카페 사장님</Text>
          <Text style={styles.headerSubtitle}>런던 억센트 • 난이도 최상</Text>
        </View>

        <View style={styles.lifeHeartContainer}>
          <View style={styles.capsuleRow}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.lifeCapsule,
                  i < currentHearts ? styles.lifeCapsuleActive : styles.lifeCapsuleInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.lifeRatioText}>{`${currentHearts}/5`}</Text>
        </View>
      </View>

      {/* [2] 호감도 프로그레스 바 영역: [수정] 채팅창과 똑같이 우측에 보상 선물 상자 추가 */}
      <View style={styles.affinityContainer}>
        <Text style={styles.affinityLabel}>호감도</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBarWrapper}>
            {/* 블루 퍼센트 뱃지 */}
            <View style={[styles.percentBadge, { left: `${affinity - 6}%` }]}>
              <Text style={styles.percentBadgeText}>{affinity}%</Text>
            </View>
            
            {/* 초슬림 게이지 바 트랙 */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
            </View>
          </View>
          
          <Ionicons name="arrow-forward-outline" size={16} color="#8E8E93" style={styles.arrowIcon} />
        </View>

        {/* 👈 채팅방 UI와 완벽 동일하게 구현된 우측 보상 컴포넌트 */}
        <View style={styles.rewardContainer}>
          <Ionicons name="gift" size={20} color="#1C1C1E" />
          <Text style={styles.rewardText}>보상</Text>
        </View>
      </View>

      {/* [3] 중앙 영역: [수정] 부담스러운 인물 사진 대신 깔끔한 미니멀 빈 박스로 변경 */}
      <View style={styles.characterContainer}>
        <View style={styles.emptyBoxWrapper}>
          <MaterialCommunityIcons name="account-voice" size={64} color="#AEAEB2" />
          <Text style={styles.emptyBoxText}>젊은 카페 사장님과 통화 중...</Text>
          
          {/* 우측 상단 잔여 라이브 느낌의 미니멀 뱃지 유지 */}
          <View style={styles.liveOverlay}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* [4] 하단 컨트롤 패널 (힌트박스, 캡션, 버튼 레이아웃) */}
      <View style={styles.bottomPanel}>
        {/* 힌트 버튼 (우측 정렬 와이어프레임 구조) */}
        <View style={styles.hintRow}>
          <TouchableOpacity style={styles.hintButton}>
            <Ionicons name="bulb-outline" size={14} color="#1C1C1E" />
            <Text style={styles.hintButtonText}>힌트 보기</Text>
          </TouchableOpacity>
        </View>

        {/* 캡션(자막) 영역: 깔끔하고 가독성 좋은 라운드 스퀘어 박스 */}
        <View style={styles.captionBox}>
          <Text style={styles.captionText}>{captionText}</Text>
        </View>

        {/* 하단 제어 핵심 액션 3종 버튼 스택 */}
        <View style={styles.buttonRow}>
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setIsRecording(!isRecording)}>
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={24} 
                color={isRecording ? "#FF3B30" : "#1C1C1E"} 
              />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>녹음</Text>
          </View>

          <View style={styles.controlItem}>
            <TouchableOpacity 
              style={[styles.circleButton, styles.endCallButton]} 
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="phone-hangup" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>통화종료</Text>
          </View>

          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.circleButton}>
              <Ionicons name="play-outline" size={24} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>들어보기</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* [컨벤션 가이드라인 스타일 시트 완전 분리] */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 12 : 36, 
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  lifeHeartContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  capsuleRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  lifeCapsule: {
    width: 5,
    height: 16,
    borderRadius: 2.5,
    marginLeft: 3,
  },
  lifeCapsuleActive: {
    backgroundColor: '#1C1C1E',
  },
  lifeCapsuleInactive: {
    backgroundColor: '#E5E5EA',
  },
  lifeRatioText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  // 호감도 컴포넌트 (채팅과 구조 일치화)
  affinityContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  affinityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '82%',
  },
  progressBarWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    height: 24,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF', // 요청 주셨던 Blue 테마 유지
    borderRadius: 2,
  },
  percentBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  percentBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 6,
  },
  rewardContainer: {
    position: 'absolute',
    right: 20,
    bottom: 10,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2,
  },
  // 중앙 비어있는 박스(Placeholder) 영역 커스텀
  characterContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBoxWrapper: {
    width: '100%',
    height: '92%',
    borderRadius: 24,
    backgroundColor: '#F2F2F7', // 부담 없는 라이트 그레이 빈 박스 배경
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyBoxText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
    fontWeight: '500',
  },
  liveOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  liveBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // 하단 컨트롤 패널 영역
  bottomPanel: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hintRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hintButtonText: {
    fontSize: 12,
    color: '#1C1C1E',
    marginLeft: 4,
    fontWeight: '500',
  },
  captionBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 20,
    minHeight: 100,
    marginBottom: 24,
    justifyContent: 'center',
  },
  captionText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlItem: {
    alignItems: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // 은은한 모던 그림자 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  endCallButton: {
    backgroundColor: '#FF3B30', 
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  buttonLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
});