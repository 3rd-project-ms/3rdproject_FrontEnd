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
  toggleStarred: () => void;
}

export function useReviewFilter(): UseReviewFilterResult {
  const [groups, setGroups] = useState<DateGroup[]>(getMockReviewGroups());
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilterState] = useState<FilterType>('전체');
  const [pendingUnstar, setPendingUnstar] = useState<Set<string>>(new Set());

  const commitPendingUnstar = (pending: Set<string>) => {
    if (pending.size === 0) return;
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          pending.has(item.id) ? { ...item, starred: false } : item
        ),
      }))
    );
  };

  const setActiveFilter = (filter: FilterType) => {
    if (activeFilter === '저장' && filter !== '저장') {
      commitPendingUnstar(pendingUnstar);
      setPendingUnstar(new Set());
    }
    setActiveFilterState(filter);
  };

  const handleStarToggle = (itemId: string) => {
    if (activeFilter === '저장') {
      setPendingUnstar((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
      return;
    }
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === itemId ? { ...item, starred: !item.starred } : item
        ),
      }))
    );
  };

  const clearAllStarred = () => {
    if (activeFilter === '저장') {
      const starredIds = groups.flatMap((g) =>
        g.items.filter((i) => i.starred).map((i) => i.id)
      );
      setPendingUnstar(new Set(starredIds));
    } else {
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          items: group.items.map((item) => ({ ...item, starred: false })),
        }))
      );
    }
  };

  const restoreStarred = () => {
    setPendingUnstar(new Set());
  };

  const toggleStarred = () => {
    if (pendingUnstar.size > 0) {
      restoreStarred();
    } else {
      clearAllStarred();
    }
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            const matchesFilter =
              activeFilter === '전체' ||
              (activeFilter === '저장' ? item.starred : item.type === activeFilter);
            const matchesSearch =
              searchText === '' ||
              item.english.toLowerCase().includes(searchText.toLowerCase()) ||
              item.korean.includes(searchText);
            return matchesFilter && matchesSearch;
          })
          .map((item) => ({
            ...item,
            starred: item.starred && !pendingUnstar.has(item.id),
          })),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, activeFilter, searchText, pendingUnstar]);

  return {
    groups,
    filteredGroups,
    searchText,
    setSearchText,
    activeFilter,
    setActiveFilter,
    handleStarToggle,
    toggleStarred,
  };
}
