import { useEffect, useState } from "react";

interface PropriedadesBannerPrograma {
  nome: string;
  descricao: string;
  totalFichas: number;
  fichasConcluidas?: number;
}

export function BannerPrograma({ nome, descricao, totalFichas, fichasConcluidas }: PropriedadesBannerPrograma) {
  const temProgresso = fichasConcluidas !== undefined && totalFichas > 0;
  const porcentagem = temProgresso ? Math.round((fichasConcluidas / totalFichas) * 100) : 0;
  const completo = temProgresso && fichasConcluidas >= totalFichas;

  // Preenche a barra a partir do zero ao montar (acompanha a entrada da home)
  const [larguraBarra, setLarguraBarra] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLarguraBarra(Math.min(porcentagem, 100)));
    return () => cancelAnimationFrame(id);
  }, [porcentagem]);

  return (
    <div className="flex-1 min-w-0 py-1">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-texto-primario leading-tight font-display truncate">
          {nome}
        </h2>
        {temProgresso && (
          <span className={`flex-shrink-0 text-xs font-semibold tabular-nums leading-none ${completo ? "text-acento" : "text-texto-secundario"}`}>
            {fichasConcluidas}/{totalFichas} esta semana
          </span>
        )}
      </div>
      <p className="text-sm text-texto-secundario mt-1 leading-snug truncate">
        {descricao} · {totalFichas} ficha{totalFichas !== 1 ? "s" : ""}
      </p>

      {/* Barra de progresso semanal */}
      {temProgresso && (
        <div className="mt-3 flex items-center gap-3 group">
          <div className="flex-1 h-2 rounded-full bg-borda-suave overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${completo ? "bg-acento animate-pulse-subtle" : "bg-texto-secundario/50 group-hover:bg-texto-secundario/60"} relative`}
              style={{ width: `${larguraBarra}%` }}
            >
              {completo && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
          <span className={`text-xs font-bold tabular-nums leading-none transition-colors duration-300 ${completo ? "text-acento" : "text-texto-secundario"}`}>
            {porcentagem}%
          </span>
        </div>
      )}
    </div>
  );
}
