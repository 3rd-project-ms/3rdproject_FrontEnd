import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Platform, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

// ─── 목업 데이터 (API 미제공 필드) ──────────
const MOCK_STATS = {
  totalConversations: 12,
  avgPronunciation: 78,
};

// ─── 레벨 정의 ───────────────────────────
const LEVELS = [
  { code: 'A1', label: '입문',   desc: '영어가 처음이에요' },
  { code: 'A2', label: '초급',   desc: '기초 표현을 알아요' },
  { code: 'B1', label: '중급',   desc: '일상 대화 가능해요' },
  { code: 'B2', label: '중상급', desc: '자연스러운 편이에요' },
  { code: 'C1', label: '고급',   desc: '격식 표현도 OK' },
  { code: 'C2', label: '최고급', desc: '원어민 수준이에요' },
] as const;

type LevelCode = typeof LEVELS[number]['code'];

// ─────────────────────────────────────────
export default function MyPageScreen() {
  const router = useRouter();
  const { userId, nickname, selectedGender, selectedEnglishLevel, setAuth, logout } = useAuthStore();

  const [showEditModal, setShowEditModal]         = useState(false);
  const [showLevelModal, setShowLevelModal]       = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [selectedCode, setSelectedCode]           = useState<LevelCode>((selectedEnglishLevel as LevelCode) ?? 'A2');
  const [nicknameInput, setNicknameInput]         = useState('');
  const [isUpdating, setIsUpdating]               = useState(false);

  // 마이페이지 진입 시 최신 프로필 로드
  useEffect(() => {
    if (!userId) return;
    api.get(`/api/auth/${userId}/profile`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (data?.nickname) setAuth({ nickname: data.nickname });
        if (data?.preferred_partner_gender) setAuth({ selectedGender: data.preferred_partner_gender });
      })
      .catch(() => {});
  }, [userId]);

  const handleOpenNicknameModal = () => {
    setNicknameInput(nickname);
    setShowEditModal(false);
    setShowNicknameModal(true);
  };

  const handleNicknameSave = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed || !userId) return;
    setIsUpdating(true);
    try {
      const res = await api.put(`/api/auth/${userId}/profile`, {
        nickname: trimmed,
        preferred_partner_gender: selectedGender ?? 'male',
      });
      const data = res.data?.data ?? res.data;
      setAuth({ nickname: data?.nickname ?? trimmed });
      setShowNicknameModal(false);
    } catch (error) {
      Alert.alert('알림', '닉네임 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    setShowEditModal(false);
    logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0B0B12" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 프로필 카드 ── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{nickname}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="pencil-outline" size={14} color="#616161" />
              <Text style={styles.editBtnText}>편집</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 학습 현황 ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>학습 현황</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_STATS.totalConversations}회</Text>
              <Text style={styles.statLabel}>총 대화 횟수</Text>
            </View>
            <View style={[styles.statItem, styles.statItemRight]}>
              <Text style={styles.statValue}>{MOCK_STATS.avgPronunciation}점</Text>
              <Text style={styles.statLabel}>평균 발음 점수</Text>
            </View>
          </View>
        </View>

        {/* ── 나의 레벨 ── */}
        <View style={styles.card}>
          <View style={styles.levelHeader}>
            <Text style={styles.sectionTitle}>나의 레벨</Text>
            <TouchableOpacity
              style={styles.levelChangeBtn}
              onPress={() => setShowLevelModal(true)}
            >
              <Text style={styles.levelChangeBtnText}>변경</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.levelGrid}>
            {LEVELS.map((lv) => {
              const isSelected = lv.code === selectedCode;
              return (
                <TouchableOpacity
                  key={lv.code}
                  style={[styles.levelCell, isSelected && styles.levelCellActive]}
                  onPress={() => setSelectedCode(lv.code)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.levelCellCode, isSelected && styles.levelCellCodeActive]}>
                    {lv.code}
                  </Text>
                  <Text style={[styles.levelCellLabel, isSelected && styles.levelCellLabelActive]}>
                    {lv.label}
                  </Text>
                  <Text style={[styles.levelCellDesc, isSelected && styles.levelCellDescActive]}>
                    {lv.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 메뉴 ── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push('/report/mode-report' as any)}
          >
            <Ionicons name="bar-chart-outline" size={20} color="#2C3A5F" />
            <Text style={styles.menuItemText}>결과 분석</Text>
            <Ionicons name="chevron-forward" size={16} color="#AEAEB2" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/review' as any)}
          >
            <Ionicons name="book-outline" size={20} color="#2C3A5F" />
            <Text style={styles.menuItemText}>복습하기</Text>
            <Ionicons name="chevron-forward" size={16} color="#AEAEB2" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── 레벨 변경 바텀시트 ── */}
      {showLevelModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowLevelModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>레벨 선택</Text>

            <View style={styles.levelGrid}>
              {LEVELS.map((lv) => {
                const isSelected = lv.code === selectedCode;
                return (
                  <TouchableOpacity
                    key={lv.code}
                    style={[styles.levelCell, isSelected && styles.levelCellActive]}
                    onPress={() => { setSelectedCode(lv.code); setShowLevelModal(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.levelCellCode, isSelected && styles.levelCellCodeActive]}>
                      {lv.code}
                    </Text>
                    <Text style={[styles.levelCellLabel, isSelected && styles.levelCellLabelActive]}>
                      {lv.label}
                    </Text>
                    <Text style={[styles.levelCellDesc, isSelected && styles.levelCellDescActive]}>
                      {lv.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowLevelModal(false)}
            >
              <Text style={styles.modalCancelText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 편집 모달 ── */}
      {showEditModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowEditModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>계정 관리</Text>

            <TouchableOpacity style={styles.modalItem} onPress={handleOpenNicknameModal}>
              <Ionicons name="pencil-outline" size={18} color="#0B0B12" />
              <Text style={styles.modalItemText}>닉네임 변경</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#FF453A" />
              <Text style={[styles.modalItemText, { color: '#FF453A' }]}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCancelText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 닉네임 변경 모달 ── */}
      {showNicknameModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowNicknameModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>닉네임 변경</Text>

            <TextInput
              style={styles.nicknameInput}
              value={nicknameInput}
              onChangeText={setNicknameInput}
              placeholder="새 닉네임 입력"
              placeholderTextColor="#AEAEB2"
              maxLength={20}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, (!nicknameInput.trim() || isUpdating) && styles.modalSaveBtnDisabled]}
              onPress={handleNicknameSave}
              disabled={!nicknameInput.trim() || isUpdating}
            >
              {isUpdating
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.modalSaveBtnText}>저장</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowNicknameModal(false)}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 45 : 12,
    paddingBottom: 12,
    backgroundColor: '#F8F8F8',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0B0B12' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 0,
  },

  // 프로필
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#F6A3A6',
    alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  nickname: { fontSize: 18, fontWeight: '700', color: '#0B0B12' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0F0F5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, color: '#616161', fontWeight: '500' },

  // 통계
  statsGrid: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statItemRight: { borderLeftWidth: 1, borderLeftColor: '#F0F0F0' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#0B0B12' },
  statLabel: { fontSize: 11, color: '#AEAEB2', marginTop: 4 },

  // 레벨 카드
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  levelChangeBtn: {
    backgroundColor: '#F6A3A6',
    borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  levelChangeBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelCell: {
    width: '47.5%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
    padding: 14,
  },
  levelCellActive:      { borderColor: '#F6A3A6', backgroundColor: '#FFF5F5' },
  levelCellCode:        { fontSize: 18, fontWeight: '800', color: '#AEAEB2', marginBottom: 2 },
  levelCellCodeActive:  { color: '#F6A3A6' },
  levelCellLabel:       { fontSize: 14, fontWeight: '700', color: '#0B0B12', marginBottom: 4 },
  levelCellLabelActive: { color: '#0B0B12' },
  levelCellDesc:        { fontSize: 11, color: '#AEAEB2', lineHeight: 15 },
  levelCellDescActive:  { color: '#C9787A' },

  // 메뉴
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 15, color: '#0B0B12', fontWeight: '500' },

  // 모달 공통
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '700', color: '#0B0B12',
    marginBottom: 16, textAlign: 'center',
  },
  modalDivider: { height: 1, backgroundColor: '#F0F0F0' },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  modalItemText: { fontSize: 15, color: '#0B0B12', fontWeight: '500' },
  modalCancelBtn: {
    marginTop: 16, paddingVertical: 14,
    backgroundColor: '#F0F0F5', borderRadius: 12, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#616161' },

  // 닉네임 입력
  nicknameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0B0B12',
    marginBottom: 12,
  },
  modalSaveBtn: {
    paddingVertical: 14,
    backgroundColor: '#F6A3A6',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSaveBtnDisabled: { backgroundColor: '#F0F0F0' },
  modalSaveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
