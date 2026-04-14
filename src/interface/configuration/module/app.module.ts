/* ═══════════════════════════════════════════
   Módulo de Injeção de Dependências — Trainify
   ═══════════════════════════════════════════ */

import type { FichaApiRepository } from "@/infrastructure/repo/api/ficha-api.repo";
import { fichaMockRepository } from "@/infrastructure/repo/mock/ficha-mock.repo";

/** Configuração do ambiente */
export type Ambiente = "development" | "production";

/** Container de dependências da aplicação */
export interface AppModule {
  fichas: FichaApiRepository;
}

/** Criar módulo da aplicação */
export function criarModule(ambiente: Ambiente = "development"): AppModule {
  const usarMock = ambiente === "development" || import.meta.env.DEV;

  return {
    fichas: usarMock ? fichaMockRepository : fichaMockRepository, // TODO: substituir por API real
  };
}

/** Instância global do módulo */
export const appModule = criarModule(import.meta.env.MODE as Ambiente);
