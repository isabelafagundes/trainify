/* ═══════════════════════════════════════════
   Persistência da sessão de treino em execução
   ───────────────────────────────────────────
   Mantém o treino em andamento recuperável caso
   o app vá para segundo plano, seja recarregado
   ou encerrado pelo sistema.
   ═══════════════════════════════════════════ */

import type { RegistroCardio, RegistroSerie } from "@/domain/tipos";
import { STORAGE_KEYS } from "@/constants";
import { appModule } from "@/interface/configuration/module/app.module";

export type ModoExecucao = "musculacao" | "cardio";

/** Exercício da sessão em formato serializável (Set → array). */
export interface SessaoExercicioSalva {
  exercicioId: string;
  series: RegistroSerie[];
  nota: string;
  concluidas: number[];
  visitado: boolean;
}

/** Snapshot completo do treino em execução. */
export interface SessaoTreinoSalva {
  fichaId: string;
  iniciadoEm: string;
  modo: ModoExecucao;
  indiceAtual: number;
  exercicios: SessaoExercicioSalva[];
  cardio: RegistroCardio[];
  cardioConcluido: string[];
  atualizadoEm: string;
}

export async function carregarSessaoAtiva(): Promise<SessaoTreinoSalva | null> {
  try {
    const salvo = await appModule.armazenamento.obter(STORAGE_KEYS.SESSAO_ATIVA);
    if (!salvo) return null;
    return JSON.parse(salvo) as SessaoTreinoSalva;
  } catch (erro) {
    console.error("Erro ao carregar sessão ativa:", erro);
    return null;
  }
}

export async function salvarSessaoAtiva(sessao: SessaoTreinoSalva): Promise<void> {
  try {
    await appModule.armazenamento.definir(
      STORAGE_KEYS.SESSAO_ATIVA,
      JSON.stringify(sessao)
    );
  } catch (erro) {
    console.error("Erro ao salvar sessão ativa:", erro);
  }
}

export async function limparSessaoAtiva(): Promise<void> {
  try {
    await appModule.armazenamento.remover(STORAGE_KEYS.SESSAO_ATIVA);
  } catch (erro) {
    console.error("Erro ao limpar sessão ativa:", erro);
  }
}
