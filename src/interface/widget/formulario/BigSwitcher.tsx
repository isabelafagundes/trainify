/* ═══════════════════════════════════════════
   Big Switcher — Seletor de Visualização
   Componente estilo toggle grande para alternar entre visualizações
   ═══════════════════════════════════════════ */

import { Icone } from "@/interface/widget/svg/Icone";

interface OpcaoSwitcher {
  id: string;
  label: string;
  icone: string;
}

interface BigSwitcherProps {
  opcoes: OpcaoSwitcher[];
  valorSelecionado: string;
  aoAlterar: (valor: string) => void;
}

export function BigSwitcher({
  opcoes,
  valorSelecionado,
  aoAlterar,
}: BigSwitcherProps) {
  return (
    <div className="bg-superficie-hover border border-borda rounded-2xl p-1.5">
      <div className="flex gap-1.5">
        {opcoes.map((opcao) => {
          const selecionado = valorSelecionado === opcao.id;

          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoAlterar(opcao.id)}
              className={`
                flex flex-1 items-center justify-center gap-1.5
                px-2 py-2.5 min-h-[44px] rounded-xl
                text-[13px] sm:text-sm font-medium transition-all duration-200
                ${
                  selecionado
                    ? "bg-superficie text-texto-primario shadow-sm ring-1 ring-borda/70"
                    : "text-texto-secundario hover:text-texto-primario hover:bg-superficie/50"
                }
              `}
              aria-pressed={selecionado}
            >
              <Icone nome={opcao.icone} tamanho={16} />
              <span className="truncate">{opcao.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
