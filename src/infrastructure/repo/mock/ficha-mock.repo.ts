/* ═══════════════════════════════════════════
   Repositório de Fichas (Mock) — Trainify
   ═══════════════════════════════════════════ */

import type { Ficha } from "@/domain/tipos";
import type { FichaApiRepository } from "@/infrastructure/repo/api/ficha-api.repo";

/** Dados mockados de fichas */
const fichasMock: Ficha[] = [];

export const fichaMockRepository: FichaApiRepository = {
  async listar() {
    return {
      data: fichasMock,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
    };
  },

  async obterPorId(id: string) {
    const ficha = fichasMock.find((f) => f.id === id);
    if (!ficha) {
      throw new Error(`Ficha ${id} não encontrada`);
    }
    return {
      data: ficha,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
    };
  },

  async criar(ficha) {
    const novaFicha: Ficha = {
      ...ficha,
      id: crypto.randomUUID(),
    };
    fichasMock.push(novaFicha);
    return {
      data: novaFicha,
      status: 201,
      statusText: "Created",
      headers: new Headers(),
    };
  },

  async atualizar(id: string, ficha) {
    const index = fichasMock.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Ficha ${id} não encontrada`);
    }
    fichasMock[index] = { ...fichasMock[index], ...ficha };
    return {
      data: fichasMock[index],
      status: 200,
      statusText: "OK",
      headers: new Headers(),
    };
  },

  async deletar(id: string) {
    const index = fichasMock.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Ficha ${id} não encontrada`);
    }
    fichasMock.splice(index, 1);
    return {
      data: undefined,
      status: 204,
      statusText: "No Content",
      headers: new Headers(),
    };
  },
};
