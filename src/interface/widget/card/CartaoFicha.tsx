import type { Exercicio, ExercicioFicha, Ficha } from "@/domain/tipos";
import { Chip } from "@/interface/widget/chip/Chip";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";

interface PropriedadesCartaoFicha {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  ultimoTreino?: string | null;
  aoIniciarTreino: (fichaId: string) => void;
}

/** Extrai grupos musculares únicos dos exercícios da ficha */
function extrairGruposMusculares(
  exerciciosFicha: ExercicioFicha[],
  catalogo: Exercicio[]
): string[] {
  const grupos = new Set<string>();
  for (const ef of exerciciosFicha) {
    const exercicio = catalogo.find((e) => e.id === ef.exercicioId);
    if (exercicio) grupos.add(exercicio.grupoMuscular);
  }
  return Array.from(grupos);
}

/** Monta string resumida de exercícios (ex: "Supino Reto, Crucifixo, ...") */
function resumoExercicios(
  exerciciosFicha: ExercicioFicha[],
  catalogo: Exercicio[],
  maximo: number = 3
): string {
  const nomes = exerciciosFicha
    .slice(0, maximo)
    .map((ef) => {
      const ex = catalogo.find((e) => e.id === ef.exercicioId);
      return ex?.nome ?? "—";
    });
  const restante = exerciciosFicha.length - maximo;
  if (restante > 0) nomes.push(`+${restante}`);
  return nomes.join(", ");
}

/** Formata data ISO para exibição compacta */
function formatarDataCurta(dataISO: string): string {
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CartaoFicha({
  ficha,
  exerciciosCatalogo,
  ultimoTreino,
  aoIniciarTreino,
}: PropriedadesCartaoFicha) {
  const gruposMusculares = extrairGruposMusculares(ficha.exercicios, exerciciosCatalogo);
  const resumo = resumoExercicios(ficha.exercicios, exerciciosCatalogo);

  return (
    <div className="bg-superficie rounded-2xl border border-borda overflow-hidden transition-shadow duration-200 ease-out hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      {/* Header do card */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex-shrink-0 w-10 h-10 rounded-[10px] bg-acento-suave flex items-center justify-center text-texto-primario">
            <IconeFicha nome={ficha.icone} tamanho={22} emoji={ficha.emoji} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-texto-primario leading-tight font-display">
              {ficha.nome}
            </h3>
            {ficha.descricao && (
              <p className="text-sm text-texto-secundario mt-0.5 leading-snug">
                {ficha.descricao}
              </p>
            )}
          </div>

          {/* Contador de exercícios */}
          <span className="flex-shrink-0 text-xs text-texto-sutil font-medium tabular-nums">
            {ficha.exercicios.length} exerc.
          </span>
        </div>

        {/* Chips de grupos musculares */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {gruposMusculares.map((grupo) => (
            <Chip key={grupo} rotulo={grupo} />
          ))}
        </div>

        {/* Resumo dos exercícios */}
        <p className="text-sm text-texto-sutil mt-3 leading-relaxed">
          {resumo}
        </p>

        {/* Último treino */}
        {ultimoTreino && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-texto-sutil">
            <Icone nome="relogio" tamanho={14} />
            <span>Último: {formatarDataCurta(ultimoTreino)}</span>
          </div>
        )}
      </div>

      {/* Ação de iniciar treino */}
      <div className="px-5 pb-5 pt-2">
        <button
          onClick={() => aoIniciarTreino(ficha.id)}
          className="
            w-full flex items-center justify-center gap-2
            py-2.5 min-h-[42px] rounded-[9px]
            bg-transparent border border-borda-suave
            text-texto-secundario
            text-sm font-normal
            transition-all duration-200 ease-out
            hover:border-borda hover:bg-acento-suave/50 hover:text-texto-primario
            active:scale-[0.99]
            cursor-pointer
          "
        >
          <Icone nome="reproduzir" tamanho={16} />
          Iniciar Treino
        </button>
      </div>
    </div>
  );
}
