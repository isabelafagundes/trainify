import { BarraProgressoSemanal } from "@/interface/widget/programa/BarraProgressoSemanal";

interface PropriedadesBannerPrograma {
  nome: string;
  descricao: string;
  totalFichas: number;
  fichasConcluidas?: number;
}

export function BannerPrograma({ nome, descricao, totalFichas, fichasConcluidas }: PropriedadesBannerPrograma) {
  const temProgresso = fichasConcluidas !== undefined && totalFichas > 0;

  return (
    <div className="flex-1 min-w-0 py-1">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-texto-primario leading-tight font-display truncate">
          {nome}
        </h2>
        {temProgresso && (
          <span className="flex-shrink-0 text-xs font-semibold tabular-nums leading-none text-texto-secundario">
            {fichasConcluidas}/{totalFichas} esta semana
          </span>
        )}
      </div>
      <p className="text-sm text-texto-secundario mt-1 leading-snug truncate">
        {descricao} · {totalFichas} ficha{totalFichas !== 1 ? "s" : ""}
      </p>

      {temProgresso && (
        <div className="mt-3">
          <BarraProgressoSemanal concluidas={fichasConcluidas} total={totalFichas} />
        </div>
      )}
    </div>
  );
}
