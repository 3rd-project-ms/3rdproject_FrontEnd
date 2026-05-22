import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NavArrowProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export default function NavArrow({
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
}: NavArrowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, prevDisabled && styles.disabled]}
        onPress={onPrev}
        disabled={prevDisabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrow, prevDisabled && styles.arrowDisabled]}>{'‹'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, nextDisabled && styles.disabled]}
        onPress={onNext}
        disabled={nextDisabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrow, nextDisabled && styles.arrowDisabled]}>{'›'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#E8E8E8',
  },
  arrow: {
    fontSize: 28,
    color: '#1A1A1A',
    lineHeight: 34,
  },
  arrowDisabled: {
    color: '#BBBBBB',
  },
});
