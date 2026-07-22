import {
  META_METRICA_CARDIO,
  resolverTipoCardio,
  type ChaveMetricaCardio,
  type Exercicio,
  type RegistroCardio,
  type RegistroTreino,
} from "@/domain/tipos";
import { decodificarIdGraficoCardio } from "@/interface/widget/grafico/cardioGraficoId";

export interface PontoProgressaoCompartilhavel {
  id: string;
  data: string;
  valor: number;
}

export interface ProgressaoCompartilhavel {
  id: string;
  tipo: "exercicio" | "cardio";
  nome: string;
  descricao: string;
  rotuloMetrica: string;
  unidade: string;
  pontos: PontoProgressaoCompartilhavel[];
  valorInicial: number;
  valorAtual: number;
  melhorValor: number;
  variacaoAbsoluta: number;
  variacaoPercentual: number | null;
  melhoraQuandoMenor: boolean;
}

function obterValorCardio(cardio: RegistroCardio, metrica: ChaveMetricaCardio) {
  const valor = cardio[metrica];
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

function limitarPontos(pontos: PontoProgressaoCompartilhavel[]) {
  return pontos
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-8);
}

function concluirProgressao(
  base: Omit<
    ProgressaoCompartilhavel,
    | "valorInicial"
    | "valorAtual"
    | "melhorValor"
    | "variacaoAbsoluta"
    | "variacaoPercentual"
  >,
): ProgressaoCompartilhavel | null {
  if (base.pontos.length === 0) return null;

  const valorInicial = base.pontos[0].valor;
  const valorAtual = base.pontos[base.pontos.length - 1].valor;
  const melhorValor = base.melhoraQuandoMenor
    ? Math.min(...base.pontos.map((ponto) => ponto.valor))
    : Math.max(...base.pontos.map((ponto) => ponto.valor));
  const variacaoAbsoluta = valorAtual - valorInicial;
  const variacaoPercentual = valorInicial === 0
    ? null
    : ((base.melhoraQuandoMenor ? valorInicial - valorAtual : valorAtual - valorInicial) /
        Math.abs(valorInicial)) *
      100;

  return {
    ...base,
    valorInicial,
    valorAtual,
    melhorValor,
    variacaoAbsoluta,
    variacaoPercentual,
  };
}

export function calcularProgressaoCompartilhavel(
  idGrafico: string,
  exercicios: Exercicio[],
  historico: RegistroTreino[],
): ProgressaoCompartilhavel | null {
  const graficoCardio = decodificarIdGraficoCardio(idGrafico);

  if (graficoCardio) {
    const tipoCardio = resolverTipoCardio(graficoCardio.tipo);
    const meta = META_METRICA_CARDIO[graficoCardio.metrica];
    const pontos = limitarPontos(
      historico.flatMap((registro) => {
        const valores = registro.cardio
          .filter((cardio) => cardio.tipo === graficoCardio.tipo)
          .map((cardio) => obterValorCardio(cardio, graficoCardio.metrica))
          .filter((valor): valor is number => valor !== null);

        if (valores.length === 0) return [];
        return [{
          id: registro.id,
          data: registro.iniciadoEm,
          valor: valores.reduce((total, valor) => total + valor, 0),
        }];
      }),
    );

    return concluirProgressao({
      id: idGrafico,
      tipo: "cardio",
      nome: `${tipoCardio.emoji ? `${tipoCardio.emoji} ` : ""}${tipoCardio.nome}`,
      descricao: `${meta.rotulo} por treino`,
      rotuloMetrica: meta.rotulo,
      unidade: meta.unidade,
      pontos,
      melhoraQuandoMenor: graficoCardio.metrica === "ritmo500m",
    });
  }

  const exercicio = exercicios.find((item) => item.id === idGrafico);
  const pontos = limitarPontos(
    historico.flatMap((registro) => {
      const registroExercicio = registro.exercicios.find(
        (item) => item.exercicioId === idGrafico,
      );
      if (!registroExercicio || registroExercicio.series.length === 0) return [];

      return [{
        id: registro.id,
        data: registro.iniciadoEm,
        valor: Math.max(...registroExercicio.series.map((serie) => serie.carga || 0)),
      }];
    }),
  );

  return concluirProgressao({
    id: idGrafico,
    tipo: "exercicio",
    nome: exercicio?.nome ?? "Exercício removido",
    descricao: exercicio?.grupoMuscular ?? "Histórico",
    rotuloMetrica: "Carga",
    unidade: "kg",
    pontos,
    melhoraQuandoMenor: false,
  });
}

