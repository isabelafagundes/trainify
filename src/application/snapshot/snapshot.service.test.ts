import { beforeEach, describe, expect, it } from "vitest";
import { snapshotService } from "@/application/snapshot/snapshot.service";
import { pezzoState } from "@/application/state/pezzo.state";
import { usuarioManager } from "@/application/state/usuario.state";
import { VERSAO_SCHEMA } from "@/constants";
import type { SnapshotPezzo } from "@/domain/snapshot";

const dadosVazios = {
  programas: [],
  fichas: [],
  historico: [],
  exerciciosCustom: [],
  cardioCustom: [],
};

function criarSnapshot(atualizadoEm = "2024-01-02T03:04:05.000Z"): SnapshotPezzo {
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
          itens: [
            {
              tipo: "cardio",
              cardio: { id: "cardio-1", tipo: "Esteira", duracaoMinutos: 10, nota: "" },
            },
            {
              tipo: "exercicio",
              exercicio: {
                exercicioId: "ex-1",
                series: 3,
                repeticoes: 10,
                usaCarga: true,
                descansoSegundos: 60,
              },
            },
          ],
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
      cardioCustom: [
        {
          id: "cardio-custom-1",
          nome: "Caminhada",
          emoji: "🚶",
          metricas: ["duracaoMinutos", "distanciaKm"],
          builtin: false,
        },
      ],
    },
  };
}

describe("snapshotService", () => {
  beforeEach(() => {
    localStorage.clear();
    pezzoState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
    usuarioManager.substituirUsuario(null);
  });

  it("serializa e desserializa um snapshot v2", () => {
    const snapshot = criarSnapshot();

    const resultado = snapshotService.desserializar(
      snapshotService.serializar(snapshot)
    );

    expect(resultado).toEqual(snapshot);
  });

  it("migra snapshot v1 convertendo fichas antigas para itens", () => {
    const snapshotV1 = {
      ...criarSnapshot(),
      versaoSchema: 1,
      dados: {
        ...criarSnapshot().dados,
        fichas: [
          {
            id: "ficha-antiga",
            nome: "Treino antigo",
            descricao: "",
            icone: "halter",
            modalidade: "ambos",
            exercicios: [
              {
                exercicioId: "ex-1",
                series: 3,
                repeticoes: 10,
                usaCarga: true,
                descansoSegundos: 60,
              },
            ],
            cardio: [{ id: "cardio-1", tipo: "Bike", duracaoMinutos: 20, nota: "" }],
          },
        ],
      },
    };

    const resultado = snapshotService.desserializar(JSON.stringify(snapshotV1));

    expect(resultado.versaoSchema).toBe(VERSAO_SCHEMA);
    // Exercícios primeiro, cardio no fim — espelha o fluxo antigo de execução
    expect(resultado.dados.fichas[0].itens.map((item) => item.tipo)).toEqual([
      "exercicio",
      "cardio",
    ]);
    expect(resultado.dados.fichas[0]).not.toHaveProperty("modalidade");
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
    expect(pezzoState.getProgramas()).toEqual(snapshot.dados.programas);
    expect(pezzoState.getFichas()).toEqual(snapshot.dados.fichas);
    expect(pezzoState.getExerciciosCustom()).toEqual(
      snapshot.dados.exerciciosCustom
    );
    expect(pezzoState.getCardioCustom()).toEqual(snapshot.dados.cardioCustom);
    expect(pezzoState.getAtualizadoEm()).toBe(snapshot.atualizadoEm);
  });

  it("importarSnapshot com maisRecente ignora snapshot mais antigo", async () => {
    pezzoState.substituirDados(dadosVazios, "2024-02-01T00:00:00.000Z");
    const snapshotAntigo = criarSnapshot("2024-01-01T00:00:00.000Z");

    await snapshotService.importarSnapshot(snapshotAntigo, "maisRecente");

    expect(pezzoState.getProgramas()).toEqual([]);
    expect(usuarioManager.obterUsuario()).toBeNull();
  });
});
