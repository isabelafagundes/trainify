/* ═══════════════════════════════════════════
   Modelo de Tema — Pezzo
   ═══════════════════════════════════════════ */

export type TemaId = "claro" | "escuro" | (string & {});

export type VariavelCssTema = `--${string}`;

export interface Tema {
  id: TemaId;
  nome: string;
  /** Marca temas de fundo escuro — controla color-scheme e estilo da status bar. */
  escuro?: boolean;
  variaveis: Record<VariavelCssTema, string>;
}
