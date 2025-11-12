import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorTheme = 'emerald' | 'lavender' | 'orange' | 'blue' | 'pink' | 'sky' | 'rose' | 'teal' | 'indigo' | 'lime';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, _setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('theme') as Theme) || 'system';
    });
    
    const [colorTheme, _setColorTheme] = useState<ColorTheme>(() => {
        if (typeof window === 'undefined') return 'emerald';
        return (localStorage.getItem('color-theme') as ColorTheme) || 'emerald';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-color-theme', colorTheme);
        localStorage.setItem('color-theme', colorTheme);
    }, [colorTheme]);

    useEffect(() => {
        const root = window.document.documentElement;

        const handleThemeChange = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        localStorage.setItem('theme', theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            handleThemeChange(mediaQuery.matches);
            const listener = (e: MediaQueryListEvent) => handleThemeChange(e.matches);
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        } else {
            handleThemeChange(theme === 'dark');
        }
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        _setTheme(newTheme);
    }, []);

    const setColorTheme = useCallback((newColorTheme: ColorTheme) => {
        _setColorTheme(newColorTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorTheme, setColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};