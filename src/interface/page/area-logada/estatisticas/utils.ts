import type {
  DadosFrequencia,
  Exercicio,
  RegistroAtividadeDiaria,
  RegistroTreino,
} from "@/domain/tipos";

/** Retorna a data ISO (YYYY-MM-DD) a partir de um Date local */
function toISODate(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** Conta treinos realizados no mês de referência (mês corrente por padrão) */
export function calcularTreinosNoMes(
  historico: RegistroTreino[],
  referencia: Date = new Date(),
): number {
  const mes = referencia.getMonth();
  const ano = referencia.getFullYear();
  return historico.filter((r) => {
    const data = new Date(r.iniciadoEm);
    return data.getMonth() === mes && data.getFullYear() === ano;
  }).length;
}

/** Conta dias consecutivos com treino terminando em hoje (ou ontem, se ainda não treinou hoje) */
export function calcularStreakAtual(
  historico: RegistroTreino[],
  hoje: Date = new Date(),
): number {
  const diasComTreino = new Set<string>();
  for (const reg of historico) {
    diasComTreino.add(toISODate(new Date(reg.iniciadoEm)));
  }

  let streak = 0;
  const cursor = new Date(hoje);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const iso = toISODate(cursor);
    if (diasComTreino.has(iso)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Maior streak já atingido no histórico */
export function calcularRecordeStreak(historico: RegistroTreino[]): number {
  const dias = Array.from(
    new Set(historico.map((r) => toISODate(new Date(r.iniciadoEm)))),
  ).sort();

  if (dias.length === 0) return 0;

  let max = 1;
  let atual = 1;
  for (let i = 1; i < dias.length; i++) {
    const anterior = new Date(dias[i - 1] + "T00:00:00");
    const corrente = new Date(dias[i] + "T00:00:00");
    const diffDias = Math.round(
      (corrente.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDias === 1) {
      atual++;
      max = Math.max(max, atual);
    } else {
      atual = 1;
    }
  }
  return max;
}

/** Constrói DadosFrequencia para uma janela de N dias terminando em hoje */
export function construirDadosFrequencia(
  historico: RegistroTreino[],
  diasJanela: number = 365,
  hoje: Date = new Date(),
): DadosFrequencia {
  const fichasPorDia = new Map<string, string[]>();
  for (const reg of historico) {
    const iso = toISODate(new Date(reg.iniciadoEm));
    const lista = fichasPorDia.get(iso) ?? [];
    lista.push(reg.fichaId);
    fichasPorDia.set(iso, lista);
  }

  const dataFim = new Date(hoje);
  dataFim.setHours(0, 0, 0, 0);
  const dataInicio = new Date(dataFim);
  dataInicio.setDate(dataFim.getDate() - (diasJanela - 1));

  const registros: RegistroAtividadeDiaria[] = [];
  const cursor = new Date(dataInicio);
  while (cursor <= dataFim) {
    const iso = toISODate(cursor);
    const fichas = fichasPorDia.get(iso);
    registros.push({
      data: iso,
      completou: !!fichas && fichas.length > 0,
      fichasCompletas: fichas,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    registros,
    dataInicio: toISODate(dataInicio),
    dataFim: toISODate(dataFim),
  };
}

export interface ProgressaoExercicio {
  exercicioId: string;
  nome: string;
  grupoMuscular: string;
  totalSessoes: number;
  ultimaData: string;
  cargaMaxima: number; /** maior carga já registrada */
  ultimaCarga: number; /** maior carga da sessão mais recente */
  usaCarga: boolean;
}

/** Agrega progressão por exercício a partir do histórico — ordenado por mais recente */
export function agregarProgressaoPorExercicio(
  historico: RegistroTreino[],
  exercicios: Exercicio[],
): ProgressaoExercicio[] {
  const catalogo = new Map(exercicios.map((e) => [e.id, e]));
  const mapa = new Map<string, ProgressaoExercicio>();

  const ordenado = [...historico].sort(
    (a, b) =>
      new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime(),
  );

  for (const reg of ordenado) {
    for (const exReg of reg.exercicios) {
      const exercicio = catalogo.get(exReg.exercicioId);
      if (!exercicio) continue;

      const cargasNaSessao = exReg.series.map((s) => s.carga ?? 0);
      const cargaMaxSessao = cargasNaSessao.length
        ? Math.max(...cargasNaSessao)
        : 0;
      const usaCarga = cargasNaSessao.some((c) => c > 0);

      const existente = mapa.get(exReg.exercicioId);
      if (existente) {
        existente.totalSessoes += 1;
        existente.cargaMaxima = Math.max(existente.cargaMaxima, cargaMaxSessao);
        existente.usaCarga = existente.usaCarga || usaCarga;
      } else {
        mapa.set(exReg.exercicioId, {
          exercicioId: exReg.exercicioId,
          nome: exercicio.nome,
          grupoMuscular: exercicio.grupoMuscular,
          totalSessoes: 1,
          ultimaData: reg.iniciadoEm,
          cargaMaxima: cargaMaxSessao,
          ultimaCarga: cargaMaxSessao,
          usaCarga,
        });
      }
    }
  }

  return Array.from(mapa.values()).sort(
    (a, b) => new Date(b.ultimaData).getTime() - new Date(a.ultimaData).getTime(),
  );
}
