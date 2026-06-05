import { useMemo, useState } from "react";
import type { RegistroTreino } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";

interface AccordionProgressaoProps {
  exercicioId: string;
  historico: RegistroTreino[];
  aoAbrirGrafico: () => void;
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
}: AccordionProgressaoProps) {
  const [aberto, setAberto] = useState(false);
  const ultimos = useMemo(
    () =>
      historico
        .map((registro) => ({
          registro,
          exercicio: registro.exercicios.find((item) => item.exercicioId === exercicioId),
        }))
        .filter((item) => item.exercicio)
        .slice(0, 5),
    [exercicioId, historico]
  );

  return (
    <section className="rounded-[8px] border border-borda-suave bg-superficie">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-texto-secundario hover:text-texto-primario transition-colors"
      >
        <span>Progressão (últimas 5)</span>
        <Icone nome="setaBaixo" tamanho={16} className={`transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto ? (
        <div className="px-3 pb-3">
          {ultimos.length > 0 ? (
            <div className="space-y-2">
              {ultimos.map(({ registro, exercicio }) => (
                <div
                  key={registro.id}
                  className="flex items-center justify-between rounded-[8px] bg-fundo px-3 py-2 text-sm"
                >
                  <span className="text-texto-secundario">{formatarData(registro.iniciadoEm)}</span>
                  <span className="text-texto-primario tabular-nums">
                    {exercicio?.series
                      .map((serie) => `${serie.repeticoes}x${serie.carga || 0}`)
                      .join("  ")}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={aoAbrirGrafico}
                className="inline-flex items-center gap-2 rounded-[8px] px-2 py-2 text-sm text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario"
              >
                <Icone nome="tendencia" tamanho={15} />
                ver gráfico
              </button>
            </div>
          ) : (
            <p className="rounded-[8px] bg-fundo px-3 py-3 text-sm text-texto-sutil">
              Sem registros anteriores para este exercício.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
