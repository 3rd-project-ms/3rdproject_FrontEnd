import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CorrectionItem from '@/components/common/CorrectionItem';
import ReportChatTabs, { ChatMode } from '@/components/report/ReportChatTabs';
import { SharedStyles } from '@/components/common/styles/shared';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Colors, Typography, Spacing, Shadow } from '@/constants/tokens';
import { Correction } from '@/types/api';

export interface ReportCorrectionSectionProps {
  chatCorrections: Correction[];
  voiceCorrections: Correction[];
  grammarFeedback: string | null;
  initialMode?: ChatMode;
  style?: StyleProp<ViewStyle>;
}

export default function ReportCorrectionSection({
  chatCorrections,
  voiceCorrections,
  grammarFeedback,
  initialMode = '채팅',
  style,
}: ReportCorrectionSectionProps) {
  const [activeMode, setActiveMode] = useState<ChatMode>(initialMode);
  const { scrollRef, showScrollDown, handleScroll, handleContentSizeChange, handleLayout, scrollToEnd } =
    useScrollVisibility();

  const corrections = activeMode === '채팅' ? chatCorrections : voiceCorrections;

  return (
    <View style={[styles.section, style]}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>교정된 표현</Text>
        <ReportChatTabs activeMode={activeMode} onModeChange={setActiveMode} />
      </View>

<View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          {corrections.length === 0 ? (
            <Text style={styles.emptyCorrections}>오늘은 교정된 표현이 없어요.</Text>
          ) : (
            corrections.map((item, index) => (
              <CorrectionItem key={item.id ?? index} original={item.original_sentence} corrected={item.corrected_sentence} />
            ))
          )}
          {!!grammarFeedback && (
            <View style={styles.grammarFeedbackRow}>
              <Ionicons name="bulb-outline" size={Typography.size.sm} color={Colors.textSecondary} />
              <Text style={styles.grammarFeedback}>{grammarFeedback}</Text>
            </View>
          )}
        </ScrollView>

        {showScrollDown && (
          <TouchableOpacity
            style={styles.scrollDownButton}
            onPress={scrollToEnd}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    paddingLeft: 27,
    paddingTop: 18,
    paddingRight: Spacing.screenHorizontal,
    paddingBottom: Spacing.screenHorizontal,
    marginBottom: 8,
    ...Shadow.cardFull,
    overflow: 'hidden',
    height: 240,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  },
emptyCorrections: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.screenHorizontal,
  },
  grammarFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
  },
  grammarFeedback: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  scrollDownButton: {
    ...SharedStyles.scrollDownButton,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});
