/* ═══════════════════════════════════════════
   Modelo de Tema — Trainify
   ═══════════════════════════════════════════ */

/** Cores do sistema */
export interface CoresTema {
  accent: string;
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  base: string;
  neutral: string;
}

/** Border radius disponíveis */
export type BorderRadius = "P" | "M" | "G" | "XG";

/** Tamanhos de fonte disponíveis */
export type FontSize = "P" | "M" | "G" | "XG";

/** Família de fontes */
export interface FontFamily {
  principal: string;
  secundaria: string;
}

/** Tema completo da aplicação */
export interface Tema {
  id: string;
  nome: string;
  cores: CoresTema;
  bordas: Record<BorderRadius, string>;
  fontes: Record<FontSize, string>;
  familias: FontFamily;
  espacamento: string;
}
