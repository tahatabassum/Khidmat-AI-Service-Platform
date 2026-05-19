import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightColors = {
    primary: '#00450d', onPrimary: '#ffffff', primaryContainer: '#1b5e20', onPrimaryContainer: '#90d689',
    secondary: '#006e1c', onSecondary: '#ffffff', secondaryContainer: '#91f78e', onSecondaryContainer: '#00731e',
    tertiary: '#533400', onTertiary: '#ffffff', tertiaryContainer: '#724900', onTertiaryContainer: '#ffb751',
    tertiaryFixedDim: '#ffb957', error: '#ba1a1a', onError: '#ffffff', errorContainer: '#ffdad6', onErrorContainer: '#93000a',
    surface: '#f8f9fa', surfaceDim: '#d9dadb', surfaceContainerLowest: '#ffffff', surfaceContainerLow: '#f3f4f5',
    surfaceContainer: '#edeeef', surfaceContainerHigh: '#e7e8e9', surfaceContainerHighest: '#e1e3e4',
    onSurface: '#191c1d', onSurfaceVariant: '#41493e', outline: '#717a6d', outlineVariant: '#c0c9bb',
    inverseSurface: '#2e3132', inverseOnSurface: '#f0f1f2', inversePrimary: '#91d78a', surfaceTint: '#2a6b2c',
    primaryFixed: '#acf4a4', primaryFixedDim: '#91d78a', secondaryFixed: '#94f990', secondaryFixedDim: '#78dc77',
    background: '#f8f9fa', white: '#ffffff', aiInsight: '#E8F5E9', text: '#191c1d', isDark: false
};

export const darkColors = {
    primary: '#90d689', onPrimary: '#00390a', primaryContainer: '#005313', onPrimaryContainer: '#acf4a4',
    secondary: '#78dc77', onSecondary: '#00390a', secondaryContainer: '#005313', onSecondaryContainer: '#94f990',
    tertiary: '#ffb957', onTertiary: '#452b00', tertiaryContainer: '#623f00', onTertiaryContainer: '#ffdcbb',
    tertiaryFixedDim: '#e5a343', error: '#ffb4ab', onError: '#690005', errorContainer: '#93000a', onErrorContainer: '#ffdad6',
    surface: '#111414', surfaceDim: '#111414', surfaceContainerLowest: '#0c0f0f', surfaceContainerLow: '#191c1d',
    surfaceContainer: '#1d2021', surfaceContainerHigh: '#282a2b', surfaceContainerHighest: '#333536',
    onSurface: '#e1e3e4', onSurfaceVariant: '#c0c9bb', outline: '#8a9386', outlineVariant: '#41493e',
    inverseSurface: '#e1e3e4', inverseOnSurface: '#2e3132', inversePrimary: '#00450d', surfaceTint: '#90d689',
    primaryFixed: '#acf4a4', primaryFixedDim: '#91d78a', secondaryFixed: '#94f990', secondaryFixedDim: '#78dc77',
    background: '#111414', white: '#ffffff', aiInsight: '#00390a', text: '#e1e3e4', isDark: true
};

export let colors = lightColors;

export const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@khidmat_theme').then(val => {
      if (val === 'dark') {
        setIsDark(true);
        colors = darkColors;
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    colors = newIsDark ? darkColors : lightColors;
    await AsyncStorage.setItem('@khidmat_theme', newIsDark ? 'dark' : 'light');
  };

  const currentColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors: currentColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
