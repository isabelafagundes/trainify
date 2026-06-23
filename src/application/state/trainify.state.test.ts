import { beforeEach, describe, expect, it, vi } from "vitest";
import { trainifyState } from "@/application/state/trainify.state";

const dadosVazios = {
  programas: [],
  fichas: [],
  historico: [],
  exerciciosCustom: [],
};

describe("trainifyState", () => {
  beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    trainifyState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
  });

  it("substituirDados aplica dados e preserva atualizadoEm informado", () => {
    const atualizadoEm = "2024-03-04T05:06:07.000Z";

    trainifyState.substituirDados(
      {
        programas: [
          {
            id: "programa-1",
            nome: "Hipertrofia",
            descricao: "",
            fichaIds: [],
            ativo: true,
          },
        ],
        fichas: [],
        historico: [],
        exerciciosCustom: [],
      },
      atualizadoEm
    );

    expect(trainifyState.getProgramas()).toHaveLength(1);
    expect(trainifyState.getAtualizadoEm()).toBe(atualizadoEm);
  });

  it("mutacoes locais atualizam atualizadoEm", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-04-05T06:07:08.000Z"));

    trainifyState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
    trainifyState.adicionarPrograma({
      nome: "Forca",
      descricao: "",
      fichaIds: [],
      ativo: true,
    });

    expect(trainifyState.getAtualizadoEm()).toBe("2024-04-05T06:07:08.000Z");
    vi.useRealTimers();
  });
});
