'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'grape' | 'raspberry' | 'kiwi' | 'blueberry' | 'tangerine';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setCurrentTheme] = useState<Theme>('grape');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['grape', 'raspberry', 'kiwi', 'blueberry', 'tangerine'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const applyTheme = (theme: Theme) => {
    const themeColors = {
      grape: { primary: '248 53% 58%', primaryForeground: '0 0% 98%' },
      raspberry: { primary: '327 100% 45%', primaryForeground: '0 0% 98%' },
      kiwi: { primary: '142 76% 36%', primaryForeground: '0 0% 98%' },
      blueberry: { primary: '199 89% 48%', primaryForeground: '0 0% 98%' },
      tangerine: { primary: '24 95% 53%', primaryForeground: '0 0% 98%' },
    };
    const colors = themeColors[theme];
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 