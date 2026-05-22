import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
  date: string;
  character: string;
  items: ReviewItem[];
}

const FILTERS: FilterType[] = ['전체', '문법', '발음', '표현'];

const INITIAL_GROUPS: DateGroup[] = [
  {
    date: '2026년 5월 21일',
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
    ],
  },
  {
    date: '2026년 5월 20일',
    character: 'ALEX',
    items: [
      {
        id: '3',
        type: '발음',
        english: '"In New York, we don\'t really say hello."',
        korean: '뉴욕에서 우리는 \'hello\'라고 잘 안 해요.',
      },
      {
        id: '4',
        type: '문법',
        english: '"That\'s how you order like a local without stressing out."',
        korean: '이렇게 하면 스트레스 없이 현지인처럼 주문할 수 있어요.',
      },
      {
        id: '5',
        type: '표현',
        english: '"In New York, we don\'t really say hello."',
        korean: '뉴욕에서 우리는 \'hello\'라고 잘 안 해요.',
      },
    ],
  },
];

export default function ReviewScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [groups, setGroups] = useState<DateGroup[]>(INITIAL_GROUPS);

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

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterLabel}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 날짜별 카드 목록 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        ) : (
          filteredGroups.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              {/* 날짜 헤더 */}
              <Text style={styles.dateLabel}>
                {group.date} · {group.character}
              </Text>

              {/* 카드 목록 */}
              {group.items.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardBody}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
    lineHeight: 30,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  filterTabActive: {
    backgroundColor: '#F0F0F0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  dateGroup: {
    gap: 10,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
    padding: 16,
    gap: 12,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardEnglish: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  cardKorean: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
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
});
