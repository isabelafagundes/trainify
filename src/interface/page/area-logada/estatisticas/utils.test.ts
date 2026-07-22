import { describe, expect, it } from "vitest";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import {
  agregarProgressaoPorCardio,
  calcularResumoCardio,
} from "./cardioUtils";
import {
  agregarProgressaoPorExercicio,
  calcularMaiorEvolucaoCarga,
  calcularRecordeStreak,
  calcularStreakAtual,
  calcularTreinosNoMes,
  calcularVolumeSemanal,
  construirDadosFrequencia,
  filtrarProgressaoExercicios,
} from "./utils";

function treino(parcial: Partial<RegistroTreino>): RegistroTreino {
  return {
    id: parcial.id ?? crypto.randomUUID(),
    fichaId: parcial.fichaId ?? "ficha-a",
    data: parcial.data ?? "2026-05-20",
    iniciadoEm: parcial.iniciadoEm ?? "2026-05-20T10:00:00.000Z",
    finalizadoEm: parcial.finalizadoEm ?? "2026-05-20T11:00:00.000Z",
    exercicios: parcial.exercicios ?? [],
    cardio: parcial.cardio ?? [],
  };
}

describe("estatisticas utils", () => {
  it("calcula treinos no mes da data de referencia", () => {
    const historico = [
      treino({ iniciadoEm: "2026-05-01T12:00:00.000Z" }),
      treino({ iniciadoEm: "2026-05-31T12:00:00.000Z" }),
      treino({ iniciadoEm: "2026-04-30T12:00:00.000Z" }),
      treino({ iniciadoEm: "2025-05-10T12:00:00.000Z" }),
    ];

    expect(calcularTreinosNoMes(historico, new Date("2026-05-15T00:00:00"))).toBe(2);
  });

  it("calcula streak atual aceitando treino hoje ou ontem como ponto de partida", () => {
    const historico = [
      treino({ iniciadoEm: "2026-05-22T10:00:00" }),
      treino({ iniciadoEm: "2026-05-21T10:00:00" }),
      treino({ iniciadoEm: "2026-05-20T10:00:00" }),
      treino({ iniciadoEm: "2026-05-18T10:00:00" }),
    ];

    expect(calcularStreakAtual(historico, new Date("2026-05-23T09:00:00"))).toBe(3);
  });

  it("calcula o maior recorde de streak ignorando treinos duplicados no mesmo dia", () => {
    const historico = [
      treino({ iniciadoEm: "2026-05-01T10:00:00" }),
      treino({ iniciadoEm: "2026-05-01T18:00:00" }),
      treino({ iniciadoEm: "2026-05-02T10:00:00" }),
      treino({ iniciadoEm: "2026-05-04T10:00:00" }),
      treino({ iniciadoEm: "2026-05-05T10:00:00" }),
      treino({ iniciadoEm: "2026-05-06T10:00:00" }),
    ];

    expect(calcularRecordeStreak(historico)).toBe(3);
  });

  it("constroi uma janela de frequencia com fichas completadas por dia", () => {
    const historico = [
      treino({ fichaId: "a", iniciadoEm: "2026-05-21T10:00:00" }),
      treino({ fichaId: "b", iniciadoEm: "2026-05-23T10:00:00" }),
      treino({ fichaId: "c", iniciadoEm: "2026-05-23T18:00:00" }),
    ];

    const resultado = construirDadosFrequencia(historico, 3, new Date("2026-05-23T12:00:00"));

    expect(resultado.dataInicio).toBe("2026-05-21");
    expect(resultado.dataFim).toBe("2026-05-23");
    expect(resultado.registros).toEqual([
      { data: "2026-05-21", completou: true, fichasCompletas: ["a"] },
      { data: "2026-05-22", completou: false, fichasCompletas: undefined },
      { data: "2026-05-23", completou: true, fichasCompletas: ["b", "c"] },
    ]);
  });

  it("agrega progressao por exercicio usando a sessao mais recente e maior carga", () => {
    const exercicios: Exercicio[] = [
      { id: "supino", nome: "Supino", grupoMuscular: "Peito" },
      { id: "barra", nome: "Barra fixa", grupoMuscular: "Costas" },
    ];
    const historico = [
      treino({
        iniciadoEm: "2026-05-10T10:00:00",
        exercicios: [
          {
            exercicioId: "supino",
            nota: "",
            series: [
              { serie: 1, repeticoes: 10, carga: 40 },
              { serie: 2, repeticoes: 8, carga: 42 },
            ],
          },
        ],
      }),
      treino({
        iniciadoEm: "2026-05-20T10:00:00",
        exercicios: [
          {
            exercicioId: "supino",
            nota: "",
            series: [{ serie: 1, repeticoes: 8, carga: 38 }],
          },
          {
            exercicioId: "barra",
            nota: "",
            series: [{ serie: 1, repeticoes: 6, carga: 0 }],
          },
          {
            exercicioId: "ignorado",
            nota: "",
            series: [{ serie: 1, repeticoes: 6, carga: 99 }],
          },
        ],
      }),
    ];

    expect(agregarProgressaoPorExercicio(historico, exercicios)).toEqual([
      {
        exercicioId: "supino",
        nome: "Supino",
        grupoMuscular: "Peito",
        totalSessoes: 2,
        ultimaData: "2026-05-20T10:00:00",
        cargaMaxima: 42,
        ultimaCarga: 38,
        usaCarga: true,
      },
      {
        exercicioId: "barra",
        nome: "Barra fixa",
        grupoMuscular: "Costas",
        totalSessoes: 1,
        ultimaData: "2026-05-20T10:00:00",
        cargaMaxima: 0,
        ultimaCarga: 0,
        usaCarga: false,
      },
    ]);
  });

  it("filtra a progressao por nome sem diferenciar acentos ou maiusculas", () => {
    const progressao = [
      {
        exercicioId: "rosca",
        nome: "Rosca Concentrada",
        grupoMuscular: "Bíceps",
        totalSessoes: 2,
        ultimaData: "2026-05-20T10:00:00",
        cargaMaxima: 12,
        ultimaCarga: 12,
        usaCarga: true,
      },
      {
        exercicioId: "remada",
        nome: "Remada Baixa",
        grupoMuscular: "Costas",
        totalSessoes: 1,
        ultimaData: "2026-05-19T10:00:00",
        cargaMaxima: 30,
        ultimaCarga: 30,
        usaCarga: true,
      },
    ];

    expect(filtrarProgressaoExercicios(progressao, "CONCENTRÁDA", null)).toEqual([
      progressao[0],
    ]);
  });

  it("combina a busca por exercício com o filtro de grupo muscular", () => {
    const progressao = [
      {
        exercicioId: "abdominal",
        nome: "Abdominal Crunch",
        grupoMuscular: "Abdômen",
        totalSessoes: 2,
        ultimaData: "2026-05-20T10:00:00",
        cargaMaxima: 0,
        ultimaCarga: 0,
        usaCarga: false,
      },
      {
        exercicioId: "prancha",
        nome: "Prancha Lateral",
        grupoMuscular: "Abdômen",
        totalSessoes: 1,
        ultimaData: "2026-05-19T10:00:00",
        cargaMaxima: 0,
        ultimaCarga: 0,
        usaCarga: false,
      },
      {
        exercicioId: "rosca",
        nome: "Rosca de Punho",
        grupoMuscular: "Antebraço",
        totalSessoes: 1,
        ultimaData: "2026-05-18T10:00:00",
        cargaMaxima: 10,
        ultimaCarga: 10,
        usaCarga: true,
      },
    ];

    expect(filtrarProgressaoExercicios(progressao, "lateral", "Abdômen")).toEqual([
      progressao[1],
    ]);
    expect(filtrarProgressaoExercicios(progressao, "rosca", "Abdômen")).toEqual([]);
  });

  it("calcula resumo de cardio somando sessões, duração e distância", () => {
    const historico = [
      treino({
        cardio: [
          {
            cardioId: "c1",
            tipo: "Esteira",
            duracaoMinutos: 30,
            distanciaKm: 4.2,
            nota: "",
          },
        ],
      }),
      treino({
        cardio: [
          {
            cardioId: "c2",
            tipo: "Bike",
            duracaoMinutos: 45,
            distanciaKm: 15,
            nota: "",
          },
        ],
      }),
    ];

    expect(calcularResumoCardio(historico)).toEqual({
      totalSessoes: 2,
      totalMinutos: 75,
      totalKm: 19.2,
    });
  });

  it("agrega volume semanal em janela contígua com semanas sem treino zeradas", () => {
    // Segunda de referência: 2026-05-18. Semana atual (18–24) e a anterior (11–17).
    const historico = [
      treino({
        iniciadoEm: "2026-05-20T10:00:00", // semana atual
        exercicios: [
          {
            exercicioId: "supino",
            nota: "",
            series: [
              { serie: 1, repeticoes: 10, carga: 40 }, // 400
              { serie: 2, repeticoes: 8, carga: 50 }, // 400
            ],
          },
        ],
      }),
      treino({
        iniciadoEm: "2026-05-12T10:00:00", // semana anterior
        exercicios: [
          {
            exercicioId: "supino",
            nota: "",
            series: [{ serie: 1, repeticoes: 10, carga: 40 }], // 400
          },
        ],
      }),
    ];

    const resultado = calcularVolumeSemanal(historico, 3, new Date("2026-05-21T09:00:00"));

    expect(resultado.semanas).toEqual([
      { inicioISO: "2026-05-04", volume: 0 },
      { inicioISO: "2026-05-11", volume: 400 },
      { inicioISO: "2026-05-18", volume: 800 },
    ]);
    expect(resultado.volumeAtual).toBe(800);
    expect(resultado.volumeAnterior).toBe(400);
    expect(resultado.deltaPct).toBe(100);
  });

  it("volume semanal sem base de comparação retorna deltaPct null", () => {
    const historico = [
      treino({
        iniciadoEm: "2026-05-20T10:00:00",
        exercicios: [
          { exercicioId: "supino", nota: "", series: [{ serie: 1, repeticoes: 10, carga: 40 }] },
        ],
      }),
    ];

    const resultado = calcularVolumeSemanal(historico, 3, new Date("2026-05-21T09:00:00"));

    expect(resultado.volumeAnterior).toBe(0);
    expect(resultado.deltaPct).toBeNull();
  });

  it("escolhe o exercício com maior ganho de carga na janela", () => {
    const exercicios: Exercicio[] = [
      { id: "supino", nome: "Supino", grupoMuscular: "Peito" },
      { id: "agacho", nome: "Agachamento", grupoMuscular: "Pernas" },
    ];
    const historico = [
      treino({
        iniciadoEm: "2026-05-01T10:00:00",
        exercicios: [
          { exercicioId: "supino", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 40 }] },
          { exercicioId: "agacho", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 60 }] },
        ],
      }),
      treino({
        iniciadoEm: "2026-05-10T10:00:00",
        exercicios: [
          { exercicioId: "supino", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 45 }] }, // +5
          { exercicioId: "agacho", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 80 }] }, // +20
        ],
      }),
    ];

    const resultado = calcularMaiorEvolucaoCarga(historico, exercicios);

    expect(resultado).toMatchObject({
      exercicioId: "agacho",
      nome: "Agachamento",
      cargaInicial: 60,
      cargaAtual: 80,
      delta: 20,
    });
    expect(resultado?.pontos).toHaveLength(2);
  });

  it("maior evolução ignora exercícios sem carga ou sem progresso", () => {
    const exercicios: Exercicio[] = [
      { id: "barra", nome: "Barra fixa", grupoMuscular: "Costas" },
      { id: "supino", nome: "Supino", grupoMuscular: "Peito" },
    ];
    const historico = [
      treino({
        iniciadoEm: "2026-05-01T10:00:00",
        exercicios: [
          { exercicioId: "barra", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 0 }] },
          { exercicioId: "supino", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 50 }] },
        ],
      }),
      treino({
        iniciadoEm: "2026-05-10T10:00:00",
        exercicios: [
          { exercicioId: "barra", nota: "", series: [{ serie: 1, repeticoes: 10, carga: 0 }] },
          { exercicioId: "supino", nota: "", series: [{ serie: 1, repeticoes: 8, carga: 45 }] }, // regrediu
        ],
      }),
    ];

    expect(calcularMaiorEvolucaoCarga(historico, exercicios)).toBeNull();
  });

  it("agrega progressão de cardio pela métrica principal mais recente", () => {
    const historico = [
      treino({
        iniciadoEm: "2026-05-10T10:00:00",
        cardio: [
          {
            cardioId: "c1",
            tipo: "Esteira",
            duracaoMinutos: 30,
            distanciaKm: 4,
            nota: "",
          },
        ],
      }),
      treino({
        iniciadoEm: "2026-05-20T10:00:00",
        cardio: [
          {
            cardioId: "c2",
            tipo: "Esteira",
            duracaoMinutos: 35,
            distanciaKm: 5,
            nota: "",
          },
        ],
      }),
    ];

    expect(agregarProgressaoPorCardio(historico)).toMatchObject([
      {
        tipo: "Esteira",
        nome: "Esteira",
        metrica: "distanciaKm",
        rotuloMetrica: "Distância",
        totalSessoes: 2,
        ultimaData: "2026-05-20T10:00:00",
        ultimoValor: 5,
        melhorValor: 5,
      },
    ]);
  });
});
