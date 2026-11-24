import { createContext } from 'react';

type Theme = 'light' | 'dark'; // Define a type for theme, which can be either "light" or "dark"
const defaultTheme: Theme = 'light'; // Set the default theme to "light"

const ThemeContext = createContext<Theme>(defaultTheme); // Create a context with the default theme

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider };
export default ThemeContext; // Export the ThemeContext for use in other components
