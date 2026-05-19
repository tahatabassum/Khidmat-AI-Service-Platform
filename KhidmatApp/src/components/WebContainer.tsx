import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  children: React.ReactNode;
  maxWidth?: number;
  noPadding?: boolean;
}

/**
 * WebContainer wraps content in a centered container on web/desktop.
 * On mobile, it renders children directly.
 * On desktop (>768px), it adds a centered max-width card with a subtle background.
 */
export default function WebContainer({ children, maxWidth = 480, noPadding }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={styles.desktopRoot}>
      <View style={[styles.desktopContainer, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;
  const isTablet = width >= 600 && width <= 768;
  const isMobile = width < 600;

  return { width, height, isWeb, isDesktop, isTablet, isMobile };
}

const styles = StyleSheet.create({
  desktopRoot: {
    flex: 1,
    backgroundColor: '#e8ece8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
});
