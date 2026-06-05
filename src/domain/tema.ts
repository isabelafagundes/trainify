/* ═══════════════════════════════════════════
   Modelo de Tema — Trainify
   ═══════════════════════════════════════════ */

export type TemaId = "claro" | "escuro" | (string & {});

export type VariavelCssTema = `--${string}`;

export interface Tema {
  id: TemaId;
  nome: string;
  variaveis: Record<VariavelCssTema, string>;
}
