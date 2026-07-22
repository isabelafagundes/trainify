import { describe, expect, it } from "vitest";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { criarIdGraficoCardio } from "@/interface/widget/grafico/cardioGraficoId";
import { calcularProgressaoCompartilhavel } from "./calcular-progressao-exercicio";

const exercicios: Exercicio[] = [
  { id: "supino", nome: "Supino reto", grupoMuscular: "Peito" },
];

function treino(id: string, data: string, carga: number): RegistroTreino {
  return {
    id,
    fichaId: "ficha-a",
    data: data.slice(0, 10),
    iniciadoEm: data,
    finalizadoEm: data,
    exercicios: [{
      exercicioId: "supino",
      nota: "",
      series: [{ serie: 1, repeticoes: 10, carga }],
    }],
    cardio: [],
  };
}

describe("calcularProgressaoCompartilhavel", () => {
  it("calcula a evolução entre a primeira e a última das oito sessões recentes", () => {
    const historico = Array.from({ length: 10 }, (_, indice) =>
      treino(
        String(indice),
        `2026-01-${String(indice + 1).padStart(2, "0")}T10:00:00.000Z`,
        20 + indice * 5,
      ),
    );

    const resultado = calcularProgressaoCompartilhavel("supino", exercicios, historico);

    expect(resultado?.pontos).toHaveLength(8);
    expect(resultado?.valorInicial).toBe(30);
    expect(resultado?.valorAtual).toBe(65);
    expect(resultado?.melhorValor).toBe(65);
    expect(resultado?.variacaoPercentual).toBeCloseTo(116.67, 1);
  });

  it("considera redução de ritmo como evolução positiva no cardio", () => {
    const id = criarIdGraficoCardio("Remo", "ritmo500m");
    const historico = [
      { ...treino("1", "2026-01-01T10:00:00.000Z", 0), exercicios: [], cardio: [{ cardioId: "a", tipo: "Remo", duracaoMinutos: 10, nota: "", ritmo500m: 150 }] },
      { ...treino("2", "2026-02-01T10:00:00.000Z", 0), exercicios: [], cardio: [{ cardioId: "a", tipo: "Remo", duracaoMinutos: 10, nota: "", ritmo500m: 120 }] },
    ];

    const resultado = calcularProgressaoCompartilhavel(id, exercicios, historico);

    expect(resultado?.melhoraQuandoMenor).toBe(true);
    expect(resultado?.melhorValor).toBe(120);
    expect(resultado?.variacaoPercentual).toBe(20);
  });
});
