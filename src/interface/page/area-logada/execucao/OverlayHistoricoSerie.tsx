import type { RegistroSerie, RegistroTreino } from "@/domain/tipos";

interface OverlayHistoricoSerieProps {
  aberto: boolean;
  exercicioId: string;
  historico: RegistroTreino[];
  aoSelecionar: (serie: RegistroSerie) => void;
  aoFechar: () => void;
}

export function OverlayHistoricoSerie({
  aberto,
  exercicioId,
  historico,
  aoSelecionar,
  aoFechar,
}: OverlayHistoricoSerieProps) {
  if (!aberto) return null;

  const series = historico
    .flatMap((registro) => registro.exercicios.find((item) => item.exercicioId === exercicioId)?.series ?? [])
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 md:items-center" onClick={aoFechar}>
      <div
        className="w-full max-w-[480px] rounded-t-[16px] border border-borda bg-superficie px-5 pb-[calc(var(--safe-bottom)+20px)] pt-4 shadow-xl md:rounded-2xl md:pb-5"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-borda md:hidden" />
        <h2 className="font-display text-xl font-semibold text-texto-primario">Séries anteriores</h2>
        <div className="mt-4 grid gap-2">
          {series.length > 0 ? (
            series.map((serie, indice) => (
              <button
                key={`${serie.serie}-${serie.repeticoes}-${serie.carga}-${indice}`}
                type="button"
                onClick={() => aoSelecionar(serie)}
                className="flex items-center justify-between rounded-[8px] bg-fundo px-3 py-3 text-left text-sm hover:bg-superficie-hover"
              >
                <span className="text-texto-secundario">Série {serie.serie}</span>
                <span className="tabular-nums text-texto-primario">
                  {serie.repeticoes} reps {serie.carga ? `- ${serie.carga} kg` : ""}
                </span>
              </button>
            ))
          ) : (
            <p className="rounded-[8px] bg-fundo px-3 py-3 text-sm text-texto-sutil">
              Sem séries anteriores para sugerir.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
