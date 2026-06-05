interface OverlayConfirmarFinalizarProps {
  aberto: boolean;
  resumo: {
    exerciciosConcluidos: number;
    exerciciosTotal: number;
    cardioPreenchido: number;
    cardioTotal: number;
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

  const faltamExercicios = resumo.exerciciosConcluidos < resumo.exerciciosTotal;
  const faltaCardio =
    resumo.cardioTotal > 0 && resumo.cardioPreenchido < resumo.cardioTotal;

  const pendencias = [
    faltamExercicios &&
      `${resumo.exerciciosConcluidos} de ${resumo.exerciciosTotal} ${resumo.exerciciosTotal === 1 ? "exercício concluído" : "exercícios concluídos"}`,
    faltaCardio &&
      `${resumo.cardioPreenchido} de ${resumo.cardioTotal} cardio preenchido`,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25" onClick={aoContinuar}>
      <div
        className="w-full max-w-[480px] rounded-t-[16px] border border-borda bg-superficie px-5 pb-5 pt-4 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-borda" />
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
