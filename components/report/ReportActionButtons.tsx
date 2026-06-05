import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import PrimaryButton from '@/components/common/PrimaryButton';
import { Spacing } from '@/constants/tokens';

export interface ReportActionButtonsProps {
  onReviewPress: () => void;
  onPrimaryPress: () => void;
  primaryLabel: string;
  style?: StyleProp<ViewStyle>;
}

export default function ReportActionButtons({
  onReviewPress,
  onPrimaryPress,
  primaryLabel,
  style,
}: ReportActionButtonsProps) {
  return (
    <View style={[styles.group, style]}>
      <PrimaryButton
        label="복습페이지로 가기"
        variant="outline"
        onPress={onReviewPress}
      />
      <PrimaryButton
        label={primaryLabel}
        variant="primary"
        onPress={onPrimaryPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 40,
  },
});
