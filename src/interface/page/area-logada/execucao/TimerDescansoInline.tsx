import { Icone } from "@/interface/widget/svg/Icone";

interface TimerDescansoInlineProps {
  tempoFormatado: string;
  segundosRestantes: number;
  segundosIniciais: number;
  rodando: boolean;
  aoAlternar: () => void;
  aoPular: () => void;
}

/** Timer de descanso inline (substitui o overlay na página de exercício):
    aparece entre o título e a tabela enquanto o descanso corre — auto-inicia
    ao concluir uma série. */
export function TimerDescansoInline({
  tempoFormatado,
  segundosRestantes,
  segundosIniciais,
  rodando,
  aoAlternar,
  aoPular,
}: TimerDescansoInlineProps) {
  const fracao = segundosIniciais > 0 ? segundosRestantes / segundosIniciais : 0;

  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-borda-suave bg-superficie px-3 py-2.5">
      <span className="text-texto-secundario">
        <Icone nome="relogio" tamanho={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-texto-secundario">descanso</span>
          <span className="font-semibold tabular-nums text-texto-primario">{tempoFormatado}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-borda-suave">
          <div
            className="h-full rounded-full bg-texto-primario transition-[width] duration-1000 ease-linear"
            style={{ width: `${fracao * 100}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={aoAlternar}
        aria-label={rodando ? "Pausar descanso" : "Retomar descanso"}
        className="grid h-8 w-8 cursor-pointer place-items-center rounded-[8px] border border-borda-suave bg-superficie text-texto-secundario transition-colors duration-150 hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        <Icone nome={rodando ? "pausar" : "reproduzir"} tamanho={14} />
      </button>

      <button
        type="button"
        onClick={aoPular}
        className="cursor-pointer text-xs font-medium text-texto-sutil transition-colors duration-150 hover:text-texto-primario"
      >
        pular
      </button>
    </div>
  );
}
