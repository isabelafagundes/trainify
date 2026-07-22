import type { Exercicio, RegistroTreino } from "@/domain/tipos";

/** Linha resumida de um exercício realizado, para a lista do resultado do treino. */
export interface ResumoExercicioTreino {
  exercicioId: string;
  nome: string;
  grupoMuscular: string;
  totalSeries: number;
  /** Maior carga registrada entre as séries (0 quando peso corporal). */
  cargaMaxima: number;
  usaCarga: boolean;
}

/** Resume os exercícios de um registro para exibição: junta os dados das séries
    (já no registro) com nome e grupo muscular (do catálogo). Ignora exercícios
    sem séries — os mesmos que não contam no resumo agregado. */
export function resumirExerciciosTreino(
  registro: RegistroTreino,
  catalogo: Exercicio[]
): ResumoExercicioTreino[] {
  return registro.exercicios
    .filter((item) => item.series.length > 0)
    .map((item) => {
      const exercicio = catalogo.find((candidato) => candidato.id === item.exercicioId);
      const cargaMaxima = item.series.reduce(
        (maior, serie) => (Number.isFinite(serie.carga) ? Math.max(maior, serie.carga) : maior),
        0
      );
      return {
        exercicioId: item.exercicioId,
        nome: exercicio?.nome ?? "Exercício",
        grupoMuscular: exercicio?.grupoMuscular ?? "",
        totalSeries: item.series.length,
        cargaMaxima,
        usaCarga: cargaMaxima > 0,
      };
    });
}

/** Grupos musculares distintos trabalhados no treino, na ordem em que
    aparecem. Base para os chips do card compartilhável. */
export function gruposMuscularesTreino(exercicios: ResumoExercicioTreino[]): string[] {
  const vistos = new Set<string>();
  const grupos: string[] = [];
  for (const item of exercicios) {
    const grupo = item.grupoMuscular.trim();
    if (grupo && !vistos.has(grupo)) {
      vistos.add(grupo);
      grupos.push(grupo);
    }
  }
  return grupos;
}
