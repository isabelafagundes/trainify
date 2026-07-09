import { useMemo, useState } from "react";
import type { RegistroTreino } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";

interface AccordionProgressaoProps {
  exercicioId: string;
  historico: RegistroTreino[];
  aoAbrirGrafico: () => void;
  /** "colapsavel" (mobile: linha que expande) ou "aberta" (painel lg). */
  variante?: "colapsavel" | "aberta";
}

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function AccordionProgressao({
  exercicioId,
  historico,
  aoAbrirGrafico,
  variante = "colapsavel",
}: AccordionProgressaoProps) {
  const [aberto, setAberto] = useState(false);

  const ultimos = useMemo(
    () =>
      historico
        .map((registro) => ({
          registro,
          exercicio: registro.exercicios.find((item) => item.exercicioId === exercicioId),
        }))
        .filter((item) => item.exercicio && item.exercicio.series.length > 0)
        .slice(0, 5),
    [exercicioId, historico]
  );

  const ultimaSerie = ultimos[0]?.exercicio?.series[0];
  const melhorSerie = useMemo(() => {
    const series = ultimos.flatMap((item) => item.exercicio?.series ?? []);
    if (series.length === 0) return undefined;
    return series.reduce((melhor, serie) =>
      serie.carga > melhor.carga ||
      (serie.carga === melhor.carga && serie.repeticoes > melhor.repeticoes)
        ? serie
        : melhor
    );
  }, [ultimos]);

  const listagem =
    ultimos.length > 0 ? (
      <div className="space-y-1.5">
        {ultimos.map(({ registro, exercicio }) => (
          <div
            key={registro.id}
            className="flex items-center justify-between gap-3 rounded-[8px] bg-fundo px-3 py-2 text-[13px]"
          >
            <span className="shrink-0 tabular-nums text-texto-sutil">
              {formatarData(registro.iniciadoEm)}
            </span>
            <span className="truncate tabular-nums text-texto-secundario">
              {exercicio?.series
                .map((serie) => `${serie.repeticoes}x${serie.carga || 0}`)
                .join("  ")}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          {melhorSerie ? (
            <span className="text-xs text-texto-secundario">
              melhor série:{" "}
              <strong className="tabular-nums">
                {melhorSerie.repeticoes}x{melhorSerie.carga || 0}
              </strong>
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={aoAbrirGrafico}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-xs font-medium text-texto-secundario transition-colors duration-150 hover:bg-superficie-hover hover:text-texto-primario"
          >
            <Icone nome="tendencia" tamanho={13} />
            ver gráfico
          </button>
        </div>
      </div>
    ) : (
      <p className="rounded-[8px] bg-fundo px-3 py-3 text-[13px] text-texto-sutil">
        Sem registros anteriores para este exercício.
      </p>
    );

  if (variante === "aberta") {
    return (
      <section className="rounded-[12px] border border-borda-suave bg-superficie px-3.5 py-3">
        <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-texto-sutil">
          <Icone nome="tendencia" tamanho={13} /> progressão
        </div>
        {listagem}
      </section>
    );
  }

  return (
    <section className="rounded-[10px] border border-borda-suave bg-superficie">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-3 text-left text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-texto-primario"
      >
        <Icone nome="tendencia" tamanho={15} />
        <span className="tabular-nums">
          progressão
          {ultimaSerie ? ` · última: ${ultimaSerie.repeticoes}x${ultimaSerie.carga || 0}` : ""}
        </span>
        <span className="flex-1" />
        <Icone
          nome="setaBaixo"
          tamanho={14}
          className={`shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto ? <div className="px-3 pb-3">{listagem}</div> : null}
    </section>
  );
}
