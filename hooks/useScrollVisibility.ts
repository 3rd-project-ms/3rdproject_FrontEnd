import { useRef, useState } from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';

interface ScrollHandlers {
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (_w: number, h: number) => void;
  onLayout: (e: LayoutChangeEvent) => void;
  scrollEventThrottle: number;
}

interface UseScrollVisibilityOptions {
  scrollTopThreshold?: number;
}

interface UseScrollVisibilityResult {
  scrollRef: React.RefObject<ScrollView>;
  scrollY: number;
  contentHeight: number;
  containerHeight: number;
  showScrollDown: boolean;
  showScrollTop: boolean;
  handleScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleContentSizeChange: (_w: number, h: number) => void;
  handleLayout: (e: LayoutChangeEvent) => void;
  scrollHandlers: ScrollHandlers;
  scrollToEnd: () => void;
  scrollToTop: () => void;
}

export function useScrollVisibility(
  options: UseScrollVisibilityOptions = {}
): UseScrollVisibilityResult {
  const { scrollTopThreshold = 200 } = options;

  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const scrollable = contentHeight > containerHeight;
  const notReachedBottom = scrollY < contentHeight - containerHeight - 20;
  const showScrollDown = scrollable && notReachedBottom && contentHeight > 0;
  const showScrollTop = scrollY > scrollTopThreshold;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  const handleContentSizeChange = (_w: number, h: number) => {
    setContentHeight(h);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const scrollHandlers: ScrollHandlers = {
    onScroll: handleScroll,
    onContentSizeChange: handleContentSizeChange,
    onLayout: handleLayout,
    scrollEventThrottle: 16,
  };

  const scrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return {
    scrollRef,
    scrollY,
    contentHeight,
    containerHeight,
    showScrollDown,
    showScrollTop,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
    scrollHandlers,
    scrollToEnd,
    scrollToTop,
  };
}
