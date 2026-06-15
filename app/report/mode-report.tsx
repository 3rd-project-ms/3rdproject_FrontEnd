import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Loading from '@/components/common/Loading';
import ReportSummaryContent from '@/components/report/ReportSummaryContent';

import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';
import { BASE_URL } from '@/services/chatService';
import { CharacterItem, CharacterListApiResponse, ReportApiResponse } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { buildReportDisplayViewModel } from '@/utils/reportSelectors';

interface SessionItem {
  session_id: string;
  day_number: number;
  latest_day: number;
}

interface DayOption {
  day_number: number;
  session_id: string;
}

export default function ModeReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayOptions, setDayOptions] = useState<DayOption[]>([]);
  const [isDaysLoading, setIsDaysLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportApiResponse | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const setStoreReportData = useChatStore((s) => s.setReportData);

  // 캐릭터 목록 로드
  useEffect(() => {
    if (userId === null) return;
    setIsLoading(true);
    fetch(`${BASE_URL}/api/characters/my-list?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('server');
        return res.json();
      })
      .then((json: CharacterListApiResponse) => { setCharacters(json.data); })
      .catch(() => { setIsLoading(false); })
      .finally(() => { setIsLoading(false); });
  }, [userId]);

  // 세션 목록 로드 (캐릭터 변경 시)
  useEffect(() => {
    const characterId = characters[currentCharacterIndex]?.id;
    if (!characterId || userId === null) return;

    let active = true;
    setIsDaysLoading(true);
    setCurrentDay(null);
    setDayOptions([]);
    setReportData(null);

    fetch(`${BASE_URL}/api/characters/${characterId}/sessions?userId=${userId}`)
      .then((res) => res.json())
      .then((json: { data: SessionItem[] }) => {
        if (!active) return;
        const opts: DayOption[] = (json.data ?? []).map((s) => ({
          day_number: s.day_number,
          session_id: s.session_id,
        }));
        setDayOptions(opts);
        if (opts.length > 0) setCurrentDay(opts[0].day_number);
      })
      .catch(() => {
        if (active) setDayOptions([]);
      })
      .finally(() => {
        if (active) setIsDaysLoading(false);
      });

    return () => { active = false; };
  }, [characters[currentCharacterIndex]?.id, userId]);

  // 리포트 로드 (day 선택 시)
  const currentSessionId = dayOptions.find((o) => o.day_number === currentDay)?.session_id ?? null;

  useEffect(() => {
    if (!currentSessionId || userId === null) return;

    let active = true;
    setIsReportLoading(true);

    fetch(`${BASE_URL}/api/reports/sessions/${currentSessionId}?userId=${userId}`)
      .then((res) => res.json())
      .then((json: ReportApiResponse) => {
        if (!active) return;
        setReportData(json);
        setStoreReportData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsReportLoading(false);
      });

    return () => { active = false; };
  }, [currentSessionId, userId]);

  if (isLoading) return <Loading />;
  if (characters.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.noSessionText}>아직 기록이 없습니다.</Text>
      </View>
    );
  }

  const currentCharacter = characters[currentCharacterIndex];
  const isFirstCharacter = currentCharacterIndex === 0;
  const isLastCharacter = currentCharacterIndex === characters.length - 1;
  const hasSessions = dayOptions.length > 0;
  const vm = reportData ? buildReportDisplayViewModel(reportData) : null;

  return (
    <View style={styles.container}>
      {/* 캐릭터 네비게이션 */}
      <View style={[styles.navSection, { paddingTop: getHeaderTop(insets.top) }]}>
        <TouchableOpacity
          onPress={() => setCurrentCharacterIndex((i) => i - 1)}
          disabled={isFirstCharacter}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={isFirstCharacter ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.characterName}>{currentCharacter.name}</Text>
        <TouchableOpacity
          onPress={() => setCurrentCharacterIndex((i) => i + 1)}
          disabled={isLastCharacter}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-forward" size={20} color={isLastCharacter ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarRow}>
        <TouchableOpacity
          onPress={() => setShowDayPicker(true)}
          disabled={isDaysLoading}
          activeOpacity={0.7}
        >
          {isDaysLoading
            ? <ActivityIndicator size="small" color={Colors.textPrimary} />
            : <Ionicons name="calendar-outline" size={22} color={hasSessions ? Colors.textPrimary : Colors.textMuted} />
          }
        </TouchableOpacity>
        {!isDaysLoading && !hasSessions && (
          <Text style={styles.noSessionText}>기록 없음</Text>
        )}
      </View>

      {isReportLoading ? (
        <Loading />
      ) : (
        <ReportSummaryContent
          avgPronScore={vm?.avgPronScore ?? null}
          correctionCount={vm?.correctionCount ?? 0}
          isPronNavigable={vm != null && vm.avgPronScore !== null}
          onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
          affinityProgress={vm?.affinityProgress ?? 0}
          affinityValue={vm?.affinityValue ?? 0}
          affinityLabel={`${currentCharacter.name} 호감도`}
          affinityChange={undefined}
          chatCorrections={vm?.corrections ?? []}
          voiceCorrections={vm?.corrections ?? []}
          grammarFeedback={vm?.grammarFeedback ?? ''}
          onReviewPress={() => router.push(ROUTES.REVIEW as any)}
          onPrimaryPress={() => router.replace(ROUTES.CHAR_HOME as any)}
          primaryLabel="메인으로 돌아가기"
        />
      )}

      {/* Day 선택 팝업 */}
      <Modal
        visible={showDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayPicker(false)}
        >
          <View style={[styles.dayPickerCard, { top: getHeaderTop(insets.top) + 36, right: Spacing.screenHorizontal }]}>
            {!hasSessions ? (
              <View style={styles.dayOption}>
                <Text style={styles.noSessionText}>학습 기록이 없습니다</Text>
              </View>
            ) : (
              dayOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.day_number}
                  style={[styles.dayOption, opt.day_number === currentDay && styles.dayOptionActive]}
                  onPress={() => { setCurrentDay(opt.day_number); setShowDayPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayOptionText, opt.day_number === currentDay && styles.dayOptionTextActive]}>
                    Day {opt.day_number}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 4,
  },
  characterName: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 8,
  },
  noSessionText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
  },
  dayPickerCard: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  dayOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayOptionActive: {
    backgroundColor: Colors.primaryAlpha,
  },
  dayOptionText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
  },
  dayOptionTextActive: {
    fontFamily: Typography.family.semiBold,
    color: Colors.accentDark,
  },
});
