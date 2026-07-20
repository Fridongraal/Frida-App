import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  'light',
  'dark',
  'atardecer-playa',
  'lavanda-nocturno',
  'menta-glacial',
  'sunset-cyberpunk',
  'bosque-matcha',
  'codigo-dracula',
  'hacker-puro',
  'oficina-nordica',
  'cyber-purple',
  'profundo-oceano'
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Intentar leer de localStorage o usar preferencia del sistema (por defecto light)
    const storedTheme = localStorage.getItem('frida-theme');
    if (storedTheme && THEMES.includes(storedTheme)) {
      return storedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Check if selected theme is dark-oriented to maintain compatibility with dark: classes
    const darkOriented = [
      'dark', 
      'sunset-cyberpunk', 
      'bosque-matcha',
      'codigo-dracula',
      'hacker-puro',
      'cyber-purple',
      'profundo-oceano'
    ].includes(theme);
    if (darkOriented) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('frida-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const idx = THEMES.indexOf(prevTheme);
      const nextIdx = (idx + 1) % THEMES.length;
      return THEMES[nextIdx];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
}
