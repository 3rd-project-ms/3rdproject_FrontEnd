import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── 목업 데이터 (백엔드 연동 후 교체) ───
const MOCK_USER = {
  nickname: '시현',
  level: '초급',
};

const MOCK_CHARACTERS = [
  { id: 1, name: '서태양', nameEn: 'Ian',  affinity: 85 },
  { id: 2, name: '리암',   nameEn: 'Liam', affinity: 42 },
  { id: 3, name: '이하준', nameEn: 'June', affinity: 60 },
];

const MOCK_STATS = {
  totalConversations: 12,
  avgPronunciation: 78,
};

// ─── 호감도 바 ───────────────────────────
function AffinityBar({ value }: { value: number }) {
  return (
    <View style={styles.affinityTrack}>
      <View style={[styles.affinityFill, { width: `${value}%` }]} />
    </View>
  );
}

// ─────────────────────────────────────────
export default function MyPageScreen() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

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
            {/* 아바타 */}
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{MOCK_USER.nickname}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv. {MOCK_USER.level}</Text>
              </View>
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

        {/* ── 내 캐릭터 ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>내 캐릭터</Text>
          {MOCK_CHARACTERS.map((char, index) => (
            <View
              key={char.id}
              style={[
                styles.charRow,
                index < MOCK_CHARACTERS.length - 1 && styles.charRowBorder,
              ]}
            >
              <View style={styles.charAvatar}>
                <Ionicons name="person-outline" size={16} color="#AEAEB2" />
              </View>
              <View style={styles.charInfo}>
                <Text style={styles.charName}>
                  {char.name}
                  <Text style={styles.charNameEn}> ({char.nameEn})</Text>
                </Text>
                <AffinityBar value={char.affinity} />
              </View>
              <Text style={styles.charAffinity}>{char.affinity}%</Text>
            </View>
          ))}
        </View>

        {/* ── 메뉴 ── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push('/(main)/session-result' as any)}
          >
            <Ionicons name="bar-chart-outline" size={20} color="#2C3A5F" />
            <Text style={styles.menuItemText}>결과 분석</Text>
            <Ionicons name="chevron-forward" size={16} color="#AEAEB2" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="book-outline" size={20} color="#2C3A5F" />
            <Text style={styles.menuItemText}>오답 노트</Text>
            <Ionicons name="chevron-forward" size={16} color="#AEAEB2" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── 편집 모달 (로그아웃 포함) ── */}
      {showEditModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowEditModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>계정 관리</Text>

            <TouchableOpacity style={styles.modalItem}>
              <Ionicons name="pencil-outline" size={18} color="#0B0B12" />
              <Text style={styles.modalItemText}>닉네임 변경</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setShowEditModal(false);
                router.replace('/(auth)/login' as any);
              }}
            >
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

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },

  // 헤더
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

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  // 카드
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 12,
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
  levelBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  levelText: { fontSize: 11, fontWeight: '600', color: '#616161' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0F0F5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, color: '#616161', fontWeight: '500' },

  // 통계
  statsGrid: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statItemRight: {
    borderLeftWidth: 1, borderLeftColor: '#F0F0F0',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#0B0B12' },
  statLabel: { fontSize: 11, color: '#AEAEB2', marginTop: 4 },

  // 캐릭터
  charRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
  },
  charRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  charAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F5',
    alignItems: 'center', justifyContent: 'center',
  },
  charInfo: { flex: 1 },
  charName: { fontSize: 13, fontWeight: '600', color: '#0B0B12' },
  charNameEn: { fontSize: 12, fontWeight: '400', color: '#AEAEB2' },
  affinityTrack: {
    height: 4, backgroundColor: '#F0F0F5',
    borderRadius: 2, marginTop: 6, overflow: 'hidden',
  },
  affinityFill: { height: '100%', backgroundColor: '#F6A3A6', borderRadius: 2 },
  charAffinity: { fontSize: 12, color: '#AEAEB2', fontWeight: '500' },

  // 메뉴
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 15, color: '#0B0B12', fontWeight: '500' },

  // 편집 모달
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
  modalItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  modalItemText: { fontSize: 15, color: '#0B0B12', fontWeight: '500' },
  modalDivider: { height: 1, backgroundColor: '#F0F0F0' },
  modalCancelBtn: {
    marginTop: 12, paddingVertical: 14,
    backgroundColor: '#F0F0F5', borderRadius: 12, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#616161' },
});
