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

  // Peito (variações)
  { id: "ex-41", nome: "Supino Declinado", grupoMuscular: "Peito" },
  { id: "ex-42", nome: "Supino Máquina", grupoMuscular: "Peito" },
  { id: "ex-43", nome: "Crucifixo Inclinado", grupoMuscular: "Peito" },
  { id: "ex-44", nome: "Voador (Peck Deck)", grupoMuscular: "Peito" },

  // Costas — remadas
  { id: "ex-45", nome: "Remada Cavalinho", grupoMuscular: "Costas" },
  { id: "ex-46", nome: "Remada Unilateral (Serrote)", grupoMuscular: "Costas" },
  { id: "ex-47", nome: "Remada Máquina", grupoMuscular: "Costas" },
  { id: "ex-48", nome: "Remada Sentada (Cabo)", grupoMuscular: "Costas" },
  // Costas — puxadas
  { id: "ex-49", nome: "Puxada Aberta", grupoMuscular: "Costas" },
  { id: "ex-50", nome: "Puxada Supinada", grupoMuscular: "Costas" },
  { id: "ex-51", nome: "Puxada Triângulo", grupoMuscular: "Costas" },
  { id: "ex-52", nome: "Pullover", grupoMuscular: "Costas" },
  { id: "ex-53", nome: "Barra Fixa Supinada", grupoMuscular: "Costas" },

  // Ombros (variações)
  { id: "ex-54", nome: "Desenvolvimento Arnold", grupoMuscular: "Ombros" },
  { id: "ex-55", nome: "Desenvolvimento Máquina", grupoMuscular: "Ombros" },
  { id: "ex-56", nome: "Elevação Lateral no Cabo", grupoMuscular: "Ombros" },
  { id: "ex-57", nome: "Crucifixo Invertido", grupoMuscular: "Ombros" },
  { id: "ex-58", nome: "Remada Alta", grupoMuscular: "Ombros" },

  // Trapézio
  { id: "ex-59", nome: "Encolhimento com Halteres", grupoMuscular: "Trapézio" },

  // Bíceps (variações)
  { id: "ex-60", nome: "Rosca Concentrada", grupoMuscular: "Bíceps" },
  { id: "ex-61", nome: "Rosca no Cabo", grupoMuscular: "Bíceps" },
  { id: "ex-62", nome: "Rosca Inversa", grupoMuscular: "Bíceps" },

  // Tríceps (variações)
  { id: "ex-63", nome: "Tríceps no Banco", grupoMuscular: "Tríceps" },
  { id: "ex-64", nome: "Tríceps Coice", grupoMuscular: "Tríceps" },
  { id: "ex-65", nome: "Tríceps Unilateral", grupoMuscular: "Tríceps" },

  // Pernas — agachamentos
  { id: "ex-66", nome: "Agachamento Smith", grupoMuscular: "Pernas" },
  { id: "ex-67", nome: "Agachamento Frontal", grupoMuscular: "Pernas" },
  { id: "ex-68", nome: "Agachamento Búlgaro", grupoMuscular: "Pernas" },
  { id: "ex-69", nome: "Agachamento Sumô", grupoMuscular: "Pernas" },
  { id: "ex-70", nome: "Afundo", grupoMuscular: "Pernas" },
  { id: "ex-71", nome: "Avanço", grupoMuscular: "Pernas" },
  // Pernas — máquinas/posteriores
  { id: "ex-72", nome: "Mesa Flexora", grupoMuscular: "Pernas" },
  { id: "ex-73", nome: "Flexora em Pé", grupoMuscular: "Pernas" },
  { id: "ex-74", nome: "Cadeira Adutora", grupoMuscular: "Pernas" },
  { id: "ex-75", nome: "Panturrilha Sentado", grupoMuscular: "Pernas" },

  // Glúteos (variações)
  { id: "ex-76", nome: "Coice no Cabo", grupoMuscular: "Glúteos" },
  { id: "ex-77", nome: "Cadeira Abdutora", grupoMuscular: "Glúteos" },
  { id: "ex-78", nome: "Agachamento Sumô (Halter)", grupoMuscular: "Glúteos" },

  // Abdômen (variações)
  { id: "ex-79", nome: "Elevação de Pernas", grupoMuscular: "Abdômen" },
  { id: "ex-80", nome: "Abdominal Oblíquo", grupoMuscular: "Abdômen" },
  { id: "ex-81", nome: "Prancha Lateral", grupoMuscular: "Abdômen" },
  { id: "ex-82", nome: "Abdominal na Roda", grupoMuscular: "Abdômen" },

  // Antebraço (variações)
  { id: "ex-83", nome: "Rosca de Punho Inversa", grupoMuscular: "Antebraço" },
  { id: "ex-84", nome: "Farmer's Walk", grupoMuscular: "Antebraço" },
];
