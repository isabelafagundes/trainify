import type { Ficha, Programa, RegistroTreino, DadosFrequencia, RegistroAtividadeDiaria } from "@/domain/tipos";

export const fichasFicticias: Ficha[] = [
  {
    id: "ficha-01",
    nome: "Treino A",
    descricao: "Peito, tríceps e ombros",
    icone: "braco",
    emoji: "💪",
    exercicios: [
      { exercicioId: "ex-01", series: 4, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-02", series: 3, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-03", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-04", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-20", series: 3, repeticoes: 12, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-12", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 45 },
    ],
    cardio: [
      { id: "cardio-01", tipo: "Esteira", duracaoMinutos: 15, nota: "Aquecimento" },
    ],
  },
  {
    id: "ficha-02",
    nome: "Treino B",
    descricao: "Pernas e glúteos",
    icone: "raio",
    emoji: "🦵",
    exercicios: [
      { exercicioId: "ex-24", series: 4, repeticoes: 10, usaCarga: true, descansoSegundos: 90 },
      { exercicioId: "ex-25", series: 4, repeticoes: 12, usaCarga: true, descansoSegundos: 90 },
      { exercicioId: "ex-26", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-27", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-31", series: 4, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
    ],
    cardio: [],
  },
  {
    id: "ficha-03",
    nome: "Treino C",
    descricao: "Costas e bíceps",
    icone: "montanha",
    emoji: "🏋️",
    exercicios: [
      { exercicioId: "ex-06", series: 4, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-07", series: 4, repeticoes: 10, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-08", series: 3, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-16", series: 3, repeticoes: 12, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-18", series: 3, repeticoes: 12, usaCarga: true, descansoSegundos: 45 },
    ],
    cardio: [],
  },
  {
    id: "ficha-04",
    nome: "Treino D",
    descricao: "Ombros e trapézio",
    icone: "fogo",
    emoji: "🎯",
    exercicios: [
      { exercicioId: "ex-11", series: 4, repeticoes: 10, usaCarga: true, descansoSegundos: 60 },
      { exercicioId: "ex-12", series: 4, repeticoes: 15, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-14", series: 3, repeticoes: 15, usaCarga: true, descansoSegundos: 45 },
      { exercicioId: "ex-15", series: 4, repeticoes: 12, usaCarga: true, descansoSegundos: 60 },
    ],
    cardio: [
      { id: "cardio-02", tipo: "Bike", duracaoMinutos: 20, nota: "Zona 2" },
    ],
  },
];

export const programasFicticios: Programa[] = [
  {
    id: "prog-01",
    nome: "Rotina Janeiro",
    descricao: "Rotina de volume, 4x semana",
    fichaIds: ["ficha-01", "ficha-02", "ficha-03", "ficha-04"],
    ativo: true,
  },
  {
    id: "prog-02",
    nome: "Cutting Março",
    descricao: "Definição, 3x semana",
    fichaIds: ["ficha-01", "ficha-03"],
    ativo: false,
  },
];

export const historicoFicticio: RegistroTreino[] = [
  {
    id: "log-01",
    fichaId: "ficha-01",
    data: "2026-04-05",
    iniciadoEm: "2026-04-05T14:30:00",
    finalizadoEm: "2026-04-05T15:45:00",
    exercicios: [
      { exercicioId: "ex-01", series: [{ serie: 1, repeticoes: 12, carga: 40 }, { serie: 2, repeticoes: 12, carga: 40 }, { serie: 3, repeticoes: 10, carga: 42.5 }, { serie: 4, repeticoes: 8, carga: 45 }], nota: "Aumentar carga próxima" },
      { exercicioId: "ex-02", series: [{ serie: 1, repeticoes: 12, carga: 30 }, { serie: 2, repeticoes: 12, carga: 30 }, { serie: 3, repeticoes: 10, carga: 32 }], nota: "" },
      { exercicioId: "ex-03", series: [{ serie: 1, repeticoes: 15, carga: 14 }, { serie: 2, repeticoes: 15, carga: 14 }, { serie: 3, repeticoes: 12, carga: 16 }], nota: "" },
      { exercicioId: "ex-04", series: [{ serie: 1, repeticoes: 15, carga: 10 }, { serie: 2, repeticoes: 15, carga: 10 }, { serie: 3, repeticoes: 12, carga: 12 }], nota: "" },
      { exercicioId: "ex-20", series: [{ serie: 1, repeticoes: 12, carga: 25 }, { serie: 2, repeticoes: 12, carga: 25 }, { serie: 3, repeticoes: 10, carga: 27.5 }], nota: "" },
      { exercicioId: "ex-12", series: [{ serie: 1, repeticoes: 15, carga: 8 }, { serie: 2, repeticoes: 15, carga: 8 }, { serie: 3, repeticoes: 12, carga: 10 }], nota: "" },
    ],
    cardio: [{ cardioId: "cardio-01", tipo: "Esteira", duracaoMinutos: 15, nota: "6 km/h" }],
  },
  {
    id: "log-02",
    fichaId: "ficha-02",
    data: "2026-04-03",
    iniciadoEm: "2026-04-03T10:15:00",
    finalizadoEm: "2026-04-03T11:30:00",
    exercicios: [
      { exercicioId: "ex-24", series: [{ serie: 1, repeticoes: 10, carga: 60 }, { serie: 2, repeticoes: 10, carga: 60 }, { serie: 3, repeticoes: 8, carga: 70 }, { serie: 4, repeticoes: 8, carga: 70 }], nota: "" },
      { exercicioId: "ex-25", series: [{ serie: 1, repeticoes: 12, carga: 120 }, { serie: 2, repeticoes: 12, carga: 120 }, { serie: 3, repeticoes: 10, carga: 140 }, { serie: 4, repeticoes: 10, carga: 140 }], nota: "" },
      { exercicioId: "ex-26", series: [{ serie: 1, repeticoes: 15, carga: 40 }, { serie: 2, repeticoes: 15, carga: 40 }, { serie: 3, repeticoes: 12, carga: 45 }], nota: "" },
      { exercicioId: "ex-27", series: [{ serie: 1, repeticoes: 15, carga: 35 }, { serie: 2, repeticoes: 15, carga: 35 }, { serie: 3, repeticoes: 12, carga: 40 }], nota: "" },
      { exercicioId: "ex-31", series: [{ serie: 1, repeticoes: 12, carga: 50 }, { serie: 2, repeticoes: 12, carga: 50 }, { serie: 3, repeticoes: 10, carga: 60 }, { serie: 4, repeticoes: 10, carga: 60 }], nota: "Foco na contração" },
    ],
    cardio: [],
  },
  {
    id: "log-03",
    fichaId: "ficha-01",
    data: "2026-04-01",
    iniciadoEm: "2026-04-01T15:00:00",
    finalizadoEm: "2026-04-01T16:10:00",
    exercicios: [
      { exercicioId: "ex-01", series: [{ serie: 1, repeticoes: 12, carga: 37.5 }, { serie: 2, repeticoes: 12, carga: 37.5 }, { serie: 3, repeticoes: 12, carga: 40 }, { serie: 4, repeticoes: 10, carga: 40 }], nota: "" },
      { exercicioId: "ex-02", series: [{ serie: 1, repeticoes: 12, carga: 28 }, { serie: 2, repeticoes: 12, carga: 28 }, { serie: 3, repeticoes: 10, carga: 30 }], nota: "" },
      { exercicioId: "ex-03", series: [{ serie: 1, repeticoes: 15, carga: 12 }, { serie: 2, repeticoes: 15, carga: 12 }, { serie: 3, repeticoes: 15, carga: 14 }], nota: "" },
      { exercicioId: "ex-04", series: [{ serie: 1, repeticoes: 15, carga: 10 }, { serie: 2, repeticoes: 15, carga: 10 }, { serie: 3, repeticoes: 15, carga: 10 }], nota: "" },
      { exercicioId: "ex-20", series: [{ serie: 1, repeticoes: 12, carga: 22.5 }, { serie: 2, repeticoes: 12, carga: 22.5 }, { serie: 3, repeticoes: 12, carga: 25 }], nota: "" },
      { exercicioId: "ex-12", series: [{ serie: 1, repeticoes: 15, carga: 8 }, { serie: 2, repeticoes: 15, carga: 8 }, { serie: 3, repeticoes: 15, carga: 8 }], nota: "" },
    ],
    cardio: [{ cardioId: "cardio-01", tipo: "Esteira", duracaoMinutos: 15, nota: "6 km/h" }],
  },
  {
    id: "log-04",
    fichaId: "ficha-03",
    data: "2026-03-30",
    iniciadoEm: "2026-03-30T11:30:00",
    finalizadoEm: "2026-03-30T12:40:00",
    exercicios: [
      { exercicioId: "ex-06", series: [{ serie: 1, repeticoes: 12, carga: 50 }, { serie: 2, repeticoes: 12, carga: 50 }, { serie: 3, repeticoes: 10, carga: 55 }, { serie: 4, repeticoes: 10, carga: 55 }], nota: "" },
      { exercicioId: "ex-07", series: [{ serie: 1, repeticoes: 10, carga: 40 }, { serie: 2, repeticoes: 10, carga: 40 }, { serie: 3, repeticoes: 10, carga: 45 }, { serie: 4, repeticoes: 8, carga: 45 }], nota: "" },
      { exercicioId: "ex-08", series: [{ serie: 1, repeticoes: 12, carga: 45 }, { serie: 2, repeticoes: 12, carga: 45 }, { serie: 3, repeticoes: 10, carga: 50 }], nota: "" },
      { exercicioId: "ex-16", series: [{ serie: 1, repeticoes: 12, carga: 12 }, { serie: 2, repeticoes: 12, carga: 12 }, { serie: 3, repeticoes: 10, carga: 14 }], nota: "" },
      { exercicioId: "ex-18", series: [{ serie: 1, repeticoes: 12, carga: 10 }, { serie: 2, repeticoes: 12, carga: 10 }, { serie: 3, repeticoes: 10, carga: 12 }], nota: "" },
    ],
    cardio: [],
  },
  {
    id: "log-05",
    fichaId: "ficha-04",
    data: "2026-03-28",
    iniciadoEm: "2026-03-28T09:45:00",
    finalizadoEm: "2026-03-28T10:50:00",
    exercicios: [
      { exercicioId: "ex-11", series: [{ serie: 1, repeticoes: 10, carga: 20 }, { serie: 2, repeticoes: 10, carga: 20 }, { serie: 3, repeticoes: 8, carga: 22 }, { serie: 4, repeticoes: 8, carga: 22 }], nota: "" },
      { exercicioId: "ex-12", series: [{ serie: 1, repeticoes: 15, carga: 8 }, { serie: 2, repeticoes: 15, carga: 8 }, { serie: 3, repeticoes: 15, carga: 8 }, { serie: 4, repeticoes: 12, carga: 10 }], nota: "" },
      { exercicioId: "ex-14", series: [{ serie: 1, repeticoes: 15, carga: 15 }, { serie: 2, repeticoes: 15, carga: 15 }, { serie: 3, repeticoes: 12, carga: 17.5 }], nota: "" },
      { exercicioId: "ex-15", series: [{ serie: 1, repeticoes: 12, carga: 24 }, { serie: 2, repeticoes: 12, carga: 24 }, { serie: 3, repeticoes: 12, carga: 28 }, { serie: 4, repeticoes: 10, carga: 28 }], nota: "Subiu carga" },
    ],
    cardio: [{ cardioId: "cardio-02", tipo: "Bike", duracaoMinutos: 20, nota: "Zona 2" }],
  },
];

const dadosFrequencia: DadosFrequencia = (() => {
  const dias = 365;
  const dataFim = new Date();
  const dataInicio = new Date();
  dataInicio.setDate(dataFim.getDate() - dias + 1);

  const treinosPorData = new Map<string, string[]>();
  for (let i = 0; i < historicoFicticio.length; i++) {
    const treino = historicoFicticio[i];
    if (!treinosPorData.has(treino.data)) {
      treinosPorData.set(treino.data, []);
    }
    treinosPorData.get(treino.data)?.push(treino.fichaId);
  }

  const registros: RegistroAtividadeDiaria[] = [];
  const dataAtual = new Date(dataInicio);

  while (dataAtual <= dataFim) {
    const dataISO = dataAtual.toISOString().split("T")[0];
    const fichasDoDia = treinosPorData.get(dataISO);

    registros.push({
      data: dataISO,
      completou: !!fichasDoDia && fichasDoDia.length > 0,
      fichasCompletas: fichasDoDia,
    });

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return {
    registros,
    dataInicio: dataInicio.toISOString().split("T")[0],
    dataFim: dataFim.toISOString().split("T")[0],
  };
})();

export { dadosFrequencia };
