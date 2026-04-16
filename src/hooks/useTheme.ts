// Single theme — fixed neumorphic interface, no light/dark toggle.
export type Theme = 'light';

export function useTheme() {
  return {
    theme: 'light' as Theme,
    toggleTheme: () => {},
  };
}
