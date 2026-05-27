import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FilterType = '전체' | '문법' | '발음' | '표현';

interface ReviewItem {
  id: string;
  type: Exclude<FilterType, '전체'>;
  english: string;
  korean: string;
}

interface DateGroup {
  day: string;
  character: string;
  items: ReviewItem[];
}

const FILTERS: FilterType[] = ['전체', '문법', '발음', '표현'];

const INITIAL_GROUPS: DateGroup[] = [
  {
    day: 'Day1',
    character: 'Jamie',
    items: [
      {
        id: '1',
        type: '표현',
        english: '"In New York, we don\'t really say hello."',
        korean: '뉴욕에서 우리는 \'hello\'라고 잘 안 해요.',
      },
      {
        id: '2',
        type: '문법',
        english: '"That\'s how you order like a local without stressing out."',
        korean: '이렇게 하면 스트레스 없이 현지인처럼 주문할 수 있어요.',
      },
      {
        id: '3',
        type: '발음',
        english: '"Can I get a coffee to go, please?"',
        korean: '커피 테이크아웃 한 잔 주실 수 있나요?',
      },
      {
        id: '4',
        type: '문법',
        english: '"I\'ve been waiting for this for a long time."',
        korean: '저 이걸 정말 오래 기다려 왔어요.',
      },
    ],
  },
  {
    day: 'Day2',
    character: 'ALEX',
    items: [
      {
        id: '5',
        type: '발음',
        english: '"The weather is really nice today, isn\'t it?"',
        korean: '오늘 날씨 정말 좋죠, 그렇지 않나요?',
      },
      {
        id: '6',
        type: '표현',
        english: '"I\'m just browsing, thanks."',
        korean: '그냥 구경하는 거예요, 감사합니다.',
      },
      {
        id: '7',
        type: '문법',
        english: '"Would you mind if I sat here?"',
        korean: '여기 앉아도 괜찮을까요?',
      },
      {
        id: '8',
        type: '발음',
        english: '"Could you speak a little more slowly?"',
        korean: '조금 더 천천히 말씀해 주실 수 있나요?',
      },
    ],
  },
  {
    day: 'Day3',
    character: 'SARAH',
    items: [
      {
        id: '9',
        type: '표현',
        english: '"That\'s totally up to you."',
        korean: '그건 완전히 당신 마음이에요.',
      },
      {
        id: '10',
        type: '문법',
        english: '"I should have called you earlier."',
        korean: '더 일찍 전화했어야 했는데.',
      },
      {
        id: '11',
        type: '발음',
        english: '"I\'d like to make a reservation for two."',
        korean: '두 명으로 예약하고 싶어요.',
      },
      {
        id: '12',
        type: '표현',
        english: '"It\'s not really my thing, to be honest."',
        korean: '솔직히 말하면 제 취향은 아니에요.',
      },
    ],
  },
];

export default function ReviewScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [groups, setGroups] = useState<DateGroup[]>(INITIAL_GROUPS);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setScrollY(y);
    setShowScrollTop(y > 200);
  };

  const THUMB_HEIGHT = 60;
  const maxScrollY = Math.max(contentHeight - containerHeight, 1);
  const maxThumbTop = Math.max(containerHeight - THUMB_HEIGHT, 0);
  const thumbTop = Math.min((scrollY / maxScrollY) * maxThumbTop, maxThumbTop);
  const showScrollbar = contentHeight > containerHeight;

  const handleDelete = (itemId: string) => {
    setGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== itemId),
        }))
        .filter((group) => group.items.length > 0)
    );
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const matchesFilter = activeFilter === '전체' || item.type === activeFilter;
          const matchesSearch =
            searchText === '' ||
            item.english.toLowerCase().includes(searchText.toLowerCase()) ||
            item.korean.includes(searchText);
          return matchesFilter && matchesSearch;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, activeFilter, searchText]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'‹'}</Text>
          <Text style={styles.backLabel}>복습하기</Text>
        </TouchableOpacity>
      </View>

      {/* 검색바 */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="복습문장 검색하기"
          placeholderTextColor="#AAAAAA"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 필터 칩 */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, activeFilter === filter && styles.filterLabelActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 날짜별 카드 목록 + 최상단 버튼 래퍼 */}
      <View
        style={styles.scrollContainer}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(_, h) => setContentHeight(h)}
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
                {/* Day 구분 텍스트 */}
                <Text style={styles.dayLabel}>
                  {group.day} · {group.character}
                </Text>

                {/* 카드 목록 */}
                {group.items.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardBody}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.type}</Text>
                      </View>
                      <Text style={styles.cardEnglish}>{item.english}</Text>
                      <Text style={styles.cardKorean}>{item.korean}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#AAAAAA" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {/* 커스텀 스크롤바 */}
        {showScrollbar && (
          <View
            pointerEvents="none"
            style={[styles.scrollbarThumb, { top: thumbTop }]}
          />
        )}

        {/* 최상단 이동 버튼 */}
        {showScrollTop && (
          <TouchableOpacity
            style={styles.scrollTopButton}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF8',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backIcon: {
    fontSize: 26,
    color: '#0B0B12',
    lineHeight: 26,
  },
  backLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B0B12',
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 38,
    fontSize: 14,
    color: '#0B0B12',
    textAlign: 'center',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#F6A3A6',
    borderColor: '#F6A3A6',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B12',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 24,
  },
  dateGroup: {
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#616161',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 36,
    paddingTop: 11,
    paddingRight: 16,
    paddingBottom: 10,
    gap: 12,
    shadowColor: '#E0E0E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    height: 23,
    backgroundColor: '#F6EEEE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '600',
  },
  cardEnglish: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B12',
    lineHeight: 20,
  },
  cardKorean: {
    fontSize: 12,
    fontWeight: '400',
    color: '#616161',
    lineHeight: 18,
    marginTop: 12,
  },
  deleteButton: {
    paddingTop: 2,
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  scrollbarThumb: {
    position: 'absolute',
    right: 2,
    width: 4,
    height: 60,
    borderRadius: 999,
    backgroundColor: '#AAAAAA',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#F6A3A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
