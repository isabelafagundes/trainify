import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import type {
  ChaveMetricaCardio,
  EntradaCardio,
  Ficha,
  RegistroCardio,
  RegistroSerie,
  RegistroTreino,
} from "@/domain/tipos";
import {
  carregarSessaoAtiva,
  limparSessaoAtiva,
  salvarSessaoAtiva,
  type ModoExecucao,
  type SessaoTreinoSalva,
} from "@/application/state/sessao-ativa";

/** Intervalo de espera antes de gravar alterações (ms). */
const DEBOUNCE_SALVAR_MS = 400;

const METRICAS_CARDIO: ChaveMetricaCardio[] = [
  "duracaoMinutos",
  "distanciaKm",
  "passos",
  "niveis",
  "pulos",
  "inclinacaoPct",
  "resistencia",
  "rpm",
  "ritmo500m",
  "spm",
];

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

type AtualizacaoCardio = Partial<Pick<RegistroCardio, ChaveMetricaCardio | "nota">>;

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

function modoInicialDaFicha(ficha: Ficha): ModoExecucao {
  if (ficha.modalidade === "cardio") return "cardio";
  return "musculacao";
}

function modoPermitido(ficha: Ficha, modo: ModoExecucao): ModoExecucao {
  if (ficha.modalidade === "cardio") return "cardio";
  if (ficha.modalidade === "musculacao") return "musculacao";
  if (modo === "cardio" && ficha.cardio.length === 0) return "musculacao";
  if (modo === "musculacao" && ficha.exercicios.length === 0 && ficha.cardio.length > 0) return "cardio";
  return modo;
}

function ultimoCardioDoTipo(
  historico: RegistroTreino[],
  fichaId: string,
  tipo: string
): RegistroCardio | undefined {
  return [...historico]
    .filter((registro) => registro.fichaId === fichaId)
    .sort((a, b) => new Date(b.finalizadoEm).getTime() - new Date(a.finalizadoEm).getTime())
    .flatMap((registro) => registro.cardio)
    .find((cardio) => cardio.tipo === tipo);
}

function criarRegistroCardioInicial(
  item: EntradaCardio,
  historico: RegistroTreino[],
  fichaId: string
): RegistroCardio {
  const ultimo = ultimoCardioDoTipo(historico, fichaId, item.tipo);
  const registro: RegistroCardio = {
    cardioId: item.id,
    tipo: item.tipo,
    duracaoMinutos: item.duracaoMinutos,
    nota: item.nota,
  };

  for (const metrica of METRICAS_CARDIO) {
    const valor = item[metrica] ?? ultimo?.[metrica];
    if (valor !== undefined) {
      registro[metrica] = valor;
    }
  }

  return registro;
}

