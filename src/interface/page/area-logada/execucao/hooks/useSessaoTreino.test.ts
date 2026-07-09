import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { STORAGE_KEYS } from "@/constants";
import { VERSAO_SESSAO_SALVA } from "@/application/state/sessao-ativa";
import { useSessaoTreino } from "./useSessaoTreino";

// Armazenamento em memória no lugar do Preferences/localStorage.
const memoria = new Map<string, string>();

vi.mock("@/interface/configuration/module/app.module", () => ({
  appModule: {
    armazenamento: {
      obter: async (chave: string) => memoria.get(chave) ?? null,
      definir: async (chave: string, valor: string) => {
        memoria.set(chave, valor);
      },
      remover: async (chave: string) => {
        memoria.delete(chave);
      },
    },
  },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@capacitor/app", () => ({
  App: { addListener: async () => ({ remove: () => {} }) },
}));

/** Deixa os microtasks da restauração (carregarSessaoAtiva) resolverem. */
async function aguardarRestauracao() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function fichaMista(): Ficha {
  return {
    id: "ficha-1",
    nome: "Treino A",
    descricao: "",
    icone: "halter",
    itens: [
      { tipo: "cardio", cardio: { id: "c1", tipo: "Esteira", duracaoMinutos: 20, nota: "" } },
      {
        tipo: "exercicio",
        exercicio: { exercicioId: "supino", series: 2, repeticoes: 10, usaCarga: true, descansoSegundos: 60 },
      },
      {
        tipo: "exercicio",
        exercicio: { exercicioId: "triceps", series: 1, repeticoes: 12, usaCarga: true, descansoSegundos: 45 },
      },
      { tipo: "cardio", cardio: { id: "c2", tipo: "Bike", duracaoMinutos: 15, nota: "" } },
    ],
  };
}

function fichaSoCardio(): Ficha {
  return {
    id: "ficha-cardio",
    nome: "Cardio da Manhã",
    descricao: "",
    icone: "corrida",
    itens: [
      { tipo: "cardio", cardio: { id: "c1", tipo: "Esteira", duracaoMinutos: 20, nota: "" } },
      { tipo: "cardio", cardio: { id: "c2", tipo: "Bike", duracaoMinutos: 15, nota: "" } },
    ],
  };
}

