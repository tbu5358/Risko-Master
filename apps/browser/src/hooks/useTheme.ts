
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('pvp-arcade-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = true; // default to dark
    if (savedTheme) {
      initialTheme = savedTheme === 'dark';
    } else if (!prefersDark) {
      initialTheme = false;
    }
    
    setIsDark(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Save to localStorage
    localStorage.setItem('pvp-arcade-theme', newTheme ? 'dark' : 'light');
    
    // Apply to document
    applyTheme(newTheme);
  };

  return { isDark, toggleTheme };
};
