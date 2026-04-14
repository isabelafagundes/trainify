/* ═══════════════════════════════════════════
   Repositório de Fichas (API) — Trainify
   ═══════════════════════════════════════════ */

import type { Ficha } from "@/domain/tipos";
import type { HttpResponse } from "@/infrastructure/service/api/http-client";

export interface FichaApiRepository {
  listar(): Promise<HttpResponse<Ficha[]>>;
  obterPorId(id: string): Promise<HttpResponse<Ficha>>;
  criar(ficha: Omit<Ficha, "id">): Promise<HttpResponse<Ficha>>;
  atualizar(id: string, ficha: Partial<Ficha>): Promise<HttpResponse<Ficha>>;
  deletar(id: string): Promise<HttpResponse<void>>;
}
