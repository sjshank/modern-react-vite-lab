import { useState } from 'react';

// Custom hook to manage the dashboard theme (light or dark)
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
