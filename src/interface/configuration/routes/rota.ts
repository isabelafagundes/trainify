/* ═══════════════════════════════════════════
   Definição de Rotas — Trainify
   ═══════════════════════════════════════════ */

/** Rotas da aplicação */
export const ROTAS = {
  // Área não autenticada
  LOGIN: "/login",
  CADASTRO: "/cadastro",

  // Área logada
  HOME: "/home",
  HISTORICO: "/historico",
  ESTATISTICAS: "/estatisticas",
  GERENCIAR: "/gerenciar",

  // Gestão de fichas
  FICHA: "/ficha",
  CRIAR_FICHA: "/criar-ficha",
  EDITAR_FICHA: "/editar-ficha",

  // Gestão de programas
  PROGRAMA: "/programa",
  CRIAR_PROGRAMA: "/criar-programa",
  EDITAR_PROGRAMA: "/editar-programa",

  // Execução de treino
  EXECUTAR_TREINO: "/executar-treino",
} as const;

export type Rota = (typeof ROTAS)[keyof typeof ROTAS];

/** Mapeamento de rota → título */
export const TITULOS_POR_ROTA: Record<Rota, string> = {
  [ROTAS.LOGIN]: "Entrar",
  [ROTAS.CADASTRO]: "Criar Conta",
  [ROTAS.HOME]: "Meus Treinos",
  [ROTAS.HISTORICO]: "Histórico de Treinos",
  [ROTAS.ESTATISTICAS]: "Estatísticas",
  [ROTAS.GERENCIAR]: "Gerenciar",
  [ROTAS.FICHA]: "Ficha de Treino",
  [ROTAS.CRIAR_FICHA]: "Nova Ficha",
  [ROTAS.EDITAR_FICHA]: "Editar Ficha",
  [ROTAS.PROGRAMA]: "Programa de Treino",
  [ROTAS.CRIAR_PROGRAMA]: "Novo Programa",
  [ROTAS.EDITAR_PROGRAMA]: "Editar Programa",
  [ROTAS.EXECUTAR_TREINO]: "Executar Treino",
};
