import { ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/tokens';

export const SharedStyles = {
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,

  screenHeader: {
    paddingTop: Spacing.headerTop,
    paddingHorizontal: Spacing.headerInner,
    paddingBottom: 12,
  } as ViewStyle,

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,

  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.card,
    shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1 as number,
    shadowRadius: 0,
    elevation: 2,
  } as ViewStyle,

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.headerInner,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: Colors.background,
  } as ViewStyle,

  scrollDownWrap: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  } as ViewStyle,

  scrollDownButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.pill,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  backLabel: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.semiBold,
    color: Colors.textPrimary,
  } as TextStyle,

  navLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.semiBold,
    color: Colors.textMuted,
  } as TextStyle,
};
