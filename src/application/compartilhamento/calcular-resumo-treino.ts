import type { RegistroTreino } from "@/domain/tipos";

export const TETO_DURACAO_COMPARTILHAMENTO_SEGUNDOS = 4 * 60 * 60;

export interface ResumoCompartilhamento {
  duracaoSegundos: number;
  totalExercicios: number;
  totalSeries: number;
  /** Volume total de carga movida: Σ (repetições × carga) das séries registradas. */
  volumeTotalKg: number;
  totalCardios: number;
  duracaoCardioMinutos: number;
  distanciaCardioKm?: number;
}

export function calcularResumoTreino(registro: RegistroTreino): ResumoCompartilhamento {
  const inicio = Date.parse(registro.iniciadoEm);
  const fim = Date.parse(registro.finalizadoEm);
  const duracaoCalculada = Math.floor((fim - inicio) / 1000);
  const duracaoSegundos = Number.isFinite(duracaoCalculada) && duracaoCalculada > 0 &&
    duracaoCalculada <= TETO_DURACAO_COMPARTILHAMENTO_SEGUNDOS ? duracaoCalculada : 0;
  const exercicios = registro.exercicios.filter((item) => item.series.length > 0);
  const distancia = registro.cardio.reduce((total, item) =>
    total + (Number.isFinite(item.distanciaKm) ? Math.max(0, item.distanciaKm ?? 0) : 0), 0);

  return {
    duracaoSegundos,
    totalExercicios: exercicios.length,
    totalSeries: exercicios.reduce((total, item) => total + item.series.length, 0),
    volumeTotalKg: Math.round(exercicios.reduce((total, item) =>
      total + item.series.reduce((soma, serie) =>
        soma + Math.max(0, serie.repeticoes) * Math.max(0, serie.carga), 0), 0)),
    totalCardios: registro.cardio.length,
    duracaoCardioMinutos: registro.cardio.reduce((total, item) =>
      total + (Number.isFinite(item.duracaoMinutos) ? Math.max(0, item.duracaoMinutos) : 0), 0),
    ...(distancia > 0 ? { distanciaCardioKm: distancia } : {}),
  };
}
