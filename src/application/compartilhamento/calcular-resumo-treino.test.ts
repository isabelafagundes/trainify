import { describe, expect, it } from "vitest";
import type { RegistroTreino } from "@/domain/tipos";
import { calcularResumoTreino } from "./calcular-resumo-treino";

const base: RegistroTreino = { id: "r1", fichaId: "f1", data: "2026-07-20", iniciadoEm: "2026-07-20T10:00:00Z", finalizadoEm: "2026-07-20T11:00:00Z", exercicios: [], cardio: [] };

describe("calcularResumoTreino", () => {
  it("soma apenas exercícios com séries e agrega cardio", () => {
    const resumo = calcularResumoTreino({ ...base, exercicios: [
      { exercicioId: "a", nota: "", series: [{ serie: 1, carga: 10, repeticoes: 8 }, { serie: 2, carga: 10, repeticoes: 8 }] },
      { exercicioId: "b", nota: "", series: [] },
    ], cardio: [{ cardioId: "c", tipo: "Bike", nota: "", duracaoMinutos: 20, distanciaKm: 5.2 }] });
    expect(resumo).toEqual({ duracaoSegundos: 3600, totalExercicios: 1, totalSeries: 2, volumeTotalKg: 160, totalCardios: 1, duracaoCardioMinutos: 20, distanciaCardioKm: 5.2 });
  });
  it("soma o volume total (repetições × carga) só de séries com carga", () => {
    const resumo = calcularResumoTreino({ ...base, exercicios: [
      { exercicioId: "a", nota: "", series: [{ serie: 1, carga: 20, repeticoes: 10 }, { serie: 2, carga: 22.5, repeticoes: 8 }] },
      { exercicioId: "b", nota: "", series: [{ serie: 1, carga: 0, repeticoes: 12 }] },
    ] });
    expect(resumo.volumeTotalKg).toBe(380);
  });
  it.each([
    ["datas inválidas", "x", "y"],
    ["duração negativa", "2026-07-20T11:00:00Z", "2026-07-20T10:00:00Z"],
    ["duração acima de quatro horas", "2026-07-20T10:00:00Z", "2026-07-20T15:00:01Z"],
  ])("oculta %s", (_nome, iniciadoEm, finalizadoEm) => {
    expect(calcularResumoTreino({ ...base, iniciadoEm, finalizadoEm }).duracaoSegundos).toBe(0);
  });
  it("aceita treino curtíssimo e treino só de cardio", () => {
    const resumo = calcularResumoTreino({ ...base, finalizadoEm: "2026-07-20T10:00:01Z", cardio: [{ cardioId: "c", tipo: "Esteira", nota: "", duracaoMinutos: 5 }] });
    expect(resumo.duracaoSegundos).toBe(1);
    expect(resumo.totalExercicios).toBe(0);
    expect(resumo.totalCardios).toBe(1);
  });
});
