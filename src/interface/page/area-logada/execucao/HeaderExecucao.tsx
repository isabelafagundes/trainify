import type { NomeIcone } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";
import { IconeFicha } from "@/interface/widget/svg/Icone";

interface HeaderExecucaoProps {
  nomeFicha: string;
  iconeFicha: NomeIcone;
  emojiFicha?: string;
  modo: "musculacao" | "cardio";
  podeAlternarModo: boolean;
  aoAlternarModo: () => void;
  aoCancelar: () => void;
}

export function HeaderExecucao({
  nomeFicha,
  iconeFicha,
  emojiFicha,
  modo,
  podeAlternarModo,
  aoAlternarModo,
  aoCancelar,
}: HeaderExecucaoProps) {
  return (
    <header className="sticky top-0 z-20 bg-fundo pt-[var(--safe-top)]">
      <div className="mx-auto flex w-full max-w-[768px] items-center gap-2 px-4 py-3">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[8px] bg-acento-suave text-texto-primario">
          <IconeFicha nome={iconeFicha} emoji={emojiFicha} tamanho={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-texto-primario">{nomeFicha}</p>
        </div>

        {podeAlternarModo ? (
          <button
            type="button"
            onClick={aoAlternarModo}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-superficie px-3 py-2 text-xs font-medium text-texto-primario border border-borda-suave hover:bg-superficie-hover transition-colors"
          >
            <Icone nome={modo === "cardio" ? "halter" : "corrida"} tamanho={14} />
            {modo === "cardio" ? "musculação" : "cardio"}
          </button>
        ) : null}

        <button
          type="button"
          aria-label="Sair do treino"
          onClick={aoCancelar}
          className="grid h-10 w-10 place-items-center rounded-[8px] text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario transition-colors"
        >
          <Icone nome="fechar" tamanho={18} />
        </button>
      </div>
    </header>
  );
}
