import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CorrectionItemProps {
  original: string;
  corrected: string;
}

interface LineMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CorrectionItem({ original, corrected }: CorrectionItemProps) {
  const [lines, setLines] = useState<LineMetrics[]>([]);

  return (
    <View style={styles.container}>
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
    borderBottomColor: '#E0E0E0',
  },
  originalWrap: {
    flex: 1,
  },
  original: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
  },
  strikethrough: {
    position: 'absolute',
    left: 0,
    height: 1.5,
    backgroundColor: '#F43F5E',
  },
  arrow: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
  },
  corrected: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    flex: 2,
  },
});
