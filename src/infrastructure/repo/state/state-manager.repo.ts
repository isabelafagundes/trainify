/* ═══════════════════════════════════════════
   Repositório do State Manager — Trainify
   Abstração para acesso ao gerenciador de estado global
   ═══════════════════════════════════════════ */

import type {
  Programa,
  Ficha,
  RegistroTreino,
  Exercicio,
} from "@/domain/tipos";
import { trainifyState } from "@/application/state/trainify.state";

/** Interface do repositório de state manager */
export interface StateManagerRepository {
  // Programas
  listarProgramas(): Programa[];
  obterProgramaPorId(id: string): Programa | null;
  obterProgramaAtivo(): Programa | null;
  adicionarPrograma(
    programa: Omit<Programa, "id">
  ): Programa;
  atualizarPrograma(
    id: string,
    atualizacoes: Partial<Omit<Programa, "id">>
  ): Programa | null;
  removerPrograma(id: string): boolean;
  copiarPrograma(id: string): Programa | null;

  // Fichas
  listarFichas(): Ficha[];
  obterFichaPorId(id: string): Ficha | null;
  obterFichasDoPrograma(programaId: string): Ficha[];
  obterProgramasDaFicha(fichaId: string): Programa[];
  obterFichasOrfas(): Ficha[];
  adicionarFicha(
    ficha: Omit<Ficha, "id">,
    programaId?: string
  ): Ficha;
  atualizarFicha(
    id: string,
    atualizacoes: Partial<Omit<Ficha, "id">>
  ): Ficha | null;
  removerFicha(id: string): boolean;
  copiarFicha(id: string): Ficha | null;
  vincularFichaAoPrograma(fichaId: string, programaId: string): boolean;
  desvincularFichaDoPrograma(fichaId: string, programaId: string): boolean;

  // Exercícios
  listarTodosExercicios(): Exercicio[];
  listarExerciciosCustom(): Exercicio[];
  obterExercicioPorId(id: string): Exercicio | null;
  adicionarExercicioCustom(
    exercicio: Omit<Exercicio, "id">
  ): Exercicio;
  removerExercicioCustom(id: string): boolean;
  obterGruposMusculares(): string[];

  // Histórico
  listarTreinos(): RegistroTreino[];
  obterHistoricoDaFicha(fichaId: string): RegistroTreino[];
  adicionarTreino(registro: Omit<RegistroTreino, "id">): RegistroTreino;

  // Utilitários
  gerarNomeFicha(): string;
  inscrever(callback: () => void): () => void;
}

/** Implementação do repositório usando o state manager */
export const stateManagerRepository: StateManagerRepository = {
  // Programas
  listarProgramas: () => trainifyState.getProgramas(),
  obterProgramaPorId: (id) => trainifyState.getProgramaPorId(id),
  obterProgramaAtivo: () => trainifyState.getProgramaAtivo(),
  adicionarPrograma: (programa) => trainifyState.adicionarPrograma(programa),
  atualizarPrograma: (id, atualizacoes) =>
    trainifyState.atualizarPrograma(id, atualizacoes),
  removerPrograma: (id) => trainifyState.removerPrograma(id),
  copiarPrograma: (id) => trainifyState.copiarPrograma(id),

  // Fichas
  listarFichas: () => trainifyState.getFichas(),
  obterFichaPorId: (id) => trainifyState.getFichaPorId(id),
  obterFichasDoPrograma: (programaId) =>
    trainifyState.getFichasDoPrograma(programaId),
  obterProgramasDaFicha: (fichaId) =>
    trainifyState.getProgramasDaFicha(fichaId),
  obterFichasOrfas: () => trainifyState.getFichasOrfas(),
  adicionarFicha: (ficha, programaId) =>
    trainifyState.adicionarFicha(ficha, programaId),
  atualizarFicha: (id, atualizacoes) =>
    trainifyState.atualizarFicha(id, atualizacoes),
  removerFicha: (id) => trainifyState.removerFicha(id),
  copiarFicha: (id) => trainifyState.copiarFicha(id),
  vincularFichaAoPrograma: (fichaId, programaId) =>
    trainifyState.vincularFichaAoPrograma(fichaId, programaId),
  desvincularFichaDoPrograma: (fichaId, programaId) =>
    trainifyState.desvincularFichaDoPrograma(fichaId, programaId),

  // Exercícios
  listarTodosExercicios: () => trainifyState.getTodosExercicios(),
  listarExerciciosCustom: () => trainifyState.getExerciciosCustom(),
  obterExercicioPorId: (id) => trainifyState.getExercicioPorId(id),
  adicionarExercicioCustom: (exercicio) =>
    trainifyState.adicionarExercicioCustom(exercicio),
  removerExercicioCustom: (id) => trainifyState.removerExercicioCustom(id),
  obterGruposMusculares: () => trainifyState.getGruposMusculares(),

  // Histórico
  listarTreinos: () => trainifyState.getHistorico(),
  obterHistoricoDaFicha: (fichaId) =>
    trainifyState.getHistoricoDaFicha(fichaId),
  adicionarTreino: (registro) => trainifyState.adicionarTreino(registro),

  // Utilitários
  gerarNomeFicha: () => trainifyState.gerarNomeFicha(),
  inscrever: (callback) => trainifyState.inscrever(callback),
};