export function useSessaoTreino(ficha: Ficha, historico: RegistroTreino[] = []) {
  const [iniciadoEm, setIniciadoEm] = useState(() => new Date().toISOString());
  const [modo, setModo] = useState<ModoExecucao>(() => modoInicialDaFicha(ficha));
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
    ficha.cardio.map((item) => criarRegistroCardioInicial(item, historico, ficha.id))
  );
  const [cardioConcluido, setCardioConcluido] = useState<Set<string>>(() => new Set());

  // ── Persistência da sessão (recuperação após segundo plano) ──
  const prontoRef = useRef(false); // só grava após checar restauração
  const encerradaRef = useRef(false); // bloqueia gravação após finalizar/descartar
  const debounceRef = useRef<number | null>(null);

  // Restaura o treino em andamento ao montar, se houver um salvo para esta ficha.
  useEffect(() => {
    let ativo = true;
    void carregarSessaoAtiva().then((salva) => {
      if (!ativo) return;
      if (salva && salva.fichaId === ficha.id && !encerradaRef.current) {
        setIniciadoEm(salva.iniciadoEm);
        setModo(modoPermitido(ficha, salva.modo));
        setIndiceAtual(
          ficha.exercicios.length === 0
            ? 0
            : Math.max(0, Math.min(salva.indiceAtual, ficha.exercicios.length - 1))
        );
        setExercicios(
          salva.exercicios.map((exercicio) => ({
            exercicioId: exercicio.exercicioId,
            series: exercicio.series.map((serie) => ({ ...serie })),
            nota: exercicio.nota,
            concluidas: new Set(exercicio.concluidas),
            visitado: exercicio.visitado,
          }))
        );
        setCardio(salva.cardio.map((item) => ({ ...item })));
        setCardioConcluido(new Set(salva.cardioConcluido));
      }
      prontoRef.current = true;
    });
    return () => {
      ativo = false;
    };
  }, [ficha]);

  // Snapshot serializável do estado atual.
  const sessaoSerializada = useMemo<SessaoTreinoSalva>(
    () => ({
      fichaId: ficha.id,
      iniciadoEm,
      modo,
      indiceAtual,
      exercicios: exercicios.map((exercicio) => ({
        exercicioId: exercicio.exercicioId,
        series: exercicio.series,
        nota: exercicio.nota,
        concluidas: Array.from(exercicio.concluidas),
        visitado: exercicio.visitado,
      })),
      cardio,
      cardioConcluido: Array.from(cardioConcluido),
      atualizadoEm: new Date().toISOString(),
    }),
    [ficha.id, iniciadoEm, modo, indiceAtual, exercicios, cardio, cardioConcluido]
  );

  const serializadaRef = useRef(sessaoSerializada);

  useEffect(() => {
    serializadaRef.current = sessaoSerializada;
  }, [sessaoSerializada]);

  // Gravação imediata do último estado conhecido (usada no flush de ciclo de vida).
  const gravarAgora = useCallback(() => {
    if (!prontoRef.current || encerradaRef.current) return;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    void salvarSessaoAtiva(serializadaRef.current);
  }, []);

  // Auto-save com debounce a cada alteração da sessão.
  useEffect(() => {
    if (!prontoRef.current || encerradaRef.current) return;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void salvarSessaoAtiva(serializadaRef.current);
    }, DEBOUNCE_SALVAR_MS);
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    };
  }, [sessaoSerializada]);

  // Flush imediato quando o app vai para segundo plano / é fechado.
  useEffect(() => {
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") gravarAgora();
    };
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", gravarAgora);

    let removerPause: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      const registro = CapacitorApp.addListener("pause", gravarAgora);
      removerPause = () => void registro.then((listener) => listener.remove());
    }

    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", gravarAgora);
      removerPause?.();
    };
  }, [gravarAgora]);

  const temCardio = cardio.length > 0;
  const temMusculacao = exercicios.length > 0;
  const podeAlternarModo = ficha.modalidade === "ambos" && temMusculacao && temCardio;

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
      if (ficha.modalidade !== "cardio") setModo("musculacao");
    },
    [ficha.exercicios.length, ficha.modalidade, marcarVisitado]
  );

  const anterior = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximo = Math.max(0, atual - 1);
      marcarVisitado(proximo);
      return proximo;
    });
    if (ficha.modalidade !== "cardio") setModo("musculacao");
  }, [ficha.modalidade, marcarVisitado]);

  const proximo = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximoIndice = Math.min(ficha.exercicios.length - 1, atual + 1);
      marcarVisitado(proximoIndice);
      return proximoIndice;
    });
    if (ficha.modalidade !== "cardio") setModo("musculacao");
  }, [ficha.exercicios.length, ficha.modalidade, marcarVisitado]);

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
    if (!podeAlternarModo) return;
    setModo((atual) => (atual === "musculacao" ? "cardio" : "musculacao"));
  }, [podeAlternarModo]);

  const atualizarCardio = useCallback(
    (id: string, atualizacao: AtualizacaoCardio) => {
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

  // Encerra a sessão: bloqueia novas gravações e remove o snapshot salvo.
  // Chamado ao finalizar (já persistido no histórico) ou ao descartar o treino.
  const encerrar = useCallback(async () => {
    encerradaRef.current = true;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    await limparSessaoAtiva();
  }, []);

  const cancelar = encerrar;

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
      temMusculacao,
      podeAlternarModo,
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
      encerrar,
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
      temMusculacao,
      podeAlternarModo,
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
      encerrar,
      resumoFinalizacao,
    ]
  );
}
