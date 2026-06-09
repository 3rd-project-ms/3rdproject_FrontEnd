import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ReportSummaryContent from '@/components/report/ReportSummaryContent';

import { ROUTES } from '@/constants/routes';
import { Colors, Typography, Spacing, getHeaderTop } from '@/constants/tokens';
import { BASE_URL } from '@/services/chatService';
import { CharacterItem, CharacterListApiResponse } from '@/types/api';

export default function ModeReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/characters/my-list?userId=`)
      .then((res) => res.json())
      .then((json: CharacterListApiResponse) => {
        setCharacters(json.data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || characters.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  const currentCharacter = characters[currentCharacterIndex];
  const isFirstCharacter = currentCharacterIndex === 0;
  const isLastCharacter = currentCharacterIndex === characters.length - 1;

  const handlePrevCharacter = () => {
    const newIndex = currentCharacterIndex - 1;
    setCurrentCharacterIndex(newIndex);
    setCurrentDay(1);
  };

  const handleNextCharacter = () => {
    const newIndex = currentCharacterIndex + 1;
    setCurrentCharacterIndex(newIndex);
    setCurrentDay(1);
  };

  // TODO(api): GET /api/characters/{character_id}/sessions 연동 후 실제 day 횟수로 교체
  const dayOptions = Array.from({ length: 1 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* 캐릭터 네비게이션 */}
      <View style={[styles.navSection, { paddingTop: getHeaderTop(insets.top) }]}>
        <TouchableOpacity
          onPress={handlePrevCharacter}
          disabled={isFirstCharacter}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={isFirstCharacter ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.characterName}>{currentCharacter.name}</Text>
        <TouchableOpacity
          onPress={handleNextCharacter}
          disabled={isLastCharacter}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-forward" size={20} color={isLastCharacter ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarRow}>
        <TouchableOpacity onPress={() => setShowDayPicker(true)} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ReportSummaryContent
        avgPronScore={null}
        correctionCount={0}
        isPronNavigable={false}
        onPronPress={() => router.push(ROUTES.PRON_OVERVIEW as any)}
        affinityProgress={0}
        affinityValue={0}
        affinityLabel={`${currentCharacter.name} 호감도`}
        affinityChange={undefined}
        chatCorrections={[]}
        voiceCorrections={[]}
        grammarFeedback=""
        onReviewPress={() => router.push(ROUTES.REVIEW as any)}
        onPrimaryPress={() => router.replace(ROUTES.CHAR_HOME as any)}
        primaryLabel="메인으로 돌아가기"
      />

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
            {dayOptions.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayOption, day === currentDay && styles.dayOptionActive]}
                onPress={() => { setCurrentDay(day); setShowDayPicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayOptionText, day === currentDay && styles.dayOptionTextActive]}>
                  Day {day}
                </Text>
              </TouchableOpacity>
            ))}
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
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 8,
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
    minWidth: 100,
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
