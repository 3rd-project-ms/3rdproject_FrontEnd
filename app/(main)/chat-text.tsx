import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal, SafeAreaView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChatTextScreen() {
  const router = useRouter();

  // ─── 상태 관리 ───────────────────────────────────────────
  const [character] = useState({ name: 'Jamie', role: '카페 사장님' });
  const [affinity, setAffinity] = useState(42);
  const [lives, setLives] = useState(2);
  
  const [showHint, setShowHint] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // 예시 채팅 데이터 (좌: AI 캐릭터, 우: 사용자)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! Welcome to the espresso bar 'Lavazza'. How would you like a drink?" },
    { id: 2, sender: 'user', text: "I haven't been able to decide yet, so do you happen to have any signature dishes you would recommend?" },
    { id: 3, sender: 'ai', text: "Our shop's most popular item is the 'Con Panna' topped with smooth cream. If you enjoy sweet and slightly bitter flavors, you won't regret it!" },
  ]);

  // 팝업(모달) 상태 관리
  const [popupType, setPopupType] = useState<'duplicate' | 'success' | null>(null);

  // ─── 하트 목숨 렌더링 (chat-voice와 동일) ──────────────────
  const renderLives = () => {
    return (
      <View style={styles.liveContainer}>
        {[1, 2, 3].map((i) => (
          <Ionicons
            key={i}
            name={i <= lives ? 'heart' : 'heart-outline'}
            size={22}
            color={i <= lives ? '#F6A3A6' : '#E0E0E0'}
            style={{ marginLeft: 3 }}
          />
        ))}
      </View>
    );
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages((prev) => [...prev, newMsg]);

    // 테스트용 비밀 트리거
    if (inputText.includes('중복')) {
      setPopupType('duplicate');
      setLives((prev) => Math.max(0, prev - 1));
    } else if (inputText.includes('상승')) {
      setPopupType('success');
      setAffinity((prev) => Math.min(100, prev + 5));
    }

    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView 내부 속성을 유연하게 조정하여 블랙아웃 현상 완화 */}
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: '#FFFFFF' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        
        {/* ─── [상단] 헤더 영역 ─── */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0B0B12" />
            </TouchableOpacity>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.charRole}> · {character.role}</Text>
          </View>
          {renderLives()}
        </View>

        {/* ─── [상단] 친밀도 상태바 영역 ─── */}
        <View style={styles.affinityWrapper}>
          <Text style={styles.affinityPercent}>{affinity}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />

            {/* 1/3 포인트 하트 - 바 아래 배치 */}
            <View style={[styles.pointHeartWrapper, { left: '33%' }]}>
              <Ionicons
                name="heart"
                size={14}
                color={affinity >= 33 ? '#F6A3A6' : '#FFFFFF'}
              />
            </View>
            {/* 2/3 포인트 하트 - 바 아래 배치 */}
            <View style={[styles.pointHeartWrapper, { left: '66%' }]}>
              <Ionicons
                name="heart"
                size={14}
                color={affinity >= 66 ? '#F6A3A6' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* ─── [중앙] 채팅 및 나레이션 영역 ────────────────── */}
        <ScrollView 
          style={styles.chatScrollView}
          contentContainerStyle={styles.chatContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. 나레이션 */}
          <View style={styles.narrationContainer}>
            <Text style={styles.narrationText}>
              (Jamie shakes the portafilter of the espresso machine and gives you a sweet smile.)
            </Text>
          </View>

          {/* 2. 채팅 버블 */}
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <View 
                key={msg.id} 
                style={[styles.messageRow, isAI ? styles.messageRowLeft : styles.messageRowRight]}
              >
                <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
                  <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ─── [하단] 힌트 + 입력창 영역 ────────────────── */}
        <View style={styles.bottomAreaContainer}>
          
          {/* 힌트 버튼 시스템 */}
          <View style={styles.hintWrapper}>
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
                color="#616161" 
              />
            </TouchableOpacity>

            {showHint && (
              <View style={styles.hintContent}>
                <Text style={styles.hintEnglish}>Could you recommend a signature coffee here?</Text>
                <Text style={styles.hintKorean}>여기 시그니처 커피 추천해 주실 수 있나요?</Text>
              </View>
            )}
          </View>

          {/* 입력창 + 전송 단추 */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="대화를 입력하세요..."
              placeholderTextColor="#AAAAAA"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── [팝업] 알림창 (요청대로 배경색 흰색 고정 및 하트 기호 가이드) ─── */}
        <Modal
          visible={popupType !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPopupType(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setPopupType(null)}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
              
              {/* 1. 표현 중복 팝업 */}
              {popupType === 'duplicate' && (
                <View style={styles.popupInner}>
                  <Text style={[styles.popupTitle, { color: '#854448' }]}>표현 중복!</Text>
                  <Text style={styles.popupBody}>
                    질문 흐름과 맞지 않는 답변을 선택하셨어요.{"\n"}대화 맥락을 다시 한번 확인해 볼까요?
                  </Text>
                  <Text style={[styles.popupScore, { color: '#854448' }]}>❤️ -1</Text>
                </View>
              )}

              {/* 2. 호감도 상승 팝업 */}
              {popupType === 'success' && (
                <View style={styles.popupInner}>
                  <Text style={[styles.popupTitle, { color: '#2C3A5F' }]}>호감도 상승!</Text>
                  <Text style={styles.popupBody}>
                    센스 있는 답변 덕분에 상대방의 기분이 좋아졌어요.{"\n"}대화가 아주 매끄럽게 이어지고 있어요!
                  </Text>
                  <Text style={[styles.popupScore, { color: '#F6A3A6' }]}>❤️ + 5 pts</Text>
                </View>
              )}

            </Pressable>
          </Pressable>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── 디자인 데코레이션 스타일시트 ──────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 1. 요구사항: 전체 배경 컬러 흰색으로 변경
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 25, 
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 6,
    padding: 2,
  },
  charName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B0B12',
  },
  charRole: {
    fontSize: 15,
    fontWeight: '400',
    color: '#616161',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  affinityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  affinityPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3A5F',
    marginRight: 10,
    width: 35,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F6A3A6',
    borderRadius: 5,
  },
  pointHeartWrapper: {
    position: 'absolute',
    top: 12, 
    transform: [{ translateX: -7 }],
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  chatContentContainer: {
    paddingVertical: 10,
  },
  narrationContainer: {
    backgroundColor: '#EEF2F6', 
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },
  narrationText: {
    fontSize: 14,
    color: '#2C3A5F',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 16,
  },
  bubbleAI: {
    backgroundColor: '#AAAAAA', // 2. 요구사항: AI 말풍선 색상 #AAAAAA로 변경
    borderTopLeftRadius: 4, 
    borderWidth: 0.5,
    borderColor: '#999999',
  },
  bubbleUser: {
    backgroundColor: '#F6A3A6', 
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextAI: {
    color: '#FFFFFF', // 어두워진 말풍선에 맞게 글자색을 화이트로 전환하여 가독성 확보
  },
  bubbleTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomAreaContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 15 : 25,
    backgroundColor: '#FFFFFF', // 입력창 주변 영역도 전체 컨셉에 맞춰 화이트 처리
  },
  hintWrapper: {
    backgroundColor: '#FAF5EE', 
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F6A3A6',
  },
  hintTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3A5F',
  },
  hintContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  hintEnglish: {
    fontSize: 14,
    color: '#E87C7C',
    fontWeight: '600',
  },
  hintKorean: {
    fontSize: 13,
    color: '#616161',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0B0B12',
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6A3A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 11, 18, 0.35)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '82%',
    backgroundColor: '#FFFFFF', // 팝업창 배경색 흰색 고정 완료
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  popupInner: {
    alignItems: 'center',
    width: '100%',
  },
  popupTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  popupBody: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  popupScore: {
    fontSize: 22,
    fontWeight: '800',
  },
});