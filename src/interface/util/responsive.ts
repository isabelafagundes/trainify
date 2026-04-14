/* ═══════════════════════════════════════════
   Utilitários Responsivos — Trainify
   ═══════════════════════════════════════════ */

/** Breakpoints do sistema (mobile-first) */
export const BREAKPOINTS = {
  mobile: "0px",
  tablet: "768px",
  desktop: "1024px",
} as const;

/** Tipo de breakpoint */
export type Breakpoint = keyof typeof BREAKPOINTS;

/** Obter valor do breakpoint em pixels */
export const obterBreakpoint = (breakpoint: Breakpoint): string => {
  return BREAKPOINTS[breakpoint];
};

/** Calcular padding responsivo baseado na largura da tela */
export const calcularPadding = (): string => {
  const width = window.innerWidth;
  if (width < 768) return "16px";
  if (width < 1024) return "24px";
  return "32px";
};

/** Calcular largura máxima do conteúdo */
export const calcularLarguraMaxima = (): string => {
  const width = window.innerWidth;
  if (width < 768) return "100%";
  if (width < 1024) return "720px";
  return "1200px";
};

/** Verificar se é mobile */
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

/** Verificar se é tablet */
export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/** Verificar se é desktop */
export const isDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

/** Hook para ouvir mudanças de tamanho de tela */
export const onResize = (callback: () => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const listener = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, 150);
  };

  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
};
