// app/(main)/home.tsx
// 캐릭터 선택 + 난이도/성향 표시 메인 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChatStore, CHARACTERS, CharacterId, CharacterGender } from '../../store/useChatStore';
import { colors, fonts, spacing, radius, shadow } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { setCharacter, affection } = useChatStore();

  const [selectedId, setSelectedId] = useState<CharacterId>('A');
  const [selectedGender, setSelectedGender] = useState<CharacterGender>('F');

  const selectedChar = CHARACTERS[selectedId];

  const handleStart = (mode: 'text' | 'voice') => {
    setCharacter(selectedId, selectedGender);
    router.push(`/(main)/chat-${mode}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg_dark} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <Text style={styles.logo}>💬 LinguaDate</Text>
          <Text style={styles.tagline}>캐릭터와 대화하며 영어 실력 UP</Text>
        </View>

        {/* ── 캐릭터 카드 목록 ── */}
        <Text style={styles.section_title}>캐릭터 선택</Text>
        <View style={styles.card_row}>
          {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
            const char = CHARACTERS[id];
            const isSelected = selectedId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.char_card, isSelected && styles.char_card_selected]}
                onPress={() => setSelectedId(id)}
                activeOpacity={0.8}
              >
                <Text style={styles.char_emoji}>{char.emoji}</Text>
                <Text style={styles.char_name}>{char.name}</Text>
                <Text style={styles.char_desc}>{char.description}</Text>

                {/* 난이도 배지 */}
                <View style={[
                  styles.difficulty_badge,
                  id === 'A' && styles.diff_easy,
                  id === 'B' && styles.diff_hard,
                  id === 'C' && styles.diff_extreme,
                ]}>
                  <Text style={styles.diff_text}>난이도 {char.difficulty}</Text>
                </View>

                {/* 선택 표시 */}
                {isSelected && (
                  <View style={styles.selected_dot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 선택된 캐릭터 상세 ── */}
        <View style={styles.detail_card}>
          <Text style={styles.detail_emoji}>{selectedChar.emoji}</Text>
          <View style={styles.detail_info}>
            <Text style={styles.detail_name}>{selectedChar.name}</Text>
            <Text style={styles.detail_personality}>{selectedChar.personality}</Text>
          </View>
        </View>

        {/* ── 성별 선택 ── */}
        <Text style={styles.section_title}>버전 선택</Text>
        <View style={styles.gender_row}>
          <TouchableOpacity
            style={[styles.gender_btn, selectedGender === 'F' && styles.gender_selected]}
            onPress={() => setSelectedGender('F')}
            activeOpacity={0.8}
          >
            <Text style={styles.gender_icon}>👩</Text>
            <Text style={[styles.gender_label, selectedGender === 'F' && styles.gender_label_active]}>
              여성 버전
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gender_btn, selectedGender === 'M' && styles.gender_selected]}
            onPress={() => setSelectedGender('M')}
            activeOpacity={0.8}
          >
            <Text style={styles.gender_icon}>👨</Text>
            <Text style={[styles.gender_label, selectedGender === 'M' && styles.gender_label_active]}>
              남성 버전
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 호감도 바 ── */}
        <View style={styles.affection_section}>
          <View style={styles.affection_header}>
            <Text style={styles.affection_label}>♥ 호감도</Text>
            <Text style={styles.affection_value}>{affection}</Text>
          </View>
          <View style={styles.affection_track}>
            <View style={[styles.affection_fill, { width: `${affection}%` }]} />
          </View>
        </View>

        {/* ── 시작 버튼 ── */}
        <Text style={styles.section_title}>대화 방식 선택</Text>
        <View style={styles.start_buttons}>
          <TouchableOpacity
            style={styles.start_btn_text}
            onPress={() => handleStart('text')}
            activeOpacity={0.85}
          >
            <Text style={styles.start_btn_icon}>💬</Text>
            <Text style={styles.start_btn_label}>텍스트 채팅</Text>
            <Text style={styles.start_btn_sub}>타이핑으로 대화</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.start_btn_voice}
            onPress={() => handleStart('voice')}
            activeOpacity={0.85}
          >
            <Text style={styles.start_btn_icon}>📞</Text>
            <Text style={styles.start_btn_label}>음성 통화</Text>
            <Text style={styles.start_btn_sub}>말하기로 대화</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg_dark },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  // ── 헤더 ──
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logo: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.text_primary,
  },
  tagline: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    marginTop: 4,
  },

  // ── 섹션 타이틀 ──
  section_title: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text_muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  // ── 캐릭터 카드 ──
  card_row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  char_card: {
    flex: 1,
    backgroundColor: colors.bg_card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  char_card_selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary_dim,
    ...shadow.card,
  },
  char_emoji: { fontSize: 28, marginBottom: 6 },
  char_name: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text_primary,
    textAlign: 'center',
  },
  char_desc: {
    fontSize: fonts.size.xs,
    color: colors.text_muted,
    textAlign: 'center',
    marginTop: 3,
  },
  difficulty_badge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  diff_easy: { backgroundColor: 'rgba(78,205,164,0.15)' },
  diff_hard: { backgroundColor: 'rgba(255,179,71,0.15)' },
  diff_extreme: { backgroundColor: 'rgba(255,107,157,0.15)' },
  diff_text: { fontSize: fonts.size.xs, color: colors.text_secondary },
  selected_dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // ── 상세 카드 ──
  detail_card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.bg_card,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detail_emoji: { fontSize: 32 },
  detail_info: { flex: 1 },
  detail_name: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    color: colors.text_primary,
  },
  detail_personality: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    marginTop: 3,
    lineHeight: 18,
  },

  // ── 성별 선택 ──
  gender_row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  gender_btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bg_card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  gender_selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary_dim,
  },
  gender_icon: { fontSize: 22 },
  gender_label: {
    fontSize: fonts.size.md,
    color: colors.text_secondary,
    fontWeight: fonts.weight.medium,
  },
  gender_label_active: { color: colors.primary },

  // ── 호감도 ──
  affection_section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  affection_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  affection_label: {
    fontSize: fonts.size.sm,
    color: colors.text_secondary,
    fontWeight: fonts.weight.medium,
  },
  affection_value: {
    fontSize: fonts.size.sm,
    color: colors.primary,
    fontWeight: fonts.weight.bold,
  },
  affection_track: {
    height: 6,
    backgroundColor: colors.bg_card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  affection_fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // ── 시작 버튼 ──
  start_buttons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  start_btn_text: {
    flex: 1,
    backgroundColor: colors.bg_card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  start_btn_voice: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  start_btn_icon: { fontSize: 28, marginBottom: 6 },
  start_btn_label: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text_primary,
  },
  start_btn_sub: {
    fontSize: fonts.size.xs,
    color: colors.text_secondary,
    marginTop: 2,
  },
});
