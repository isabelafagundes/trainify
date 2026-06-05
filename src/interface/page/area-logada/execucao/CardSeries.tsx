import type { RegistroSerie } from "@/domain/tipos";
import type { SessaoExercicio } from "./hooks/useSessaoTreino";
import { Icone } from "@/interface/widget/svg/Icone";
import { LinhaSerie } from "./LinhaSerie";

interface CardSeriesProps {
  exercicio: SessaoExercicio;
  usaCarga: boolean;
  aoAtualizarSerie: (indiceSerie: number, atualizacao: Partial<Pick<RegistroSerie, "repeticoes" | "carga">>) => void;
  aoAdicionarSerie: () => void;
  aoRemoverSerie: (indiceSerie: number) => void;
  aoMarcarConcluida: (indiceSerie: number) => void;
  aoAbrirHistorico: (indiceSerie: number) => void;
}

export function CardSeries({
  exercicio,
  usaCarga,
  aoAtualizarSerie,
  aoAdicionarSerie,
  aoRemoverSerie,
  aoMarcarConcluida,
  aoAbrirHistorico,
}: CardSeriesProps) {
  const primeiraPendente = exercicio.series.findIndex((_, indice) => !exercicio.concluidas.has(indice));
  const indiceAtivo = primeiraPendente === -1 ? exercicio.series.length - 1 : primeiraPendente;

  return (
    <section className="rounded-[8px] border border-borda-suave bg-superficie px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[10px] font-medium uppercase tracking-wide text-texto-sutil">séries</h2>
        <span className="text-xs tabular-nums text-texto-sutil">
          {exercicio.concluidas.size}/{exercicio.series.length}
        </span>
      </div>

      <div className="space-y-1">
        {exercicio.series.map((serie, indice) => (
          <LinhaSerie
            key={`${serie.serie}-${indice}`}
            serie={serie}
            indice={indice}
            ativa={indice === indiceAtivo}
            concluida={exercicio.concluidas.has(indice)}
            usaCarga={usaCarga}
            podeRemover={exercicio.series.length > 1}
            aoAtualizar={(atualizacao) => aoAtualizarSerie(indice, atualizacao)}
            aoConcluir={() => aoMarcarConcluida(indice)}
            aoRemover={() => aoRemoverSerie(indice)}
            aoAbrirHistorico={() => aoAbrirHistorico(indice)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={aoAdicionarSerie}
        className="mt-2 inline-flex items-center gap-2 rounded-[8px] px-2 py-2 text-sm font-medium text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario transition-colors"
      >
        <Icone nome="mais" tamanho={15} />
        adicionar série
      </button>
    </section>
  );
}
