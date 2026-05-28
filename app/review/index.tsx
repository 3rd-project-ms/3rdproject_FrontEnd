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
import Svg, { Path } from 'react-native-svg';

const STAR_PATH =
  'M11.4417 2.925L12.9083 5.85833C13.1083 6.26667 13.6417 6.65833 14.0917 6.73333L16.75 7.175C18.45 7.45833 18.85 8.69167 17.625 9.90833L15.5583 11.975C15.2083 12.325 15.0167 13 15.125 13.4833L15.7167 16.0417C16.1833 18.0667 15.1083 18.85 13.3167 17.7917L10.825 16.3167C10.375 16.05 9.63333 16.05 9.175 16.3167L6.68333 17.7917C4.9 18.85 3.81667 18.0583 4.28333 16.0417L4.875 13.4833C4.98333 13 4.79167 12.325 4.44167 11.975L2.375 9.90833C1.15833 8.69167 1.55 7.45833 3.25 7.175L5.90833 6.73333C6.35 6.65833 6.88333 6.26667 7.08333 5.85833L8.55 2.925C9.35 1.33333 10.65 1.33333 11.4417 2.925Z';

function StarIcon({ active }: { active: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d={STAR_PATH}
        fill={active ? '#FFEE33' : 'none'}
        stroke={active ? '#FFEE33' : '#AAAAAA'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type FilterType = '전체' | '문법' | '발음' | '표현' | '저장';

interface ReviewItem {
  id: string;
  type: Exclude<FilterType, '전체'>;
  english: string;
  korean: string;
  starred: boolean;
}

interface DateGroup {
  day: string;
  character: string;
  items: ReviewItem[];
}

const FILTERS: FilterType[] = ['전체', '문법', '발음', '표현', '저장'];

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
        starred: false,
      },
      {
        id: '2',
        type: '문법',
        english: '"That\'s how you order like a local without stressing out."',
        korean: '이렇게 하면 스트레스 없이 현지인처럼 주문할 수 있어요.',
        starred: false,
      },
      {
        id: '3',
        type: '발음',
        english: '"Can I get a coffee to go, please?"',
        korean: '커피 테이크아웃 한 잔 주실 수 있나요?',
        starred: false,
      },
      {
        id: '4',
        type: '문법',
        english: '"I\'ve been waiting for this for a long time."',
        korean: '저 이걸 정말 오래 기다려 왔어요.',
        starred: false,
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
        starred: false,
      },
      {
        id: '6',
        type: '표현',
        english: '"I\'m just browsing, thanks."',
        korean: '그냥 구경하는 거예요, 감사합니다.',
        starred: false,
      },
      {
        id: '7',
        type: '문법',
        english: '"Would you mind if I sat here?"',
        korean: '여기 앉아도 괜찮을까요?',
        starred: false,
      },
      {
        id: '8',
        type: '발음',
        english: '"Could you speak a little more slowly?"',
        korean: '조금 더 천천히 말씀해 주실 수 있나요?',
        starred: false,
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
        starred: false,
      },
      {
        id: '10',
        type: '문법',
        english: '"I should have called you earlier."',
        korean: '더 일찍 전화했어야 했는데.',
        starred: false,
      },
      {
        id: '11',
        type: '발음',
        english: '"I\'d like to make a reservation for two."',
        korean: '두 명으로 예약하고 싶어요.',
        starred: false,
      },
      {
        id: '12',
        type: '표현',
        english: '"It\'s not really my thing, to be honest."',
        korean: '솔직히 말하면 제 취향은 아니에요.',
        starred: false,
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

  const handleStarToggle = (itemId: string) => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === itemId ? { ...item, starred: !item.starred } : item
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
          <Ionicons name="chevron-back" size={20} color="#0B0B12" />
          <Text style={styles.backLabel}>복습하기</Text>
        </TouchableOpacity>
      </View>

      {/* 검색바 */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="복습문장 검색하기"
          placeholderTextColor="#616161"
          value={searchText}
          onChangeText={setSearchText}
          caretHidden={false}
          textAlign="center"
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

      {/* 날짜별 카드 목록 */}
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
                <Text style={styles.dayLabel}>
                  {group.day} · {group.character}
                </Text>

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
  // ── 헤더 ──────────────────────────────
  // paddingTop 56: 상태바 + 여백
  // paddingHorizontal 16: Figma 기준 16px (전체 콘텐츠 여백과 동일)
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
  },
  // ── 검색바 ────────────────────────────
  // marginBottom 60: Figma 절대좌표 기준 search bottom(155)→filter top(216) = 61px
  searchWrap: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 36,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 38,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0B0B12',
    textAlign: 'center',
    textAlignVertical: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  // ── 필터 칩 ───────────────────────────
  // marginBottom 14: Figma filter bottom(249)→dayLabel top(263) = 14px
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingHorizontal: 14,
    height: 33,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: 'rgba(246, 163, 166, 0.19)',
    borderWidth: 1.5,
    borderColor: '#F6A3A6',
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#616161',
    textAlign: 'center',
  },
  filterLabelActive: {
    color: '#0B0B12',
  },
  // ── 스크롤 영역 ───────────────────────
  scrollContainer: {
    flex: 1,
  },
  // gap 20: 그룹 간격 (Figma card bottom→divider = 19px)
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },
  // gap 10: 카드 간격 (Figma card1 bottom(402)→card2 top(412) = 10px)
  dateGroup: {
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  // marginLeft 7: Figma dayLabel left(23px) - paddingHorizontal(16px) = 7px
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
    marginLeft: 7,
  },
  // ── 카드 ──────────────────────────────
  // paddingLeft 20: Figma badge left(37) - card left(16) ≈ 21px
  // paddingRight 14: Figma star right edge(382) to card right(396) = 14px
  // shadow: 0px 2px 0px #E5E5E5
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 20,
    paddingTop: 11,
    paddingRight: 14,
    paddingBottom: 14,
    gap: 12,
    shadowColor: '#E0E0E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  // gap 8: badge→english→korean 간격 (Figma ~7~8px)
  cardBody: {
    flex: 1,
    gap: 8,
  },
  // ── 배지 ──────────────────────────────
  // Figma: bg #F6EEEE, border 1.5px #854448, borderRadius 12, h 23, px 10
  badge: {
    alignSelf: 'flex-start',
    height: 23,
    backgroundColor: '#F6EEEE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#0B0B12',
    fontFamily: 'Inter_600SemiBold',
  },
  // ── 카드 텍스트 ───────────────────────
  // letterSpacing -0.28: Figma tracking -2% of 14px
  cardEnglish: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0B0B12',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  cardKorean: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616161',
    lineHeight: 18,
  },
  // ── 별 버튼 ───────────────────────────
  // Figma star: size 20x20, top 11px from card top (alignItems: flex-start 으로 상단 정렬)
  starButton: {
    paddingTop: 1,
  },
  // ── 빈 결과 ───────────────────────────
  emptyWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#AAAAAA',
  },
  // ── 커스텀 스크롤바 ───────────────────
  // Figma: bg #AAAAAA, opacity 0.8, borderRadius 26, width ~4px
  scrollbarThumb: {
    position: 'absolute',
    right: 2,
    width: 4,
    height: 60,
    borderRadius: 26,
    backgroundColor: '#AAAAAA',
    opacity: 0.8,
  },
  // ── 최상단 버튼 ───────────────────────
  scrollTopButton: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(246, 163, 166, 0.19)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
