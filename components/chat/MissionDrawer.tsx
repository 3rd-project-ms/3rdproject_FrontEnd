import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MissionItem } from '@/constants/missionData';

interface Props {
  visible: boolean;
  onClose: () => void;
  stageName: string;
  missions: (MissionItem & { cleared: boolean })[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = (SCREEN_WIDTH * 4) / 5;

export default function MissionDrawer({ visible, onClose, stageName, missions }: Props) {
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && translateX._value === DRAWER_WIDTH) return null;

  const allCleared = missions.every((m) => m.cleared);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 반투명 오버레이 */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* 드로어 패널 */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* 헤더 */}
        <View style={styles.drawerHeader}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color="#555" />
          </Pressable>
          <Text style={styles.drawerTitle}>미션</Text>
        </View>

        {/* 스테이지명 */}
        <View style={styles.stageNameBox}>
          <Text style={styles.stageNameText}>{stageName}</Text>
          {allCleared && (
            <View style={styles.clearBadge}>
              <Text style={styles.clearBadgeText}>CLEAR!</Text>
            </View>
          )}
        </View>

        {/* 미션 체크리스트 */}
        <ScrollView contentContainerStyle={styles.missionList}>
          {missions.map((mission) => (
            <View key={mission.id} style={styles.missionRow}>
              <View style={[styles.checkbox, mission.cleared && styles.checkboxChecked]}>
                {mission.cleared && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.missionLabel, mission.cleared && styles.missionLabelCleared]}>
                {mission.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 하단 안내 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            미션 3개를 모두 완료하면{'\n'}자동으로 리포트로 이동해요 ✨
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: { marginRight: 12 },
  drawerTitle: { fontSize: 18, fontWeight: '700', color: '#0B0B12' },

  stageNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  stageNameText: { fontSize: 14, fontWeight: '600', color: '#2C3A5F', flex: 1 },
  clearBadge: {
    backgroundColor: '#F6A3A6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  clearBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  missionList: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#F6A3A6',
    borderColor: '#F6A3A6',
  },
  missionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  missionLabelCleared: {
    color: '#BBBBBB',
    textDecorationLine: 'line-through',
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 18,
    textAlign: 'center',
  },
});
