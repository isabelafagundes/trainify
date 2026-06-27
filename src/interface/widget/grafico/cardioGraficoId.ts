import type { ChaveMetricaCardio } from "@/domain/tipos";

const PREFIXO_GRAFICO_CARDIO = "cardio__";

export function criarIdGraficoCardio(tipo: string, metrica: ChaveMetricaCardio): string {
  return `${PREFIXO_GRAFICO_CARDIO}${encodeURIComponent(tipo)}__${metrica}`;
}

export function decodificarIdGraficoCardio(
  id: string
): { tipo: string; metrica: ChaveMetricaCardio } | null {
  if (!id.startsWith(PREFIXO_GRAFICO_CARDIO)) return null;

  const [tipoCodificado, metrica] = id.slice(PREFIXO_GRAFICO_CARDIO.length).split("__");
  if (!tipoCodificado || !metrica) return null;

  let tipo = tipoCodificado;
  try {
    tipo = decodeURIComponent(tipoCodificado);
  } catch {
    tipo = tipoCodificado;
  }

  return {
    tipo,
    metrica: metrica as ChaveMetricaCardio,
  };
}
