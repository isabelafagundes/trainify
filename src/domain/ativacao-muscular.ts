export type MusculoId = "peitoral" | "deltoide" | "biceps" | "triceps" | "antebraco" | "costas" | "trapezio" | "abdomen" | "obliquos" | "lombar" | "gluteos" | "quadriceps" | "posteriores" | "adutores" | "panturrilhas";
export type NivelAtivacao = 1 | 2 | 3;
export interface AtivacaoMuscular { musculo: MusculoId; nivel: NivelAtivacao }

export const NOMES_MUSCULOS: Record<MusculoId, string> = {
  peitoral:"Peitoral", deltoide:"Deltoides", biceps:"Bíceps", triceps:"Tríceps",
  antebraco:"Antebraços", costas:"Dorsais", trapezio:"Trapézio", abdomen:"Abdômen",
  obliquos:"Oblíquos", lombar:"Lombar", gluteos:"Glúteos", quadriceps:"Quadríceps",
  posteriores:"Posteriores da coxa", adutores:"Adutores", panturrilhas:"Panturrilhas",
};

const PERFIS: Record<string, AtivacaoMuscular[]> = {
  peito:[{musculo:"peitoral",nivel:3},{musculo:"triceps",nivel:2},{musculo:"deltoide",nivel:1}],
  costas:[{musculo:"costas",nivel:3},{musculo:"trapezio",nivel:2},{musculo:"biceps",nivel:2},{musculo:"lombar",nivel:1}],
  ombros:[{musculo:"deltoide",nivel:3},{musculo:"trapezio",nivel:2},{musculo:"triceps",nivel:1}],
  trapezio:[{musculo:"trapezio",nivel:3},{musculo:"deltoide",nivel:1}],
  biceps:[{musculo:"biceps",nivel:3},{musculo:"antebraco",nivel:2}],
  triceps:[{musculo:"triceps",nivel:3},{musculo:"deltoide",nivel:1}],
  pernas:[{musculo:"quadriceps",nivel:3},{musculo:"gluteos",nivel:2},{musculo:"posteriores",nivel:2},{musculo:"panturrilhas",nivel:1}],
  gluteos:[{musculo:"gluteos",nivel:3},{musculo:"posteriores",nivel:2},{musculo:"quadriceps",nivel:1}],
  abdomen:[{musculo:"abdomen",nivel:3},{musculo:"obliquos",nivel:2},{musculo:"lombar",nivel:1}],
  antebraco:[{musculo:"antebraco",nivel:3},{musculo:"biceps",nivel:1}],
  // Perfis espec\u00edficos, usados s\u00f3 via override por exerc\u00edcio
  posteriores:[{musculo:"posteriores",nivel:3},{musculo:"gluteos",nivel:2},{musculo:"panturrilhas",nivel:1}],
  panturrilhas:[{musculo:"panturrilhas",nivel:3}],
  adutores:[{musculo:"adutores",nivel:3},{musculo:"gluteos",nivel:1},{musculo:"quadriceps",nivel:1}],
  terra:[{musculo:"posteriores",nivel:3},{musculo:"gluteos",nivel:3},{musculo:"lombar",nivel:2},{musculo:"costas",nivel:2},{musculo:"trapezio",nivel:1},{musculo:"antebraco",nivel:1}],
  stiff:[{musculo:"posteriores",nivel:3},{musculo:"gluteos",nivel:2},{musculo:"lombar",nivel:2}],
  "peito-isolado":[{musculo:"peitoral",nivel:3},{musculo:"deltoide",nivel:1}],
  obliquos:[{musculo:"obliquos",nivel:3},{musculo:"abdomen",nivel:2}],
  "ombro-posterior":[{musculo:"deltoide",nivel:3},{musculo:"trapezio",nivel:2}],
  "remada-alta":[{musculo:"trapezio",nivel:3},{musculo:"deltoide",nivel:2},{musculo:"biceps",nivel:1}],
  mergulho:[{musculo:"triceps",nivel:3},{musculo:"peitoral",nivel:2},{musculo:"deltoide",nivel:1}],
  "farmers-walk":[{musculo:"antebraco",nivel:3},{musculo:"trapezio",nivel:2}],
  "quadriceps-isolado":[{musculo:"quadriceps",nivel:3}],
  abducao:[{musculo:"gluteos",nivel:3}],
  pullover:[{musculo:"costas",nivel:3},{musculo:"peitoral",nivel:2},{musculo:"triceps",nivel:1}],
  "rosca-inversa":[{musculo:"antebraco",nivel:3},{musculo:"biceps",nivel:2}],
  elevacao:[{musculo:"deltoide",nivel:3},{musculo:"trapezio",nivel:1}],
};

// Overrides por nome normalizado, pra exerc\u00edcios cujo perfil do grupo erraria o prim\u00e1rio
const PERFIS_POR_EXERCICIO: Record<string, string> = {
  "cadeira flexora":"posteriores", "mesa flexora":"posteriores", "flexora em pe":"posteriores",
  stiff:"stiff",
  panturrilha:"panturrilhas", "panturrilha sentado":"panturrilhas", "panturrilha em pe":"panturrilhas",
  "cadeira adutora":"adutores",
  "levantamento terra":"terra",
  crucifixo:"peito-isolado", "crucifixo inclinado":"peito-isolado", crossover:"peito-isolado", "voador (peck deck)":"peito-isolado",
  "russian twist":"obliquos", "abdominal obliquo":"obliquos", "prancha lateral":"obliquos",
  "face pull":"ombro-posterior", "crucifixo invertido":"ombro-posterior",
  "remada alta":"remada-alta",
  mergulho:"mergulho", "triceps no banco":"mergulho",
  "farmer's walk":"farmers-walk",
  "cadeira extensora":"quadriceps-isolado",
  "abducao de quadril":"abducao", "cadeira abdutora":"abducao",
  pullover:"pullover",
  "rosca inversa":"rosca-inversa",
  "elevacao lateral":"elevacao", "elevacao lateral no cabo":"elevacao", "elevacao frontal":"elevacao",
};

function normalizar(texto: string) { return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() }
export function ativacoesDoGrupo(grupoMuscular: string): AtivacaoMuscular[] { return PERFIS[normalizar(grupoMuscular)] ?? [] }

export function ativacoesDoExercicio(exercicio: { nome: string; grupoMuscular: string }): AtivacaoMuscular[] {
  const perfil = PERFIS_POR_EXERCICIO[normalizar(exercicio.nome)];
  return perfil ? PERFIS[perfil] : ativacoesDoGrupo(exercicio.grupoMuscular);
}
