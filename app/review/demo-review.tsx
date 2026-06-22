import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Colors, Typography, Spacing } from '@/constants/tokens';
import { DateGroup, FilterType } from '@/hooks/useReviewFilter';

const STAR_PATH = 'M11.4417 2.925L12.9083 5.85833C13.1083 6.26667 13.6417 6.65833 14.0917 6.73333L16.75 7.175C18.45 7.45833 18.85 8.69167 17.625 9.90833L15.5583 11.975C15.2083 12.325 15.0167 13 15.125 13.4833L15.7167 16.0417C16.1833 18.0667 15.1083 18.85 13.3167 17.7917L10.825 16.3167C10.375 16.05 9.63333 16.05 9.175 16.3167L6.68333 17.7917C4.9 18.85 3.81667 18.0583 4.28333 16.0417L4.875 13.4833C4.98333 13 4.79167 12.325 4.44167 11.975L2.375 9.90833C1.15833 8.69167 1.55 7.45833 3.25 7.175L5.90833 6.73333C6.35 6.65833 6.88333 6.26667 7.08333 5.85833L8.55 2.925C9.35 1.33333 10.65 1.33333 11.4417 2.925Z';

function StarIcon({ active }: { active: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d={STAR_PATH}
        fill={active ? '#FFEE33' : 'none'}
        stroke={active ? '#FFEE33' : Colors.textMuted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const FILTERS: FilterType[] = ['전체', '문법', '발음', '표현', '저장'];

const DEMO_GROUPS: DateGroup[] = [
  {
    day: '2026.06.23',
    character: '시엔나',
    items: [
      {
        id: '1',
        type: '표현',
        corrected_sentence: 'Yes, I moved here a few days ago. The neighborhood is very nice!',
        translation: '네, 며칠 전에 이사왔어요. 동네가 정말 좋아요!',
        starred: false,
      },
    ],
  },
];

export default function DemoReviewScreen() {
  const router = useRouter();
  const {
    scrollRef, scrollY, contentHeight, containerHeight,
    showScrollTop, handleScroll, handleContentSizeChange, handleLayout, scrollToTop,
  } = useScrollVisibility();

  const [groups, setGroups] = useState<DateGroup[]>(DEMO_GROUPS);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

  const handleStarToggle = (itemId: string) => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((i) =>
          i.id === itemId ? { ...i, starred: !i.starred } : i
        ),
      }))
    );
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const matchesFilter =
            activeFilter === '전체' ||
            (activeFilter === '저장' ? item.starred : item.type === activeFilter);
          const matchesSearch =
            searchText === '' ||
            item.corrected_sentence.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.translation?.includes(searchText) ?? false);
          return matchesFilter && matchesSearch;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, activeFilter, searchText]);

  const THUMB_HEIGHT = 60;
  const maxScrollY = Math.max(contentHeight - containerHeight, 1);
  const maxThumbTop = Math.max(containerHeight - THUMB_HEIGHT, 0);
  const thumbTop = Math.min((scrollY / maxScrollY) * maxThumbTop, maxThumbTop);
  const showScrollbar = contentHeight > containerHeight;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>복습하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="복습문장 검색하기"
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          caretHidden={false}
          textAlign="center"
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.7}
          >
            {filter === '저장' ? (
              <StarIcon active={groups.some((g) => g.items.some((i) => i.starred))} />
            ) : (
              <Text style={[styles.filterLabel, activeFilter === filter && styles.filterLabelActive]}>
                {filter}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          decelerationRate={0.98}
        >
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            </View>
          ) : (
            filteredGroups.map((group, index) => (
              <View key={group.day} style={styles.dateGroup}>
                {index > 0 && <View style={styles.divider} />}
                <Text style={styles.dayLabel}>{group.day} · {group.character}</Text>
                {group.items.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardBody}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.type}</Text>
                      </View>
                      <Text style={styles.cardEnglish}>{item.corrected_sentence}</Text>
                      {item.translation ? <Text style={styles.cardKorean}>{item.translation}</Text> : null}
                    </View>
                    <TouchableOpacity
                      style={styles.starButton}
                      onPress={() => handleStarToggle(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <StarIcon active={item.starred} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {showScrollbar && (
          <View pointerEvents="none" style={[styles.scrollbarThumb, { top: thumbTop }]} />
        )}

        {showScrollTop && (
          <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop} activeOpacity={0.8}>
            <Ionicons name="chevron-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: Spacing.headerTop, paddingHorizontal: Spacing.screenHorizontal, paddingBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLabel: { fontSize: Typography.size.lg, fontFamily: Typography.family.semiBold, color: Colors.textPrimary },
  searchWrap: { paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.screenHorizontal, marginBottom: 36 },
  searchInput: {
    backgroundColor: Colors.white, borderRadius: Spacing.borderRadius.pill,
    paddingHorizontal: Spacing.screenHorizontal, height: 38,
    fontSize: Typography.size.md, fontFamily: Typography.family.regular,
    color: Colors.textPrimary, textAlign: 'center', textAlignVertical: 'center',
    shadowColor: Colors.textPrimary, shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.screenHorizontal, gap: 12, marginBottom: 14 },
  filterChip: {
    flex: 1, paddingHorizontal: 14, height: 33, borderRadius: Spacing.borderRadius.button,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: Colors.primaryAlpha, borderWidth: 1.5, borderColor: Colors.primary },
  filterLabel: { fontSize: Typography.size.md, fontFamily: Typography.family.semiBold, color: Colors.textSecondary, textAlign: 'center' },
  filterLabelActive: { color: Colors.textPrimary },
  scrollContainer: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.screenHorizontal, paddingBottom: 40, gap: 20 },
  dateGroup: { gap: 10 },
  divider: { height: 1, backgroundColor: Colors.border },
  dayLabel: { fontSize: Typography.size.md, fontFamily: Typography.family.regular, color: Colors.textSecondary, marginLeft: 7 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white,
    borderWidth: 2, borderColor: Colors.border, borderRadius: Spacing.borderRadius.card,
    paddingLeft: 20, paddingTop: 11, paddingRight: 14, paddingBottom: 14, gap: 12,
    shadowColor: Colors.border, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  cardBody: { flex: 1, gap: 8 },
  badge: {
    alignSelf: 'flex-start', height: 23, backgroundColor: Colors.accentLight,
    borderRadius: Spacing.borderRadius.card, paddingHorizontal: 10, paddingVertical: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: Typography.size.xs, color: Colors.textPrimary, fontFamily: Typography.family.semiBold },
  cardEnglish: { fontSize: Typography.size.md, fontFamily: Typography.family.semiBold, color: Colors.textPrimary, lineHeight: 20, letterSpacing: -0.28 },
  cardKorean: { fontSize: Typography.size.sm, fontFamily: Typography.family.regular, color: Colors.textSecondary, lineHeight: 18 },
  starButton: { paddingTop: 1 },
  emptyWrap: { paddingTop: 80, alignItems: 'center' },
  emptyText: { fontSize: Typography.size.md, fontFamily: Typography.family.regular, color: Colors.textMuted },
  scrollbarThumb: { position: 'absolute', right: 2, width: 4, height: 60, borderRadius: Spacing.borderRadius.progress, backgroundColor: Colors.textMuted, opacity: 0.8 },
  scrollTopButton: { position: 'absolute', bottom: 28, right: 20, width: 36, height: 36, borderRadius: Spacing.borderRadius.pill, backgroundColor: Colors.primaryAlpha, alignItems: 'center', justifyContent: 'center' },
});
