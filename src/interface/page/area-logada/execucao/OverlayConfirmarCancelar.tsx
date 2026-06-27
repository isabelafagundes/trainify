interface OverlayConfirmarCancelarProps {
  aberto: boolean;
  aoContinuar: () => void;
  aoDescartar: () => void;
}

export function OverlayConfirmarCancelar({
  aberto,
  aoContinuar,
  aoDescartar,
}: OverlayConfirmarCancelarProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 md:items-center" onClick={aoContinuar}>
      <div
        className="w-full max-w-[480px] rounded-t-[16px] border border-borda bg-superficie px-5 pb-[calc(var(--safe-bottom)+20px)] pt-4 shadow-xl md:rounded-2xl md:pb-5"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-borda md:hidden" />
        <h2 className="font-display text-xl font-semibold text-texto-primario">Descartar treino?</h2>
        <p className="mt-2 text-sm text-texto-secundario">Os dados serão perdidos.</p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={aoContinuar}
            className="min-h-11 rounded-[8px] border border-borda-suave bg-superficie text-sm font-medium text-texto-primario"
          >
            Continuar treino
          </button>
          <button
            type="button"
            onClick={aoDescartar}
            className="min-h-11 rounded-[8px] bg-texto-primario text-sm font-medium text-texto-invertido"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
