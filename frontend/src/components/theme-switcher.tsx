'use client';

import { useState, useEffect, useRef } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';

const themes = [
  { name: 'Grape', value: 'grape', color: 'bg-purple-500' },
  { name: 'Raspberry', value: 'raspberry', color: 'bg-pink-500' },
  { name: 'Kiwi', value: 'kiwi', color: 'bg-green-500' },
  { name: 'Blueberry', value: 'blueberry', color: 'bg-blue-500' },
  { name: 'Tangerine', value: 'tangerine', color: 'bg-orange-500' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
          <div className="p-2 space-y-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  theme === themeOption.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${themeOption.color}`} />
                {themeOption.name}
                {theme === themeOption.value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 