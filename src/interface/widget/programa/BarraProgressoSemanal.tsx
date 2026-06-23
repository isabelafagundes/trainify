import { useEffect, useState } from "react";

interface PropriedadesBarraProgressoSemanal {
  /** Quantas fichas já foram treinadas nesta semana */
  concluidas: number;
  /** Total de fichas do programa */
  total: number;
  /** Exibe o rótulo "X/Y esta semana" acima da barra */
  comRotulo?: boolean;
}

/**
 * Barra de progresso semanal do programa, com animação de preenchimento
 * a partir do zero ao montar. Reutilizada pelo BannerPrograma (Home) e
 * pela tela de resumo do programa.
 */
export function BarraProgressoSemanal({
  concluidas,
  total,
  comRotulo = false,
}: PropriedadesBarraProgressoSemanal) {
  const temProgresso = total > 0;
  const porcentagem = temProgresso ? Math.round((concluidas / total) * 100) : 0;
  const completo = temProgresso && concluidas >= total;

  const [larguraBarra, setLarguraBarra] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLarguraBarra(Math.min(porcentagem, 100)));
    return () => cancelAnimationFrame(id);
  }, [porcentagem]);

  if (!temProgresso) return null;

  return (
    <div>
      {comRotulo && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-texto-sutil">Esta semana</span>
          <span
            className={`text-xs font-semibold tabular-nums leading-none ${completo ? "text-acento" : "text-texto-secundario"}`}
          >
            {concluidas}/{total}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 group">
        <div className="flex-1 h-2 rounded-full bg-borda-suave overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative ${completo ? "bg-acento animate-pulse-subtle" : "bg-texto-secundario/50 group-hover:bg-texto-secundario/60"}`}
            style={{ width: `${larguraBarra}%` }}
          >
            {completo && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
        <span
          className={`text-xs font-bold tabular-nums leading-none transition-colors duration-300 ${completo ? "text-acento" : "text-texto-secundario"}`}
        >
          {porcentagem}%
        </span>
      </div>
    </div>
  );
}
