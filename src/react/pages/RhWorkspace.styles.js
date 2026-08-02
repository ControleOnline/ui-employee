import {Platform, StyleSheet} from 'react-native';

export const createStyles = palette =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background || '#F8FAFC',
    },
    screen: {
      flex: 1,
      padding: 16,
    },
    heroCard: {
      backgroundColor: palette.primary || '#2563EB',
      borderRadius: 24,
      marginBottom: 14,
      padding: 18,
      ...(Platform.OS === 'web' && palette.shadow
        ? {boxShadow: `0 16px 32px ${palette.shadow}`}
        : {}),
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    heroTitle: {
      color: palette.buttonText || '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 28,
    },
    heroDescription: {
      color: palette.buttonText || '#E2E8F0',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 8,
      maxWidth: 540,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF22',
      borderColor: '#FFFFFF33',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    heroBadgeText: {
      color: palette.buttonText || '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    sectionCard: {
      backgroundColor: palette.cardBackground || '#FFFFFF',
      borderColor: palette.border || '#E2E8F0',
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
      ...(Platform.OS === 'web' && palette.shadow
        ? {boxShadow: `0 12px 24px ${palette.shadow}`}
        : {}),
    },
    sectionTitle: {
      color: palette.text || '#0F172A',
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
    },
    sectionText: {
      color: palette.textSecondary || '#64748B',
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    sectionChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    sectionChip: {
      alignItems: 'center',
      backgroundColor: palette.buttonBackground || '#EFF6FF',
      borderColor: palette.buttonBorder || '#BFDBFE',
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    sectionChipText: {
      color: palette.buttonText || '#1D4ED8',
      fontSize: 12,
      fontWeight: '700',
    },
    homeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    homeCard: {
      backgroundColor: palette.cardBackground || '#FFFFFF',
      borderColor: palette.border || '#E2E8F0',
      borderRadius: 20,
      borderWidth: 1,
      flexGrow: 1,
      flexBasis: '46%',
      minWidth: 175,
      margin: 6,
      padding: 16,
      ...(Platform.OS === 'web' && palette.shadow
        ? {boxShadow: `0 12px 24px ${palette.shadow}`}
        : {}),
    },
    homeCardTop: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    homeCardIcon: {
      alignItems: 'center',
      borderRadius: 16,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    homeCardTitle: {
      color: palette.text || '#0F172A',
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
      marginTop: 14,
    },
    homeCardText: {
      color: palette.textSecondary || '#64748B',
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    homeCardHint: {
      color: palette.primary || '#2563EB',
      fontSize: 12,
      fontWeight: '700',
      marginTop: 12,
    },
    tableShell: {
      flex: 1,
      minHeight: 0,
    },
    controlsCard: {
      backgroundColor: palette.cardBackground || '#FFFFFF',
      borderColor: palette.border || '#E2E8F0',
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
      ...(Platform.OS === 'web' && palette.shadow
        ? {boxShadow: `0 12px 24px ${palette.shadow}`}
        : {}),
    },
    controlsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    controlsText: {
      color: palette.textSecondary || '#64748B',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
    emptyStateCard: {
      alignItems: 'center',
      backgroundColor: palette.cardBackground || '#FFFFFF',
      borderColor: palette.border || '#E2E8F0',
      borderRadius: 20,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
      minHeight: 260,
      padding: 24,
      ...(Platform.OS === 'web' && palette.shadow
        ? {boxShadow: `0 12px 24px ${palette.shadow}`}
        : {}),
    },
    emptyStateTitle: {
      color: palette.text || '#0F172A',
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
    },
    emptyStateText: {
      color: palette.textSecondary || '#64748B',
      fontSize: 13,
      lineHeight: 18,
      marginTop: 8,
      textAlign: 'center',
    },
  });