describe("useSessaoTreino", () => {
  beforeEach(() => {
    memoria.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pagina sobre a sequência intercalada de itens da ficha", async () => {
    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    expect(result.current.itens.map((item) => item.tipo)).toEqual([
      "cardio",
      "exercicio",
      "exercicio",
      "cardio",
    ]);
    expect(result.current.itemAtual?.tipo).toBe("cardio");
    expect(result.current.configuracaoAtual).toBeUndefined();
    expect(result.current.ultimoItem).toBe(false);

    // proximo() atravessa do cardio pro exercício, sem "modos".
    act(() => result.current.proximo());
    expect(result.current.indiceAtual).toBe(1);
    expect(result.current.itemAtual?.tipo).toBe("exercicio");
    expect(result.current.configuracaoAtual?.descansoSegundos).toBe(60);

    act(() => result.current.irPara(3));
    expect(result.current.ultimoItem).toBe(true);
    act(() => result.current.irPara(99));
    expect(result.current.indiceAtual).toBe(3);
    act(() => result.current.anterior());
    expect(result.current.indiceAtual).toBe(2);
  });

  it("deriva statusItens e progresso, com toggles de série e cardio", async () => {
    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    // 3 séries de exercício + 2 itens de cardio = 5 unidades de progresso.
    expect(result.current.progresso).toMatchObject({
      itensConcluidos: 0,
      itensTotal: 4,
      seriesConcluidas: 0,
      seriesTotal: 3,
      fracao: 0,
    });

    act(() => result.current.marcarConcluida(1, 0));
    expect(result.current.statusItens[1].rotuloProgresso).toBe("1/2 séries");
    expect(result.current.progresso.seriesConcluidas).toBe(1);
    expect(result.current.progresso.fracao).toBeCloseTo(1 / 5);

    // Toggle desfaz (base do ToastDesfazer).
    act(() => result.current.marcarConcluida(1, 0));
    expect(result.current.progresso.seriesConcluidas).toBe(0);

    act(() => result.current.marcarCardioConcluido("c1"));
    expect(result.current.statusItens[0]).toMatchObject({
      tipo: "cardio",
      estado: "concluido",
      tipoCardio: "Esteira",
      rotuloProgresso: "Cardio · 20 min",
    });
    expect(result.current.progresso.itensConcluidos).toBe(1);

    act(() => result.current.marcarCardioConcluido("c1"));
    expect(result.current.progresso.itensConcluidos).toBe(0);

    // Guard: ação de série num item de cardio é no-op.
    act(() => result.current.marcarConcluida(0, 0));
    expect(result.current.progresso.seriesConcluidas).toBe(0);
  });

  it("em ficha só de cardio pré-preenche métricas do último registro do tipo", async () => {
    const historico: RegistroTreino[] = [
      {
        id: "r1",
        fichaId: "ficha-cardio",
        data: "2026-07-01",
        iniciadoEm: "2026-07-01T08:00:00.000Z",
        finalizadoEm: "2026-07-01T08:40:00.000Z",
        exercicios: [],
        cardio: [
          { cardioId: "antigo", tipo: "Esteira", duracaoMinutos: 25, distanciaKm: 3.2, nota: "" },
        ],
      },
    ];

    const { result } = renderHook(() => useSessaoTreino(fichaSoCardio(), historico));
    await aguardarRestauracao();

    expect(result.current.itemAtual?.tipo).toBe("cardio");
    expect(result.current.configuracaoAtual).toBeUndefined();

    const esteira = result.current.itens[0];
    if (esteira.tipo !== "cardio") throw new Error("esperava cardio");
    expect(esteira.registro.duracaoMinutos).toBe(20); // valor da ficha vence
    expect(esteira.registro.distanciaKm).toBe(3.2); // ausente na ficha → último histórico

    act(() => result.current.proximo());
    expect(result.current.ultimoItem).toBe(true);
  });

  it("restaura snapshot v2 compatível com a ficha", async () => {
    memoria.set(
      STORAGE_KEYS.SESSAO_ATIVA,
      JSON.stringify({
        versao: VERSAO_SESSAO_SALVA,
        fichaId: "ficha-1",
        iniciadoEm: "2026-07-08T10:00:00.000Z",
        indiceAtual: 2,
        itens: [
          {
            tipo: "cardio",
            registro: { cardioId: "c1", tipo: "Esteira", duracaoMinutos: 22, nota: "" },
            concluido: true,
            visitado: true,
          },
          {
            tipo: "exercicio",
            exercicioId: "supino",
            series: [
              { serie: 1, repeticoes: 10, carga: 40 },
              { serie: 2, repeticoes: 8, carga: 42.5 },
            ],
            nota: "pegada fechada",
            concluidas: [0],
            visitado: true,
          },
          {
            tipo: "exercicio",
            exercicioId: "triceps",
            series: [{ serie: 1, repeticoes: 12, carga: 20 }],
            nota: "",
            concluidas: [],
            visitado: true,
          },
          {
            tipo: "cardio",
            registro: { cardioId: "c2", tipo: "Bike", duracaoMinutos: 15, nota: "" },
            concluido: false,
            visitado: false,
          },
        ],
        atualizadoEm: "2026-07-08T10:20:00.000Z",
      })
    );

    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await waitFor(() => expect(result.current.indiceAtual).toBe(2));

    expect(result.current.iniciadoEm).toBe("2026-07-08T10:00:00.000Z");
    expect(result.current.progresso.itensConcluidos).toBe(1);
    expect(result.current.progresso.seriesConcluidas).toBe(1);

    const supino = result.current.itens[1];
    if (supino.tipo !== "exercicio") throw new Error("esperava exercício");
    expect(supino.exercicio.series[1].carga).toBe(42.5);
    expect(supino.exercicio.nota).toBe("pegada fechada");
    expect(supino.exercicio.concluidas.has(0)).toBe(true);
  });

  it("descarta snapshot no formato antigo (sem versao) e limpa o storage", async () => {
    memoria.set(
      STORAGE_KEYS.SESSAO_ATIVA,
      JSON.stringify({
        fichaId: "ficha-1",
        iniciadoEm: "2026-07-08T10:00:00.000Z",
        modo: "musculacao",
        indiceAtual: 1,
        exercicios: [],
        cardio: [],
        cardioConcluido: [],
        atualizadoEm: "2026-07-08T10:20:00.000Z",
      })
    );

    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await waitFor(() => expect(memoria.has(STORAGE_KEYS.SESSAO_ATIVA)).toBe(false));

    expect(result.current.indiceAtual).toBe(0);
    expect(result.current.progresso.itensConcluidos).toBe(0);
  });

  it("descarta snapshot v2 que diverge da ficha (editada entre sessões)", async () => {
    memoria.set(
      STORAGE_KEYS.SESSAO_ATIVA,
      JSON.stringify({
        versao: VERSAO_SESSAO_SALVA,
        fichaId: "ficha-1",
        iniciadoEm: "2026-07-08T10:00:00.000Z",
        indiceAtual: 1,
        // Só 2 itens, tipos trocados — não espelha fichaMista().
        itens: [
          {
            tipo: "exercicio",
            exercicioId: "supino",
            series: [{ serie: 1, repeticoes: 10, carga: 40 }],
            nota: "",
            concluidas: [0],
            visitado: true,
          },
          {
            tipo: "cardio",
            registro: { cardioId: "c1", tipo: "Esteira", duracaoMinutos: 20, nota: "" },
            concluido: true,
            visitado: true,
          },
        ],
        atualizadoEm: "2026-07-08T10:20:00.000Z",
      })
    );

    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    expect(result.current.indiceAtual).toBe(0);
    expect(result.current.itens).toHaveLength(4);
    expect(result.current.progresso.itensConcluidos).toBe(0);
  });

  it("grava com debounce e para de gravar após encerrar", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    act(() => result.current.marcarConcluida(1, 0));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const salvo = JSON.parse(memoria.get(STORAGE_KEYS.SESSAO_ATIVA) ?? "null");
    expect(salvo?.versao).toBe(VERSAO_SESSAO_SALVA);
    expect(salvo?.itens[1].concluidas).toEqual([0]);

    await act(async () => {
      await result.current.encerrar();
    });
    expect(memoria.has(STORAGE_KEYS.SESSAO_ATIVA)).toBe(false);

    act(() => result.current.marcarConcluida(1, 1));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(memoria.has(STORAGE_KEYS.SESSAO_ATIVA)).toBe(false);
  });

  it("finaliza parcialmente: só séries concluídas e cardio marcado entram no registro", async () => {
    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    act(() => result.current.irPara(1));
    act(() => result.current.atualizarSerie(1, 0, { carga: 40 }));
    act(() => result.current.marcarConcluida(1, 0));
    act(() => result.current.marcarCardioConcluido("c1"));

    const registro = result.current.finalizar();

    expect(registro.fichaId).toBe("ficha-1");
    // Formato de saída inalterado: exercícios e cardio separados.
    expect(registro.exercicios).toHaveLength(2);
    expect(registro.exercicios[0]).toMatchObject({
      exercicioId: "supino",
      series: [{ serie: 1, repeticoes: 10, carga: 40 }],
    });
    expect(registro.exercicios[1].series).toHaveLength(0);
    expect(registro.cardio).toHaveLength(1);
    expect(registro.cardio[0].cardioId).toBe("c1");

    const resumo = result.current.resumoFinalizacao();
    expect(resumo).toMatchObject({
      itensConcluidos: 1,
      itensTotal: 4,
      seriesConcluidas: 1,
      seriesTotal: 3,
      completo: false,
    });
  });

  it("preencherDoHistorico aplica reps/carga na série do item atual", async () => {
    const { result } = renderHook(() => useSessaoTreino(fichaMista()));
    await aguardarRestauracao();

    act(() => result.current.irPara(1));
    act(() => result.current.preencherDoHistorico(1, { serie: 2, repeticoes: 8, carga: 37.5 }));

    const supino = result.current.itens[1];
    if (supino.tipo !== "exercicio") throw new Error("esperava exercício");
    expect(supino.exercicio.series[1]).toMatchObject({ repeticoes: 8, carga: 37.5 });
  });
});
