import type { Exercicio } from "@/domain/tipos";

/** Biblioteca padrão de exercícios */
export const exerciciosPadrao: Exercicio[] = [
  // Peito
  { id: "ex-01", nome: "Supino Reto", grupoMuscular: "Peito" },
  { id: "ex-02", nome: "Supino Inclinado", grupoMuscular: "Peito" },
  { id: "ex-03", nome: "Crucifixo", grupoMuscular: "Peito" },
  { id: "ex-04", nome: "Crossover", grupoMuscular: "Peito" },
  { id: "ex-05", nome: "Flexão de Braço", grupoMuscular: "Peito" },

  // Costas
  { id: "ex-06", nome: "Puxada Frontal", grupoMuscular: "Costas" },
  { id: "ex-07", nome: "Remada Curvada", grupoMuscular: "Costas" },
  { id: "ex-08", nome: "Remada Baixa", grupoMuscular: "Costas" },
  { id: "ex-09", nome: "Pulldown", grupoMuscular: "Costas" },
  { id: "ex-10", nome: "Barra Fixa", grupoMuscular: "Costas" },

  // Ombros
  { id: "ex-11", nome: "Desenvolvimento", grupoMuscular: "Ombros" },
  { id: "ex-12", nome: "Elevação Lateral", grupoMuscular: "Ombros" },
  { id: "ex-13", nome: "Elevação Frontal", grupoMuscular: "Ombros" },
  { id: "ex-14", nome: "Face Pull", grupoMuscular: "Ombros" },
  { id: "ex-15", nome: "Encolhimento", grupoMuscular: "Trapézio" },

  // Bíceps
  { id: "ex-16", nome: "Rosca Direta", grupoMuscular: "Bíceps" },
  { id: "ex-17", nome: "Rosca Alternada", grupoMuscular: "Bíceps" },
  { id: "ex-18", nome: "Rosca Martelo", grupoMuscular: "Bíceps" },
  { id: "ex-19", nome: "Rosca Scott", grupoMuscular: "Bíceps" },

  // Tríceps
  { id: "ex-20", nome: "Tríceps Corda", grupoMuscular: "Tríceps" },
  { id: "ex-21", nome: "Tríceps Testa", grupoMuscular: "Tríceps" },
  { id: "ex-22", nome: "Tríceps Francês", grupoMuscular: "Tríceps" },
  { id: "ex-23", nome: "Mergulho", grupoMuscular: "Tríceps" },

  // Pernas
  { id: "ex-24", nome: "Agachamento Livre", grupoMuscular: "Pernas" },
  { id: "ex-25", nome: "Leg Press", grupoMuscular: "Pernas" },
  { id: "ex-26", nome: "Cadeira Extensora", grupoMuscular: "Pernas" },
  { id: "ex-27", nome: "Cadeira Flexora", grupoMuscular: "Pernas" },
  { id: "ex-28", nome: "Panturrilha", grupoMuscular: "Pernas" },
  { id: "ex-29", nome: "Passada", grupoMuscular: "Pernas" },
  { id: "ex-30", nome: "Hack Squat", grupoMuscular: "Pernas" },

  // Glúteos
  { id: "ex-31", nome: "Hip Thrust", grupoMuscular: "Glúteos" },
  { id: "ex-32", nome: "Elevação Pélvica", grupoMuscular: "Glúteos" },
  { id: "ex-33", nome: "Abdução de Quadril", grupoMuscular: "Glúteos" },

  // Abdômen
  { id: "ex-34", nome: "Abdominal Crunch", grupoMuscular: "Abdômen" },
  { id: "ex-35", nome: "Prancha", grupoMuscular: "Abdômen" },
  { id: "ex-36", nome: "Abdominal Infra", grupoMuscular: "Abdômen" },
  { id: "ex-37", nome: "Russian Twist", grupoMuscular: "Abdômen" },

  // Antebraço
  { id: "ex-38", nome: "Rosca de Punho", grupoMuscular: "Antebraço" },

  // Compostos
  { id: "ex-39", nome: "Levantamento Terra", grupoMuscular: "Costas" },
  { id: "ex-40", nome: "Stiff", grupoMuscular: "Pernas" },
];
