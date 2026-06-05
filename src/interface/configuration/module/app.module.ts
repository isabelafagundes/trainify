/* ═══════════════════════════════════════════
   Módulo de Injeção de Dependências — Trainify
   ═══════════════════════════════════════════ */

import type { FichaApiRepository } from "@/infrastructure/repo/api/ficha-api.repo";
import { fichaMockRepository } from "@/infrastructure/repo/mock/ficha-mock.repo";
import {
  criarArmazenamento,
  type Armazenamento,
} from "@/infrastructure/service/armazenamento.service";
import {
  criarFeedbackTatilService,
  type FeedbackTatilService,
} from "@/infrastructure/service/feedback-tatil.service";
import {
  criarNotificacoesTreinoService,
  type NotificacoesTreinoService,
} from "@/infrastructure/service/notificacoes-treino.service";

/** Configuração do ambiente */
export type Ambiente = "development" | "production";

/** Container de dependências da aplicação */
export interface AppModule {
  fichas: FichaApiRepository;
  armazenamento: Armazenamento;
  feedbackTatil: FeedbackTatilService;
  notificacoesTreino: NotificacoesTreinoService;
}

/** Criar módulo da aplicação */
export function criarModule(ambiente: Ambiente = "development"): AppModule {
  const usarMock = ambiente === "development" || import.meta.env.DEV;

  return {
    fichas: usarMock ? fichaMockRepository : fichaMockRepository, // TODO: substituir por API real
    armazenamento: criarArmazenamento(),
    feedbackTatil: criarFeedbackTatilService(),
    notificacoesTreino: criarNotificacoesTreinoService(),
  };
}

/** Instância global do módulo */
export const appModule = criarModule(import.meta.env.MODE as Ambiente);
