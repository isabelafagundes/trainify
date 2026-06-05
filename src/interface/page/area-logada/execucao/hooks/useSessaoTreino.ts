import { useCallback, useMemo, useState } from "react";
import type {
  Ficha,
  RegistroCardio,
  RegistroSerie,
  RegistroTreino,
} from "@/domain/tipos";

type ModoExecucao = "musculacao" | "cardio";

export interface SessaoExercicio {
  exercicioId: string;
  series: RegistroSerie[];
  nota: string;
  concluidas: Set<number>;
  visitado: boolean;
}

interface AtualizacaoSerie {
  repeticoes?: number;
  carga?: number;
}

function criarSeriesPreenchidas(total: number, repeticoes: number): RegistroSerie[] {
  return Array.from({ length: total }, (_, indice) => ({
    serie: indice + 1,
    repeticoes,
    carga: 0,
  }));
}

function clonarExercicios(exercicios: SessaoExercicio[]): SessaoExercicio[] {
  return exercicios.map((exercicio) => ({
    ...exercicio,
    series: exercicio.series.map((serie) => ({ ...serie })),
    concluidas: new Set(exercicio.concluidas),
  }));
}

export function useSessaoTreino(ficha: Ficha) {
  const [iniciadoEm] = useState(() => new Date().toISOString());
  const [modo, setModo] = useState<ModoExecucao>("musculacao");
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [exercicios, setExercicios] = useState<SessaoExercicio[]>(() =>
    ficha.exercicios.map((exercicio, indice) => ({
      exercicioId: exercicio.exercicioId,
      series: criarSeriesPreenchidas(exercicio.series, exercicio.repeticoes),
      nota: "",
      concluidas: new Set<number>(),
      visitado: indice === 0,
    }))
  );
  const [cardio, setCardio] = useState<RegistroCardio[]>(() =>
    ficha.cardio.map((item) => ({
      cardioId: item.id,
      tipo: item.tipo,
      duracaoMinutos: item.duracaoMinutos,
      nota: item.nota,
    }))
  );
  const [cardioConcluido, setCardioConcluido] = useState<Set<string>>(() => new Set());

  const temCardio = cardio.length > 0;

  const marcarVisitado = useCallback((indice: number) => {
    setExercicios((atuais) => {
      const proximos = clonarExercicios(atuais);
      if (proximos[indice]) proximos[indice].visitado = true;
      return proximos;
    });
  }, []);

  const irPara = useCallback(
    (indice: number) => {
      const indiceSeguro = Math.max(0, Math.min(indice, ficha.exercicios.length - 1));
      setIndiceAtual(indiceSeguro);
      marcarVisitado(indiceSeguro);
      setModo("musculacao");
    },
    [ficha.exercicios.length, marcarVisitado]
  );

  const anterior = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximo = Math.max(0, atual - 1);
      marcarVisitado(proximo);
      return proximo;
    });
    setModo("musculacao");
  }, [marcarVisitado]);

  const proximo = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximoIndice = Math.min(ficha.exercicios.length - 1, atual + 1);
      marcarVisitado(proximoIndice);
      return proximoIndice;
    });
    setModo("musculacao");
  }, [ficha.exercicios.length, marcarVisitado]);

  const atualizarSerie = useCallback(
    (indiceExercicio: number, indiceSerie: number, atualizacao: AtualizacaoSerie) => {
      setExercicios((atuais) => {
        const proximos = clonarExercicios(atuais);
        const serie = proximos[indiceExercicio]?.series[indiceSerie];
        if (!serie) return atuais;
        proximos[indiceExercicio].visitado = true;
        proximos[indiceExercicio].series[indiceSerie] = { ...serie, ...atualizacao };
        return proximos;
      });
    },
    []
  );

  const adicionarSerie = useCallback((indiceExercicio: number) => {
    setExercicios((atuais) => {
      const proximos = clonarExercicios(atuais);
      const exercicio = proximos[indiceExercicio];
      if (!exercicio) return atuais;
      const ultimaSerie = exercicio.series.at(-1);
      exercicio.series.push({
        serie: exercicio.series.length + 1,
        repeticoes: ultimaSerie?.repeticoes ?? 0,
        carga: ultimaSerie?.carga ?? 0,
      });
      exercicio.visitado = true;
      return proximos;
    });
  }, []);

  const removerSerie = useCallback((indiceExercicio: number, indiceSerie: number) => {
    setExercicios((atuais) => {
      const proximos = clonarExercicios(atuais);
      const exercicio = proximos[indiceExercicio];
      if (!exercicio || exercicio.series.length <= 1) return atuais;
      exercicio.series.splice(indiceSerie, 1);
      exercicio.series = exercicio.series.map((serie, indice) => ({
        ...serie,
        serie: indice + 1,
      }));
      exercicio.concluidas = new Set(
        Array.from(exercicio.concluidas)
          .filter((indice) => indice !== indiceSerie)
          .map((indice) => (indice > indiceSerie ? indice - 1 : indice))
      );
      exercicio.visitado = true;
      return proximos;
    });
  }, []);

  const marcarConcluida = useCallback((indiceExercicio: number, indiceSerie: number) => {
    setExercicios((atuais) => {
      const proximos = clonarExercicios(atuais);
      const exercicio = proximos[indiceExercicio];
      if (!exercicio) return atuais;
      if (exercicio.concluidas.has(indiceSerie)) {
        exercicio.concluidas.delete(indiceSerie);
      } else {
        exercicio.concluidas.add(indiceSerie);
      }
      exercicio.visitado = true;
      return proximos;
    });
  }, []);

  const atualizarNota = useCallback((indiceExercicio: number, nota: string) => {
    setExercicios((atuais) => {
      const proximos = clonarExercicios(atuais);
      if (!proximos[indiceExercicio]) return atuais;
      proximos[indiceExercicio].nota = nota;
      proximos[indiceExercicio].visitado = true;
      return proximos;
    });
  }, []);

  const preencherDoHistorico = useCallback(
    (indiceSerieAlvo: number, serieHistorica: RegistroSerie) => {
      atualizarSerie(indiceAtual, indiceSerieAlvo, {
        repeticoes: serieHistorica.repeticoes,
        carga: serieHistorica.carga,
      });
    },
    [atualizarSerie, indiceAtual]
  );

  const alternarModo = useCallback(() => {
    if (!temCardio) return;
    setModo((atual) => (atual === "musculacao" ? "cardio" : "musculacao"));
  }, [temCardio]);

  const atualizarCardio = useCallback(
    (id: string, atualizacao: Partial<Pick<RegistroCardio, "duracaoMinutos" | "nota">>) => {
      setCardio((atuais) =>
        atuais.map((item) => (item.cardioId === id ? { ...item, ...atualizacao } : item))
      );
    },
    []
  );

  const marcarCardioConcluido = useCallback((id: string) => {
    setCardioConcluido((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }, []);

  const resumoFinalizacao = useCallback(() => {
    const exerciciosConcluidos = exercicios.filter(
      (exercicio) => exercicio.concluidas.size === exercicio.series.length
    ).length;
    const cardioPreenchido = cardio.filter((item) =>
      cardioConcluido.has(item.cardioId)
    ).length;

    return {
      exerciciosConcluidos,
      exerciciosTotal: exercicios.length,
      cardioPreenchido,
      cardioTotal: cardio.length,
      completo:
        exerciciosConcluidos === exercicios.length &&
        cardioPreenchido === cardio.length,
    };
  }, [cardio, cardioConcluido, exercicios]);

  const finalizar = useCallback((): RegistroTreino => {
    const finalizadoEm = new Date().toISOString();
    return {
      id: "",
      fichaId: ficha.id,
      data: finalizadoEm.slice(0, 10),
      iniciadoEm,
      finalizadoEm,
      exercicios: exercicios.map((exercicio) => ({
        exercicioId: exercicio.exercicioId,
        nota: exercicio.nota,
        series: exercicio.series.filter((_, indice) => exercicio.concluidas.has(indice)),
      })),
      cardio: cardio.filter((item) => cardioConcluido.has(item.cardioId)),
    };
  }, [cardio, cardioConcluido, exercicios, ficha.id, iniciadoEm]);

  const cancelar = useCallback(() => undefined, []);

  const exercicioAtual = exercicios[indiceAtual];
  const configuracaoAtual = ficha.exercicios[indiceAtual];
  const ultimoExercicio = indiceAtual === ficha.exercicios.length - 1;

  return useMemo(
    () => ({
      ficha,
      iniciadoEm,
      modo,
      indiceAtual,
      exercicios,
      exercicioAtual,
      configuracaoAtual,
      cardio,
      cardioConcluido,
      temCardio,
      ultimoExercicio,
      atualizarSerie,
      adicionarSerie,
      removerSerie,
      marcarConcluida,
      atualizarNota,
      irPara,
      anterior,
      proximo,
      preencherDoHistorico,
      alternarModo,
      atualizarCardio,
      marcarCardioConcluido,
      finalizar,
      cancelar,
      resumoFinalizacao,
    }),
    [
      ficha,
      iniciadoEm,
      modo,
      indiceAtual,
      exercicios,
      exercicioAtual,
      configuracaoAtual,
      cardio,
      cardioConcluido,
      temCardio,
      ultimoExercicio,
      atualizarSerie,
      adicionarSerie,
      removerSerie,
      marcarConcluida,
      atualizarNota,
      irPara,
      anterior,
      proximo,
      preencherDoHistorico,
      alternarModo,
      atualizarCardio,
      marcarCardioConcluido,
      finalizar,
      cancelar,
      resumoFinalizacao,
    ]
  );
}
