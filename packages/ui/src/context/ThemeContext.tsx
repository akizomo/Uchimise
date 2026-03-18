import React, { createContext, useContext } from 'react';

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the context value if a ThemeProvider is present in the tree.
 * Used by useTheme to support Storybook overrides.
 */
export function useThemeContext(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
