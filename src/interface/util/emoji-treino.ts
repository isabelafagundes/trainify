/**
 * Mapa de emojis sugeridos para diferentes tipos de treino.
 * Inspirado na estética Notion - simples, visual e intuitivo.
 *
 * Categoriação por grupos musculares e objetivos:
 */

export const emojisPorGrupoMuscular = {
  /** Superiores */
  peito: "💪",
  triceps: "💪",
  ombros: "🎯",
  costas: "🏋️",
  biceps: "💪",
  trapézio: "⛰️",

  /** Inferiores */
  pernas: "🦵",
  gluteos: "🍑",
  quadriceps: "🦵",
  posteriores: "🦵",
  panturrilhas: "👟",

  /** Core e Flexibilidade */
  abdômen: "🔥",
  core: "🔥",
  flexibilidade: "🧘",
  mobilidade: "🧘",
  yoga: "🧘",
  pilates: "🤸",

  /** Cardio */
  corrida: "🏃",
  esteira: "🏃",
  bike: "🚴",
  spinning: "🚴",
  natação: "🏊",
  elíptico: "🏃",
  remo: "🚣",
  pular_corda: "⏱️",
  hiit: "⚡",

  /** Objetivos */
  força: "🏋️",
  hipertrofia: "💪",
  resistência: "🔋",
  potência: "⚡",
  explosão: "💥",
  agilidade: "⚡",
  funcional: "🤸",

  /** Níveis e Desafios */
  iniciante: "🌱",
  intermediário: "🌟",
  avançado: "🏆",
  desafio: "🏆",
  meta: "🎯",
  conquistar: "⭐",

  /** Outros */
  aquecimento: "🔥",
  alongamento: "🧘",
  relaxamento: "😌",
  recuperação: "🛁",
  fullbody: "🏋️",
  upper: "💪",
  lower: "🦵",
} as const;

/**
 * Retorna um emoji sugerido com base no nome do treino
 */
export function sugerirEmojiParaTreino(
  nomeTreino: string,
  gruposMusculares?: string[]
): string {
  const treinoLower = nomeTreino.toLowerCase();

  // Mapeamento direto por palavras-chave
  if (treinoLower.includes("peito") || treinoLower.includes("empurrar")) return emojisPorGrupoMuscular.peito;
  if (treinoLower.includes("tríce") || treinoLower.includes("trice")) return emojisPorGrupoMuscular.triceps;
  if (treinoLower.includes("ombro")) return emojisPorGrupoMuscular.ombros;
  if (treinoLower.includes("costa") || treinoLower.includes("puxar")) return emojisPorGrupoMuscular.costas;
  if (treinoLower.includes("bíce") || treinoLower.includes("bice")) return emojisPorGrupoMuscular.biceps;

  if (treinoLower.includes("perna") || treinoLower.includes("leg")) return emojisPorGrupoMuscular.pernas;
  if (treinoLower.includes("glúteo") || treinoLower.includes("gluteo") || treinoLower.includes("bunda")) return emojisPorGrupoMuscular.gluteos;
  if (treinoLower.includes("quadríce") || treinoLower.includes("quadri")) return emojisPorGrupoMuscular.quadriceps;
  if (treinoLower.includes("posterior")) return emojisPorGrupoMuscular.posteriores;
  if (treinoLower.includes("panturrilha") || treinoLower.includes("perna")) return emojisPorGrupoMuscular.panturrilhas;

  if (treinoLower.includes("abdô") || treinoLower.includes("abdo") || treinoLower.includes("core") || treinoLower.includes("barriga")) return emojisPorGrupoMuscular.abdômen;
  if (treinoLower.includes("flexibil") || treinoLower.includes("along")) return emojisPorGrupoMuscular.flexibilidade;
  if (treinoLower.includes("mobilidade")) return emojisPorGrupoMuscular.mobilidade;
  if (treinoLower.includes("yoga")) return emojisPorGrupoMuscular.yoga;
  if (treinoLower.includes("pilates")) return emojisPorGrupoMuscular.pilates;

  if (treinoLower.includes("corrida") || treinoLower.includes("run")) return emojisPorGrupoMuscular.corrida;
  if (treinoLower.includes("esteira")) return emojisPorGrupoMuscular.esteira;
  if (treinoLower.includes("bike") || treinoLower.includes("spinning")) return emojisPorGrupoMuscular.bike;
  if (treinoLower.includes("nataç") || treinoLower.includes("natac")) return emojisPorGrupoMuscular.natação;
  if (treinoLower.includes("elíptico")) return emojisPorGrupoMuscular.elíptico;
  if (treinoLower.includes("remo")) return emojisPorGrupoMuscular.remo;
  if (treinoLower.includes("corda")) return emojisPorGrupoMuscular.pular_corda;
  if (treinoLower.includes("hiit") || treinoLower.includes("hit")) return emojisPorGrupoMuscular.hiit;

  if (treinoLower.includes("força")) return emojisPorGrupoMuscular.força;
  if (treinoLower.includes("hipertrofia") || treinoLower.includes("volume")) return emojisPorGrupoMuscular.hipertrofia;
  if (treinoLower.includes("resistência")) return emojisPorGrupoMuscular.resistência;
  if (treinoLower.includes("potência") || treinoLower.includes("pulo")) return emojisPorGrupoMuscular.potência;
  if (treinoLower.includes("explosão") || treinoLower.includes("explosiv")) return emojisPorGrupoMuscular.explosão;
  if (treinoLower.includes("agilidade")) return emojisPorGrupoMuscular.agilidade;
  if (treinoLower.includes("funcional")) return emojisPorGrupoMuscular.funcional;

  // Por grupos musculares fornecidos
  if (gruposMusculares) {
    const grupos = gruposMusculares.join(" ").toLowerCase();
    if (grupos.includes("peito")) return emojisPorGrupoMuscular.peito;
    if (grupos.includes("costas")) return emojisPorGrupoMuscular.costas;
    if (grupos.includes("perna")) return emojisPorGrupoMuscular.pernas;
    if (grupos.includes("glúteo") || grupos.includes("gluteo")) return emojisPorGrupoMuscular.gluteos;
    if (grupos.includes("ombro")) return emojisPorGrupoMuscular.ombros;
    if (grupos.includes("abdô") || grupos.includes("abdo")) return emojisPorGrupoMuscular.abdômen;
  }

  // Padrões comuns de nomenclatura (Treino A, B, C...)
  if (treinoLower.includes("treino a") || treinoLower === "treino a") return "💪";
  if (treinoLower.includes("treino b") || treinoLower === "treino b") return "🦵";
  if (treinoLower.includes("treino c") || treinoLower === "treino c") return "🏋️";
  if (treinoLower.includes("treino d") || treinoLower === "treino d") return "🎯";

  // Emoji padrão se não encontrar match
  return "🏋️";
}

/**
 * Lista de emojis populares para treino
 * Útil para UI de seleção de emoji ao criar ficha
 */
export const emojisPopulares = [
  "💪", "🦵", "🏋️", "🏃", "🚴", "🏊", "🤸", "🧘",
  "⚡", "🔥", "⭐", "🏆", "🎯", "⛰️", "🔋", "💥",
  "🌟", "🌱", "👟", "🚣", "⏱️", "😌", "🛁", "🤸"
];
