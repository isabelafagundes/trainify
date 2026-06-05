import { useEffect } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface TimerDescansoProps {
  aberto: boolean;
  tempo: string;
  segundosRestantes: number;
  segundosIniciais: number;
  rodando: boolean;
  aoAlternar: () => void;
  aoResetar: () => void;
  aoFechar: () => void;
}

export function TimerDescanso({
  aberto,
  tempo,
  segundosRestantes,
  segundosIniciais,
  rodando,
  aoAlternar,
  aoResetar,
  aoFechar,
}: TimerDescansoProps) {
  useEffect(() => {
    if (!aberto) return;
    const handler = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const progresso = segundosIniciais > 0
    ? Math.max(0, Math.min(1, segundosRestantes / segundosIniciais))
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-label="Timer de descanso">
      <button
        type="button"
        aria-label="Fechar timer"
        onClick={aoFechar}
        className="absolute inset-0 bg-texto-primario/30 backdrop-blur-sm animate-fade-in"
      />

      <div className="relative w-full max-w-[480px] rounded-t-[16px] border-t border-borda-suave bg-fundo px-6 pb-8 pt-5 shadow-xl animate-slide-up">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-borda-suave" />

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
            Descanso
          </p>
          <button
            type="button"
            onClick={aoFechar}
            className="text-xs font-medium text-texto-secundario hover:text-texto-primario"
          >
            pular
          </button>
        </div>

        <div
          className={`mt-4 text-center text-[64px] font-medium leading-none tabular-nums text-texto-primario ${
            rodando ? "animate-pulse-subtle" : ""
          }`}
        >
          {tempo}
        </div>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-borda-suave">
          <div
            className="h-full bg-texto-primario transition-all duration-1000 ease-linear"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={aoResetar}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-borda-suave bg-superficie px-4 text-sm font-medium text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario"
          >
            <Icone nome="relogio" tamanho={15} />
            reiniciar
          </button>
          <button
            type="button"
            onClick={aoAlternar}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-acento px-4 text-sm font-medium text-texto-invertido"
            aria-label={rodando ? "Pausar descanso" : "Iniciar descanso"}
          >
            <Icone nome={rodando ? "relogio" : "reproduzir"} tamanho={16} />
            {rodando ? "pausar" : "iniciar"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface BotaoTimerDescansoProps {
  tempo: string;
  rodando: boolean;
  aoAbrir: () => void;
}

export function BotaoTimerDescanso({ tempo, rodando, aoAbrir }: BotaoTimerDescansoProps) {
  return (
    <button
      type="button"
      onClick={aoAbrir}
      aria-label="Abrir timer de descanso"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-borda-suave bg-superficie px-3 text-sm font-medium tabular-nums text-texto-primario hover:bg-superficie-hover transition-colors"
    >
      <Icone nome={rodando ? "relogio" : "reproduzir"} tamanho={15} />
      <span className={rodando ? "animate-pulse-subtle" : ""}>{tempo}</span>
    </button>
  );
}
