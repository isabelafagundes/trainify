/* ═══════════════════════════════════════════
   Modelo de Dados — Trainify
   Baseado na especificação funcional
   ═══════════════════════════════════════════ */

/** Exercício catalogado (biblioteca padrão + customizados) */
export interface Exercicio {
  id: string;
  nome: string;
  grupoMuscular: string;
}

/** Configuração de exercício dentro de uma ficha */
export interface ExercicioFicha {
  exercicioId: string;
  series: number;
  repeticoes: number;
  usaCarga: boolean;
  descansoSegundos: number;
}

/** Entrada de cardio configurada na ficha */
export interface EntradaCardio {
  id: string;
  tipo: TipoCardio;
  duracaoMinutos: number;
  nota: string;
}

/** Tipos de cardio pré-definidos */
export type TipoCardio =
  | "Esteira"
  | "Bike"
  | "Elíptico"
  | "Remo"
  | "Escada"
  | "Pular Corda";

/** Ficha de treino */
export interface Ficha {
  id: string;
  nome: string;
  descricao: string;
  icone: NomeIcone;
  emoji?: string; /** Emoji opcional para substituir o ícone SVG */
  exercicios: ExercicioFicha[];
  cardio: EntradaCardio[];
  programaId?: string; /** ID do programa pai (para consistência e rastreamento) */
}

/** Programa de treino */
export interface Programa {
  id: string;
  nome: string;
  descricao: string;
  corBanner: CorBanner | null;
  fichaIds: string[];
  ativo: boolean;
}

/** Cores disponíveis para banner */
export type CorBanner =
  | "azul"
  | "verde"
  | "roxo"
  | "laranja"
  | "rosa"
  | "vermelho"
  | "amarelo"
  | "ciano"
  | "indigo";

/** Registro de série durante execução */
export interface RegistroSerie {
  serie: number;
  repeticoes: number;
  carga: number;
}

/** Registro de exercício no log */
export interface RegistroExercicio {
  exercicioId: string;
  series: RegistroSerie[];
  nota: string;
}

/** Registro de cardio no log */
export interface RegistroCardio {
  cardioId: string;
  tipo: TipoCardio;
  duracaoMinutos: number;
  nota: string;
}

/** Log completo de uma sessão de treino */
export interface RegistroTreino {
  id: string;
  fichaId: string;
  data: string;
  iniciadoEm: string;
  finalizadoEm: string;
  exercicios: RegistroExercicio[];
  cardio: RegistroCardio[];
}

/** Nomes de ícones disponíveis no sistema */
export type NomeIcone =
  | "halter"
  | "braco"
  | "raio"
  | "fogo"
  | "coracao"
  | "estrela"
  | "trofeu"
  | "alvo"
  | "montanha"
  | "corrida"
  | "emoji"; /** Novo tipo para emojis customizados */

/** Registro de atividade para um dia específico */
export interface RegistroAtividadeDiaria {
  data: string; /** ISO date (YYYY-MM-DD) */
  completou: boolean;
  fichasCompletas?: string[]; /** IDs das fichas completadas */
}

/** Dados de frequência de treino */
export interface DadosFrequencia {
  registros: RegistroAtividadeDiaria[];
  dataInicio: string;
  dataFim: string;
}
