interface OverlayConfirmarFinalizarProps {
  aberto: boolean;
  resumo: {
    itensConcluidos: number;
    itensTotal: number;
    seriesConcluidas: number;
    seriesTotal: number;
  };
  aoContinuar: () => void;
  aoFinalizar: () => void;
}

export function OverlayConfirmarFinalizar({
  aberto,
  resumo,
  aoContinuar,
  aoFinalizar,
}: OverlayConfirmarFinalizarProps) {
  if (!aberto) return null;

  const faltamItens = resumo.itensConcluidos < resumo.itensTotal;
  const faltamSeries =
    resumo.seriesTotal > 0 && resumo.seriesConcluidas < resumo.seriesTotal;

  const pendencias = [
    faltamItens &&
      `${resumo.itensConcluidos} de ${resumo.itensTotal} ${resumo.itensTotal === 1 ? "item concluído" : "itens concluídos"}`,
    faltamSeries &&
      `${resumo.seriesConcluidas} de ${resumo.seriesTotal} séries feitas`,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 md:items-center" onClick={aoContinuar}>
      <div
        className="w-full max-w-[480px] rounded-t-[16px] border border-borda bg-superficie px-5 pb-[calc(var(--safe-bottom)+20px)] pt-4 shadow-xl md:rounded-2xl md:pb-5"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-borda md:hidden" />
        <h2 className="font-display text-xl font-semibold text-texto-primario">Finalizar mesmo assim?</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-secundario">
          {pendencias.length > 0
            ? `Você ainda tem ${pendencias.join(" e ")}.`
            : "Tudo certo para finalizar."}
        </p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={aoContinuar}
            className="min-h-11 rounded-[8px] border border-borda-suave bg-superficie text-sm font-medium text-texto-primario"
          >
            Continuar treinando
          </button>
          <button
            type="button"
            onClick={aoFinalizar}
            className="min-h-11 rounded-[8px] bg-acento text-sm font-medium text-texto-invertido"
          >
            Finalizar agora
          </button>
        </div>
      </div>
    </div>
  );
}
