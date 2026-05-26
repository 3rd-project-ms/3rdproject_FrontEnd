import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; //
import { useRouter } from 'expo-router'; // 👈 [추가] Expo Router 네비게이션 훅 import

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

export default function ChatScreen() {
  const router = useRouter(); // 👈 [추가] router 인스턴스 생성
  
  const [inputText, setInputText] = useState('');
  const [affinity, setAffinity] = useState(70); 
  const [currentHearts, setCurrentHearts] = useState(3); 
  const maxHearts = 5;
  const hintText = '추천 표현: "I highly recommend our signature ice blend!"';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello there! Welcome to our cafe. Lovely day to grab a coffee, isn't it? What can I get started for you today, cheers?`,
      sender: 'ai',
      time: '오후 2:14',
    },
    {
      id: '2',
      text: `Hi! Honestly, I'm feeling a bit tired today. Do you have anything strong that can wake me up?`,
      sender: 'user',
      time: '오후 2:14',
    },
    {
      id: '3',
      text: `Oh, you look absolutely shattered! In that case, I'd highly recommend our signature ice blend. It's quite strong and will sort you right out.`,
      sender: 'ai',
      time: '오후 2:15',
    },
    {
      id: '4',
      text: `That sounds perfect. By the way, what kind of coffee beans do you use for that blend?`,
      sender: 'user',
      time: '오후 2:15',
    },
    {
      id: '5',
      text: `Well, darling, we use a beautiful mixture of Ethiopian and Colombian beans, roasted right here in-house. It has a remarkably rich flavor.`,
      sender: 'ai',
      time: '오후 2:16',
    },
  ]);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    if (currentHearts <= 0) return;

    const currentTime = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: currentTime,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setCurrentHearts((prev) => Math.max(0, prev - 1));
    setAffinity((prev) => Math.min(100, prev + 2));
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAi = item.sender === 'ai';

    return (
      <View style={[styles.messageWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        <View style={[styles.bubbleRow, isAi ? styles.aiRowDirection : styles.userRowDirection]}>
          <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
            <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
              {item.text}
            </Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* [1] 상단 헤더 영역 */}
      <View style={styles.header}>
        {/* 👈 [수정] onPress 이벤트를 추가하여 아이콘을 누르면 home으로 라우팅되도록 설정 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>젊은 카페 사장님</Text>
          <Text style={styles.headerSubtitle}>런던 억센트 • 난이도 최상</Text>
        </View>

        {/* 알약 형태 생명 표시 바 */}
        <View style={styles.lifeHeartContainer}>
          <View style={styles.capsuleRow}>
            {Array.from({ length: maxHearts }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.lifeCapsule,
                  index < currentHearts ? styles.lifeCapsuleActive : styles.lifeCapsuleInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.lifeRatioText}>{`${currentHearts}/${maxHearts}`}</Text>
        </View>
      </View>

      {/* [2] 호감도 프로그레스 바 영역 */}
      <View style={styles.affinityContainer}>
        <Text style={styles.affinityLabel}>호감도</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBarWrapper}>
            <View style={[styles.percentBadge, { left: `${affinity - 6}%` }]}>
              <Text style={styles.percentBadgeText}>{affinity}%</Text>
            </View>
            
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${affinity}%` }]} />
            </View>
          </View>
          
          <Ionicons name="arrow-forward-outline" size={16} color="#8E8E93" style={styles.arrowIcon} />
        </View>

        <View style={styles.rewardContainer}>
          <Ionicons name="gift" size={20} color="#1C1C1E" />
          <Text style={styles.rewardText}>보상</Text>
        </View>
      </View>

      {/* [3] 채팅 메시지 스크롤 영역 */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* [4] 하단 고정 영역 (힌트칸 + 타원 인풋바) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            💡 {hintText}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="영어 문장으로 답변을 구성해보세요."
              placeholderTextColor="#A9A9A9"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={18} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() === '' ? styles.btnDisabled : styles.btnActive]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Ionicons name="send" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* [StyleSheet 스타일 시트 분리] */
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
    paddingVertical: 4,
    paddingRight: 8,
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
    backgroundColor: '#007AFF', 
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
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  aiWrapper: {
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  aiRowDirection: {
    flexDirection: 'row',
  },
  userRowDirection: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
  },
  userBubble: {
    backgroundColor: '#000000',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  aiText: {
    color: '#000000',
  },
  userText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#AEAEB2',
    marginHorizontal: 6,
    marginBottom: 1,
  },
  hintContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginHorizontal: 16,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#1C1C1E',
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    paddingVertical: 0,
  },
  micButton: {
    padding: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: '#000000',
  },
  btnDisabled: {
    backgroundColor: '#AEAEB2',
  },
});