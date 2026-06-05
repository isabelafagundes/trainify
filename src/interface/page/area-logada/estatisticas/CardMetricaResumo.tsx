import type { ReactNode } from "react";

interface PropriedadesCardMetricaResumo {
  rotulo: string;
  valor: string | number;
  sufixo?: string;
  icone?: ReactNode;
  destaque?: ReactNode;
}

export function CardMetricaResumo({
  rotulo,
  valor,
  sufixo,
  icone,
  destaque,
}: PropriedadesCardMetricaResumo) {
  return (
    <div className="flex-1 bg-superficie rounded-2xl border border-borda px-4 py-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        {icone && <div className="text-texto-sutil">{icone}</div>}
        <span className="text-xs text-texto-sutil font-medium">{rotulo}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-texto-primario tabular-nums font-display">
          {valor}
        </span>
        {sufixo && (
          <span className="text-xs text-texto-sutil">{sufixo}</span>
        )}
      </div>
      {destaque && (
        <div className="mt-1 text-[11px] text-texto-sutil">{destaque}</div>
      )}
    </div>
  );
}
