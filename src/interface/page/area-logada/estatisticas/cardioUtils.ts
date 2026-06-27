import type {
  ChaveMetricaCardio,
  RegistroCardio,
  RegistroTreino,
} from "@/domain/tipos";
import { META_METRICA_CARDIO, resolverTipoCardio } from "@/domain/tipos";
import { criarIdGraficoCardio } from "@/interface/widget/grafico/cardioGraficoId";

export interface ResumoCardio {
  totalSessoes: number;
  totalMinutos: number;
  totalKm: number;
}

export interface ProgressaoCardio {
  idGrafico: string;
  tipo: string;
  nome: string;
  emoji?: string;
  metrica: ChaveMetricaCardio;
  rotuloMetrica: string;
  totalSessoes: number;
  ultimaData: string;
  ultimoValor: number;
  melhorValor: number;
}

const PRIORIDADE_METRICAS_CARDIO: ChaveMetricaCardio[] = [
  "distanciaKm",
  "duracaoMinutos",
  "niveis",
  "pulos",
  "passos",
  "ritmo500m",
  "resistencia",
  "rpm",
  "spm",
  "inclinacaoPct",
];

function obterValorCardio(cardio: RegistroCardio, metrica: ChaveMetricaCardio): number | null {
  const valor = cardio[metrica];
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0 ? valor : null;
}

function escolherMetricaCardio(cardio: RegistroCardio): ChaveMetricaCardio | null {
  return PRIORIDADE_METRICAS_CARDIO.find((metrica) => obterValorCardio(cardio, metrica) !== null) ?? null;
}

function melhorValorCardio(metrica: ChaveMetricaCardio, atual: number, proximo: number) {
  return metrica === "ritmo500m" ? Math.min(atual, proximo) : Math.max(atual, proximo);
}

export function calcularResumoCardio(historico: RegistroTreino[]): ResumoCardio {
  return historico.reduce<ResumoCardio>(
    (resumo, registro) => {
      for (const cardio of registro.cardio) {
        resumo.totalSessoes += 1;
        resumo.totalMinutos += cardio.duracaoMinutos || 0;
        resumo.totalKm += cardio.distanciaKm || 0;
      }
      return resumo;
    },
    { totalSessoes: 0, totalMinutos: 0, totalKm: 0 }
  );
}

export function agregarProgressaoPorCardio(historico: RegistroTreino[]): ProgressaoCardio[] {
  const mapa = new Map<string, ProgressaoCardio>();
  const ordenado = [...historico].sort(
    (a, b) => new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime()
  );

  for (const registro of ordenado) {
    for (const cardio of registro.cardio) {
      const metrica = escolherMetricaCardio(cardio);
      if (!metrica) continue;

      const valor = obterValorCardio(cardio, metrica);
      if (valor === null) continue;

      const tipo = resolverTipoCardio(cardio.tipo);
      const chave = `${cardio.tipo}__${metrica}`;
      const existente = mapa.get(chave);

      if (existente) {
        existente.totalSessoes += 1;
        existente.melhorValor = melhorValorCardio(metrica, existente.melhorValor, valor);
      } else {
        mapa.set(chave, {
          idGrafico: criarIdGraficoCardio(cardio.tipo, metrica),
          tipo: cardio.tipo,
          nome: tipo.nome,
          emoji: tipo.emoji,
          metrica,
          rotuloMetrica: META_METRICA_CARDIO[metrica].rotulo,
          totalSessoes: 1,
          ultimaData: registro.iniciadoEm,
          ultimoValor: valor,
          melhorValor: valor,
        });
      }
    }
  }

  return Array.from(mapa.values()).sort(
    (a, b) => new Date(b.ultimaData).getTime() - new Date(a.ultimaData).getTime()
  );
}
