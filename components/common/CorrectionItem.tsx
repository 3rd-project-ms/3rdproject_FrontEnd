import React, { useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/tokens';

export interface CorrectionItemProps {
  original: string;
  corrected: string;
  style?: StyleProp<ViewStyle>;
}

interface LineMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CorrectionItem({ original, corrected, style }: CorrectionItemProps) {
  const [lines, setLines] = useState<LineMetrics[]>([]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.originalWrap}>
        <Text
          style={styles.original}
          onTextLayout={(e) => setLines([...e.nativeEvent.lines])}
        >
          {original}
        </Text>
        {lines.map((line, i) => (
          <View
            key={i}
            style={[
              styles.strikethrough,
              {
                width: line.width,
                top: line.y + line.height / 2,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.corrected}>{corrected}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  originalWrap: {
    flex: 1,
  },
  original: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
  },
  strikethrough: {
    position: 'absolute',
    left: 0,
    height: 1.5,
    backgroundColor: Colors.danger,
  },
  arrow: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textSecondary,
  },
  corrected: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
    flex: 2,
  },
});
