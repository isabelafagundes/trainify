import type { RegistroSerie } from "@/domain/tipos";
import type { SessaoExercicio } from "./hooks/useSessaoTreino";
import { Icone } from "@/interface/widget/svg/Icone";
import { LinhaSerie } from "./LinhaSerie";

interface CardSeriesProps {
  exercicio: SessaoExercicio;
  usaCarga: boolean;
  /** Séries da última sessão deste exercício (rótulos da coluna "anterior"). */
  seriesAnteriores: RegistroSerie[];
  aoAtualizarSerie: (indiceSerie: number, atualizacao: Partial<Pick<RegistroSerie, "repeticoes" | "carga">>) => void;
  aoAdicionarSerie: () => void;
  aoRemoverSerie: (indiceSerie: number) => void;
  aoMarcarConcluida: (indiceSerie: number) => void;
  aoAbrirHistorico: (indiceSerie: number) => void;
}

/** Tabela de séries do exercício atual: # | anterior | kg | reps | feito. */
export function CardSeries({
  exercicio,
  usaCarga,
  seriesAnteriores,
  aoAtualizarSerie,
  aoAdicionarSerie,
  aoRemoverSerie,
  aoMarcarConcluida,
  aoAbrirHistorico,
}: CardSeriesProps) {
  const primeiraPendente = exercicio.series.findIndex((_, indice) => !exercicio.concluidas.has(indice));
  const indiceAtivo = primeiraPendente === -1 ? exercicio.series.length - 1 : primeiraPendente;

  const cabecalho = "text-[10px] font-semibold uppercase tracking-[0.08em] text-texto-sutil";

  return (
    <section className="rounded-2xl border border-borda bg-superficie px-3 pb-2 pt-3">
      <div
        className={`grid items-center gap-2 px-1 pb-1 ${
          usaCarga
            ? "grid-cols-[24px_minmax(0,1fr)_64px_64px_36px]"
            : "grid-cols-[24px_minmax(0,1fr)_64px_36px]"
        }`}
      >
        <span className={`${cabecalho} text-center`}>#</span>
        <span className={cabecalho}>anterior</span>
        {usaCarga ? <span className={`${cabecalho} text-center`}>kg</span> : null}
        <span className={`${cabecalho} text-center`}>reps</span>
        <span className={`${cabecalho} text-center`}>feito</span>
      </div>

      <div className="space-y-0.5">
        {exercicio.series.map((serie, indice) => (
          <LinhaSerie
            key={`${serie.serie}-${indice}`}
            serie={serie}
            indice={indice}
            ativa={indice === indiceAtivo}
            concluida={exercicio.concluidas.has(indice)}
            usaCarga={usaCarga}
            serieAnterior={seriesAnteriores[indice]}
            aoAtualizar={(atualizacao) => aoAtualizarSerie(indice, atualizacao)}
            aoConcluir={() => aoMarcarConcluida(indice)}
            aoAbrirHistorico={() => aoAbrirHistorico(indice)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={aoAdicionarSerie}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2 py-2 text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:bg-superficie-hover hover:text-texto-primario"
        >
          <Icone nome="mais" tamanho={14} />
          adicionar série
        </button>

        {exercicio.series.length > 1 ? (
          <button
            type="button"
            onClick={() => aoRemoverSerie(exercicio.series.length - 1)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2 py-2 text-[13px] font-medium text-texto-sutil transition-colors duration-150 hover:bg-superficie-hover hover:text-texto-primario"
          >
            <Icone nome="lixeira" tamanho={13} />
            remover última
          </button>
        ) : null}
      </div>
    </section>
  );
}
