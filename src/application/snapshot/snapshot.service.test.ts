import { beforeEach, describe, expect, it } from "vitest";
import { snapshotService } from "@/application/snapshot/snapshot.service";
import { trainifyState } from "@/application/state/trainify.state";
import { usuarioManager } from "@/application/state/usuario.state";
import { VERSAO_SCHEMA } from "@/constants";
import type { SnapshotTrainify } from "@/domain/snapshot";

const dadosVazios = {
  programas: [],
  fichas: [],
  historico: [],
  exerciciosCustom: [],
};

function criarSnapshot(atualizadoEm = "2024-01-02T03:04:05.000Z"): SnapshotTrainify {
  return {
    versaoSchema: VERSAO_SCHEMA,
    atualizadoEm,
    exportadoEm: "2024-01-02T03:05:00.000Z",
    usuario: {
      nome: "Isa",
      avatarEmoji: ":)",
      criadoEm: "2024-01-01T00:00:00.000Z",
    },
    dados: {
      programas: [
        {
          id: "programa-1",
          nome: "Forca",
          descricao: "Base",
          fichaIds: ["ficha-1"],
          ativo: true,
        },
      ],
      fichas: [
        {
          id: "ficha-1",
          nome: "Treino A",
          descricao: "",
          icone: "halter",
          exercicios: [],
          cardio: [],
        },
      ],
      historico: [],
      exerciciosCustom: [
        {
          id: "custom-1",
          nome: "Remada inventada",
          grupoMuscular: "Costas",
        },
      ],
    },
  };
}

describe("snapshotService", () => {
  beforeEach(() => {
    localStorage.clear();
    trainifyState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
    usuarioManager.substituirUsuario(null);
  });

  it("serializa e desserializa um snapshot v1", () => {
    const snapshot = criarSnapshot();

    const resultado = snapshotService.desserializar(
      snapshotService.serializar(snapshot)
    );

    expect(resultado).toEqual(snapshot);
  });

  it("rejeita JSON invalido", () => {
    expect(() => snapshotService.desserializar("{")).toThrow();
  });

  it("rejeita versao futura de schema", () => {
    const snapshot = {
      ...criarSnapshot(),
      versaoSchema: VERSAO_SCHEMA + 1,
    };

    expect(() => snapshotService.desserializar(JSON.stringify(snapshot))).toThrow(
      "versao mais nova"
    );
  });

  it("importarSnapshot com substituir troca usuario e dados locais", async () => {
    const snapshot = criarSnapshot();

    await snapshotService.importarSnapshot(snapshot, "substituir");

    expect(usuarioManager.obterUsuario()).toEqual(snapshot.usuario);
    expect(trainifyState.getProgramas()).toEqual(snapshot.dados.programas);
    expect(trainifyState.getFichas()).toEqual(snapshot.dados.fichas);
    expect(trainifyState.getExerciciosCustom()).toEqual(
      snapshot.dados.exerciciosCustom
    );
    expect(trainifyState.getAtualizadoEm()).toBe(snapshot.atualizadoEm);
  });

  it("importarSnapshot com maisRecente ignora snapshot mais antigo", async () => {
    trainifyState.substituirDados(dadosVazios, "2024-02-01T00:00:00.000Z");
    const snapshotAntigo = criarSnapshot("2024-01-01T00:00:00.000Z");

    await snapshotService.importarSnapshot(snapshotAntigo, "maisRecente");

    expect(trainifyState.getProgramas()).toEqual([]);
    expect(usuarioManager.obterUsuario()).toBeNull();
  });
});
