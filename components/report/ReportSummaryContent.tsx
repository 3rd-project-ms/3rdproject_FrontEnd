import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import ReportActionButtons from '@/components/report/ReportActionButtons';
import ReportAffinitySection from '@/components/report/ReportAffinitySection';
import ReportCorrectionSection from '@/components/report/ReportCorrectionSection';
import ReportScoreRow from '@/components/report/ReportScoreRow';

import { Correction } from '@/types/api';
import { Spacing } from '@/constants/tokens';

export interface ReportSummaryContentProps {
  avgPronScore: number | null;
  correctionCount: number;
  isPronNavigable: boolean;
  onPronPress: () => void;
  affinityProgress: number;
  affinityValue: number;
  chatCorrections: Correction[];
  voiceCorrections: Correction[];
  grammarFeedback: string | null;
  affinityLabel: string;
  affinityChange?: number;
  onReviewPress: () => void;
  onPrimaryPress: () => void;
  primaryLabel: string;
  style?: StyleProp<ViewStyle>;
}

export default function ReportSummaryContent({
  avgPronScore,
  correctionCount,
  isPronNavigable,
  onPronPress,
  affinityProgress,
  affinityValue,
  chatCorrections,
  voiceCorrections,
  grammarFeedback,
  affinityLabel,
  affinityChange,
  onReviewPress,
  onPrimaryPress,
  primaryLabel,
  style,
}: ReportSummaryContentProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.body}>
        <ReportScoreRow
          avgPronScore={avgPronScore}
          correctionsCount={correctionCount}
          isPronNavigable={isPronNavigable}
          onPronPress={onPronPress}
        />
        <ReportAffinitySection
          label={affinityLabel}
          affinityProgress={affinityProgress}
          affinityValue={affinityValue}
          change={affinityChange}
        />
        <ReportCorrectionSection
          chatCorrections={chatCorrections}
          voiceCorrections={voiceCorrections}
          grammarFeedback={grammarFeedback}
        />
      </View>
      <ReportActionButtons
        onReviewPress={onReviewPress}
        onPrimaryPress={onPrimaryPress}
        primaryLabel={primaryLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
  },
});
