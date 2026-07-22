export type Cor = [number, number, number, number];
export type IdPresetFundo = "oceanic" | "ember" | "forest" | "aurora" | "sunset" | "graphite";
export interface PresetFundo { id: IdPresetFundo; nome: string; cores: [Cor, Cor, Cor, Cor]; intensidade: number; contraste: number; grao: number; velocidade: number; corTexto: "claro" | "escuro"; }
export const PRESETS_FUNDO: PresetFundo[] = [
  { id: "oceanic", nome: "Oceano", cores: [[4,25,46,1],[8,75,110,1],[15,139,141,1],[89,213,204,1]], intensidade: 1, contraste: 1, grao: .08, velocidade: .7, corTexto: "claro" },
  { id: "ember", nome: "Brasa", cores: [[45,12,15,1],[124,34,25,1],[224,89,38,1],[255,183,77,1]], intensidade: 1, contraste: 1, grao: .09, velocidade: .8, corTexto: "claro" },
  { id: "forest", nome: "Floresta", cores: [[7,35,28,1],[18,83,60,1],[45,138,91,1],[140,202,139,1]], intensidade: 1, contraste: 1, grao: .08, velocidade: .55, corTexto: "claro" },
  { id: "aurora", nome: "Aurora", cores: [[22,18,63,1],[67,52,151,1],[32,181,166,1],[170,244,197,1]], intensidade: 1, contraste: 1, grao: .07, velocidade: .9, corTexto: "claro" },
  { id: "sunset", nome: "Pôr do sol", cores: [[63,27,81,1],[171,58,94,1],[245,126,73,1],[255,211,128,1]], intensidade: 1, contraste: 1, grao: .07, velocidade: .65, corTexto: "claro" },
  { id: "graphite", nome: "Grafite", cores: [[13,16,22,1],[38,43,52,1],[76,84,95,1],[157,165,177,1]], intensidade: 1, contraste: 1, grao: .1, velocidade: .45, corTexto: "claro" },
];
export function obterPreset(id: IdPresetFundo) { return PRESETS_FUNDO.find((item) => item.id === id) ?? PRESETS_FUNDO[0]; }

/** Fundo do card de resultado: um gradiente-preset ou uma foto da galeria.
    `escurecer` (0–100) controla a intensidade do véu escuro sobre a foto,
    preservando a legibilidade do texto branco. */
export type SelecaoFundo =
  | { tipo: "preset"; preset: IdPresetFundo }
  | { tipo: "foto"; dataUrl: string; escurecer: number };

/** Alfas do véu escuro (topo → base) sobre a foto, em função do `escurecer`.
    Fonte única usada tanto no preview (CSS) quanto no export (canvas). */
export function velaFoto(escurecer: number): { topo: number; meio: number; base: number } {
  const k = Math.min(100, Math.max(0, escurecer)) / 100;
  return { topo: 0.10 + 0.25 * k, meio: 0.18 + 0.32 * k, base: 0.42 + 0.45 * k };
}
