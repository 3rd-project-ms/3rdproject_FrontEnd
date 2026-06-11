import { useState, useMemo, useEffect } from 'react';
import { ReviewItem, DateGroup, mapCorrectionsToDateGroups } from '@/utils/mappers';

import { BASE_URL } from '@/services/chatService';
import { useAuthStore } from '@/store/useAuthStore';

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
  const userId = useAuthStore((state) => state.userId);
  const [groups, setGroups] = useState<DateGroup[]>([]);

  useEffect(() => {
    if (userId === null) return;
    Promise.all([
      fetch(`${BASE_URL}/api/corrections?userId=${userId}`).then((r) => r.json()),
      fetch(`${BASE_URL}/api/corrections/bookmarks?userId=${userId}`).then((r) => r.json()),
    ]).then(([correctionsJson, bookmarksJson]) => {
      // bookmarksJson.data: Map<string, { correction_id: number }[]> 구조
      // correction_id를 Set<string>으로 추출해 starred 초기값에 사용
      const bookmarkedIds = new Set<string>(
        Object.values(
          (bookmarksJson.data ?? {}) as { [key: string]: { correction_id: number }[] }
        )
          .flat()
          .map((c) => String(c.correction_id))
      );
      setGroups(mapCorrectionsToDateGroups(correctionsJson.data, bookmarkedIds));
    });
  }, [userId]);
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

  const handleStarToggle = async (itemId: string) => {
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
    const item = groups.flatMap((g) => g.items).find((i) => i.id === itemId);
    if (!item) return;
    // PATCH 가드: translation은 GET 응답에 없는 유저 입력 필드.
    // 백엔드가 translation 없이 is_reviewed만 허용하거나 UI 입력이 추가될 때 제거.
    if (!item.translation) return;
    await fetch(`${BASE_URL}/api/corrections/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_reviewed: !item.starred }),
    });
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((i) =>
          i.id === itemId ? { ...i, starred: !i.starred } : i
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
              item.corrected_sentence.toLowerCase().includes(searchText.toLowerCase()) ||
              (item.translation?.includes(searchText) ?? false);
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
