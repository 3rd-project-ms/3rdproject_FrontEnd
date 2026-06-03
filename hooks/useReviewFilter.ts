import { useState, useMemo } from 'react';
import { ReviewItem, DateGroup } from '@/utils/mappers';
import { getMockReviewGroups } from '@/utils/mockSelectors';

export type { ReviewItem, DateGroup };
export type FilterType = '전체' | '문법' | '발음' | '표현' | '저장';

interface UseReviewFilterResult {
  groups: DateGroup[];
  filteredGroups: DateGroup[];
  searchText: string;
  setSearchText: (text: string) => void;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  handleStarToggle: (itemId: string) => void;
}

export function useReviewFilter(): UseReviewFilterResult {
  const [groups, setGroups] = useState<DateGroup[]>(getMockReviewGroups());
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

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

  return {
    groups,
    filteredGroups,
    searchText,
    setSearchText,
    activeFilter,
    setActiveFilter,
    handleStarToggle,
  };
}
