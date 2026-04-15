// Tema único — interfaz neumórfica fija, sin toggle claro/oscuro
export type Theme = 'light';

export function useTheme() {
  return {
    theme: 'light' as Theme,
    toggleTheme: () => {},
  };
}
