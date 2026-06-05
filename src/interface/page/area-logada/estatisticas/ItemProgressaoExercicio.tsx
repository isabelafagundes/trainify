import type { ProgressaoExercicio } from "./utils";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesItemProgressaoExercicio {
  progressao: ProgressaoExercicio;
  aoClicar?: (exercicioId: string) => void;
}

function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function ItemProgressaoExercicio({
  progressao,
  aoClicar,
}: PropriedadesItemProgressaoExercicio) {
  const clicavel = !!aoClicar;
  const Componente = clicavel ? "button" : "div";

  return (
    <Componente
      onClick={clicavel ? () => aoClicar!(progressao.exercicioId) : undefined}
      className={`
        w-full flex items-center gap-3 px-4 py-3
        bg-superficie border border-borda rounded-[12px]
        text-left transition-colors duration-150 ease-out
        ${clicavel ? "hover:bg-superficie-hover active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento" : ""}
        min-h-[56px]
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-texto-primario truncate font-display">
            {progressao.nome}
          </span>
          <span className="flex-shrink-0 text-xs text-texto-sutil tabular-nums">
            {formatarData(progressao.ultimaData)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-texto-sutil">
          <span className="truncate">{progressao.grupoMuscular}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums whitespace-nowrap">
            {progressao.totalSessoes} {progressao.totalSessoes === 1 ? "sessão" : "sessões"}
          </span>
          {progressao.usaCarga && progressao.cargaMaxima > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums whitespace-nowrap">
                máx {progressao.cargaMaxima} kg
              </span>
            </>
          )}
        </div>
      </div>

      {clicavel && (
        <div className="flex-shrink-0 text-texto-sutil">
          <Icone nome="setaDireita" tamanho={16} />
        </div>
      )}
    </Componente>
  );
}
