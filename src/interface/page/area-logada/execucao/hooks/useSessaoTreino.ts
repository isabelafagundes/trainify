import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import type {
  ChaveMetricaCardio,
  EntradaCardio,
  ExercicioFicha,
  Ficha,
  RegistroCardio,
  RegistroSerie,
  RegistroTreino,
  TipoCardio,
} from "@/domain/tipos";
import {
  carregarSessaoAtiva,
  limparSessaoAtiva,
  salvarSessaoAtiva,
  VERSAO_SESSAO_SALVA,
  type SessaoItemSalvo,
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

/** Item da sessão: espelha `ficha.itens` posição a posição — a sessão pagina
    sobre a sequência ordenada de itens (exercício OU cardio), sem "modos".
    `visitado` fica dentro de SessaoExercicio (tipo consumido pelos widgets)
    e no envelope do cardio — assimetria proposital. */
export type SessaoItem =
  | { tipo: "exercicio"; exercicio: SessaoExercicio }
  | { tipo: "cardio"; registro: RegistroCardio; concluido: boolean; visitado: boolean };

/** Status derivado por item, pros chips (mobile) e rail (md+). */
export interface StatusItem {
  indice: number;
  tipo: "exercicio" | "cardio";
  estado: "concluido" | "ativo" | "pendente";
  /** "2/4 séries" pra exercício; "Cardio · 20 min" pra cardio. */
  rotuloProgresso: string;
  exercicioId?: string;
  tipoCardio?: TipoCardio;
}

/** Contadores agregados pro header. `fracao` conta cada série de exercício e
    cada item de cardio como uma unidade — a barra anima a cada série feita. */
export interface ProgressoSessao {
  itensConcluidos: number;
  itensTotal: number;
  seriesConcluidas: number;
  seriesTotal: number;
  fracao: number;
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

function clonarItens(itens: SessaoItem[]): SessaoItem[] {
  return itens.map((item) =>
    item.tipo === "exercicio"
      ? {
          tipo: "exercicio",
          exercicio: {
            ...item.exercicio,
            series: item.exercicio.series.map((serie) => ({ ...serie })),
            concluidas: new Set(item.exercicio.concluidas),
          },
        }
      : { ...item, registro: { ...item.registro } }
  );
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

function criarItensIniciais(ficha: Ficha, historico: RegistroTreino[]): SessaoItem[] {
  return ficha.itens.map((item, indice): SessaoItem =>
    item.tipo === "exercicio"
      ? {
          tipo: "exercicio",
          exercicio: {
            exercicioId: item.exercicio.exercicioId,
            series: criarSeriesPreenchidas(item.exercicio.series, item.exercicio.repeticoes),
            nota: "",
            concluidas: new Set<number>(),
            visitado: indice === 0,
          },
        }
      : {
          tipo: "cardio",
          registro: criarRegistroCardioInicial(item.cardio, historico, ficha.id),
          concluido: false,
          visitado: indice === 0,
        }
  );
}

function exercicioConcluido(exercicio: SessaoExercicio): boolean {
  return exercicio.series.length > 0 && exercicio.concluidas.size === exercicio.series.length;
}

function itemConcluido(item: SessaoItem): boolean {
  return item.tipo === "exercicio" ? exercicioConcluido(item.exercicio) : item.concluido;
}

/** Snapshot restaurável só se espelhar a ficha atual posição a posição —
    a ficha pode ter sido editada entre as sessões. */
function snapshotCompativel(salva: SessaoTreinoSalva, ficha: Ficha): boolean {
  if (salva.fichaId !== ficha.id) return false;
  if (salva.itens.length !== ficha.itens.length) return false;
  return salva.itens.every((item, indice) => item.tipo === ficha.itens[indice]?.tipo);
}

function restaurarItens(salvos: SessaoItemSalvo[]): SessaoItem[] {
  return salvos.map((item): SessaoItem =>
    item.tipo === "exercicio"
      ? {
          tipo: "exercicio",
          exercicio: {
            exercicioId: item.exercicioId,
            series: item.series.map((serie) => ({ ...serie })),
            nota: item.nota,
            concluidas: new Set(item.concluidas),
            visitado: item.visitado,
          },
        }
      : {
          tipo: "cardio",
          registro: { ...item.registro },
          concluido: item.concluido,
          visitado: item.visitado,
        }
  );
}

export function useSessaoTreino(ficha: Ficha, historico: RegistroTreino[] = []) {
  const [iniciadoEm, setIniciadoEm] = useState(() => new Date().toISOString());
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [itens, setItens] = useState<SessaoItem[]>(() => criarItensIniciais(ficha, historico));

  // ── Persistência da sessão (recuperação após segundo plano) ──
  const prontoRef = useRef(false); // só grava após checar restauração
  const encerradaRef = useRef(false); // bloqueia gravação após finalizar/descartar
  const debounceRef = useRef<number | null>(null);

  // Restaura o treino em andamento ao montar, se houver um salvo para esta ficha.
  useEffect(() => {
    let ativo = true;
    void carregarSessaoAtiva().then((salva) => {
      if (!ativo) return;
      if (salva && !encerradaRef.current && snapshotCompativel(salva, ficha)) {
        setIniciadoEm(salva.iniciadoEm);
        setIndiceAtual(
          ficha.itens.length === 0
            ? 0
            : Math.max(0, Math.min(salva.indiceAtual, ficha.itens.length - 1))
        );
        setItens(restaurarItens(salva.itens));
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
      versao: VERSAO_SESSAO_SALVA,
      fichaId: ficha.id,
      iniciadoEm,
      indiceAtual,
      itens: itens.map((item): SessaoItemSalvo =>
        item.tipo === "exercicio"
          ? {
              tipo: "exercicio",
              exercicioId: item.exercicio.exercicioId,
              series: item.exercicio.series,
              nota: item.exercicio.nota,
              concluidas: Array.from(item.exercicio.concluidas),
              visitado: item.exercicio.visitado,
            }
          : {
              tipo: "cardio",
              registro: item.registro,
              concluido: item.concluido,
              visitado: item.visitado,
            }
      ),
      atualizadoEm: new Date().toISOString(),
    }),
    [ficha.id, iniciadoEm, indiceAtual, itens]
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

  const marcarVisitado = useCallback((indice: number) => {
    setItens((atuais) => {
      const proximos = clonarItens(atuais);
      const item = proximos[indice];
      if (!item) return atuais;
      if (item.tipo === "exercicio") item.exercicio.visitado = true;
      else item.visitado = true;
      return proximos;
    });
  }, []);

  const irPara = useCallback(
    (indice: number) => {
      const indiceSeguro = Math.max(0, Math.min(indice, itens.length - 1));
      setIndiceAtual(indiceSeguro);
      marcarVisitado(indiceSeguro);
    },
    [itens.length, marcarVisitado]
  );

  const anterior = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximo = Math.max(0, atual - 1);
      marcarVisitado(proximo);
      return proximo;
    });
  }, [marcarVisitado]);

  const proximo = useCallback(() => {
    setIndiceAtual((atual) => {
      const proximoIndice = Math.min(itens.length - 1, atual + 1);
      marcarVisitado(proximoIndice);
      return proximoIndice;
    });
  }, [itens.length, marcarVisitado]);

  /** Aplica `alteracao` ao exercício do item, se o item for de exercício. */
  const alterarExercicio = useCallback(
    (indiceItem: number, alteracao: (exercicio: SessaoExercicio) => boolean) => {
      setItens((atuais) => {
        const proximos = clonarItens(atuais);
        const item = proximos[indiceItem];
        if (!item || item.tipo !== "exercicio") return atuais;
        if (!alteracao(item.exercicio)) return atuais;
        item.exercicio.visitado = true;
        return proximos;
      });
    },
    []
  );

  const atualizarSerie = useCallback(
    (indiceItem: number, indiceSerie: number, atualizacao: AtualizacaoSerie) => {
      alterarExercicio(indiceItem, (exercicio) => {
        const serie = exercicio.series[indiceSerie];
        if (!serie) return false;
        exercicio.series[indiceSerie] = { ...serie, ...atualizacao };
        return true;
      });
    },
    [alterarExercicio]
  );

  const adicionarSerie = useCallback(
    (indiceItem: number) => {
      alterarExercicio(indiceItem, (exercicio) => {
        const ultimaSerie = exercicio.series.at(-1);
        exercicio.series.push({
          serie: exercicio.series.length + 1,
          repeticoes: ultimaSerie?.repeticoes ?? 0,
          carga: ultimaSerie?.carga ?? 0,
        });
        return true;
      });
    },
    [alterarExercicio]
  );

  const removerSerie = useCallback(
    (indiceItem: number, indiceSerie: number) => {
      alterarExercicio(indiceItem, (exercicio) => {
        if (exercicio.series.length <= 1) return false;
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
        return true;
      });
    },
    [alterarExercicio]
  );

  const marcarConcluida = useCallback(
    (indiceItem: number, indiceSerie: number) => {
      alterarExercicio(indiceItem, (exercicio) => {
        if (exercicio.concluidas.has(indiceSerie)) {
          exercicio.concluidas.delete(indiceSerie);
        } else {
          exercicio.concluidas.add(indiceSerie);
        }
        return true;
      });
    },
    [alterarExercicio]
  );

  const atualizarNota = useCallback(
    (indiceItem: number, nota: string) => {
      alterarExercicio(indiceItem, (exercicio) => {
        exercicio.nota = nota;
        return true;
      });
    },
    [alterarExercicio]
  );

  const preencherDoHistorico = useCallback(
    (indiceSerieAlvo: number, serieHistorica: RegistroSerie) => {
      atualizarSerie(indiceAtual, indiceSerieAlvo, {
        repeticoes: serieHistorica.repeticoes,
        carga: serieHistorica.carga,
      });
    },
    [atualizarSerie, indiceAtual]
  );

  const atualizarCardio = useCallback((id: string, atualizacao: AtualizacaoCardio) => {
    setItens((atuais) =>
      atuais.map((item) =>
        item.tipo === "cardio" && item.registro.cardioId === id
          ? { ...item, registro: { ...item.registro, ...atualizacao }, visitado: true }
          : item
      )
    );
  }, []);

  const marcarCardioConcluido = useCallback((id: string) => {
    setItens((atuais) =>
      atuais.map((item) =>
        item.tipo === "cardio" && item.registro.cardioId === id
          ? { ...item, concluido: !item.concluido, visitado: true }
          : item
      )
    );
  }, []);

  // ── Derivações pro header, chips e rail ──
  const { statusItens, progresso } = useMemo(() => {
    let itensConcluidos = 0;
    let seriesConcluidas = 0;
    let seriesTotal = 0;
    let unidadesConcluidas = 0;
    let unidadesTotal = 0;

    const statusItens = itens.map((item, indice): StatusItem => {
      const concluido = itemConcluido(item);
      if (concluido) itensConcluidos += 1;

      if (item.tipo === "exercicio") {
        seriesConcluidas += item.exercicio.concluidas.size;
        seriesTotal += item.exercicio.series.length;
        unidadesConcluidas += item.exercicio.concluidas.size;
        unidadesTotal += item.exercicio.series.length;
        return {
          indice,
          tipo: "exercicio",
          estado: concluido ? "concluido" : indice === indiceAtual ? "ativo" : "pendente",
          rotuloProgresso: `${item.exercicio.concluidas.size}/${item.exercicio.series.length} séries`,
          exercicioId: item.exercicio.exercicioId,
        };
      }

      unidadesConcluidas += concluido ? 1 : 0;
      unidadesTotal += 1;
      return {
        indice,
        tipo: "cardio",
        estado: concluido ? "concluido" : indice === indiceAtual ? "ativo" : "pendente",
        rotuloProgresso: `Cardio · ${item.registro.duracaoMinutos} min`,
        tipoCardio: item.registro.tipo,
      };
    });

    const progresso: ProgressoSessao = {
      itensConcluidos,
      itensTotal: itens.length,
      seriesConcluidas,
      seriesTotal,
      fracao: unidadesTotal === 0 ? 0 : unidadesConcluidas / unidadesTotal,
    };

    return { statusItens, progresso };
  }, [itens, indiceAtual]);

  const resumoFinalizacao = useCallback(() => {
    const itensConcluidos = itens.filter(itemConcluido).length;
    return {
      itensConcluidos,
      itensTotal: itens.length,
      seriesConcluidas: progresso.seriesConcluidas,
      seriesTotal: progresso.seriesTotal,
      completo: itensConcluidos === itens.length,
    };
  }, [itens, progresso]);

  // Gera o registro pro histórico no formato existente (exercícios e cardio
  // separados) — só entra o que foi concluído/marcado.
  const finalizar = useCallback((): RegistroTreino => {
    const finalizadoEm = new Date().toISOString();
    return {
      id: "",
      fichaId: ficha.id,
      data: finalizadoEm.slice(0, 10),
      iniciadoEm,
      finalizadoEm,
      exercicios: itens
        .filter((item) => item.tipo === "exercicio")
        .map((item) => ({
          exercicioId: item.exercicio.exercicioId,
          nota: item.exercicio.nota,
          series: item.exercicio.series.filter((_, indice) =>
            item.exercicio.concluidas.has(indice)
          ),
        })),
      cardio: itens
        .filter((item) => item.tipo === "cardio" && item.concluido)
        .map((item) => (item as Extract<SessaoItem, { tipo: "cardio" }>).registro),
    };
  }, [ficha.id, iniciadoEm, itens]);

  // Encerra a sessão: bloqueia novas gravações e remove o snapshot salvo.
  // Chamado ao finalizar (já persistido no histórico) ou ao descartar o treino.
  const encerrar = useCallback(async () => {
    encerradaRef.current = true;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    await limparSessaoAtiva();
  }, []);

  const cancelar = encerrar;

  const itemAtual: SessaoItem | undefined = itens[indiceAtual];
  const ultimoItem = indiceAtual === itens.length - 1;
  const itemFichaAtual = ficha.itens[indiceAtual];
  const configuracaoAtual: ExercicioFicha | undefined =
    itemFichaAtual?.tipo === "exercicio" ? itemFichaAtual.exercicio : undefined;

  return useMemo(
    () => ({
      ficha,
      iniciadoEm,
      indiceAtual,
      itens,
      itemAtual,
      configuracaoAtual,
      ultimoItem,
      statusItens,
      progresso,
      atualizarSerie,
      adicionarSerie,
      removerSerie,
      marcarConcluida,
      atualizarNota,
      irPara,
      anterior,
      proximo,
      preencherDoHistorico,
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
      indiceAtual,
      itens,
      itemAtual,
      configuracaoAtual,
      ultimoItem,
      statusItens,
      progresso,
      atualizarSerie,
      adicionarSerie,
      removerSerie,
      marcarConcluida,
      atualizarNota,
      irPara,
      anterior,
      proximo,
      preencherDoHistorico,
      atualizarCardio,
      marcarCardioConcluido,
      finalizar,
      cancelar,
      encerrar,
      resumoFinalizacao,
    ]
  );
}
