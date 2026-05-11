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
    <div className="bg-superficie-suave rounded-2xl p-1 sm:p-1.5">
      <div className="flex gap-1.5 sm:gap-2">
        {opcoes.map((opcao) => {
          const selecionado = valorSelecionado === opcao.id;

          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoAlterar(opcao.id)}
              className={`
                flex items-center justify-center gap-1.5 sm:gap-2
                px-2.5 py-2.5 sm:px-4 sm:py-3 rounded-xl
                font-medium text-sm sm:text-base transition-all duration-200
                flex-1 sm:flex-none
                ${
                  selecionado
                    ? "bg-superficie text-texto-primario shadow-sm"
                    : "text-texto-secundario hover:text-texto-primario hover:bg-superficie/60"
                }
              `}
              aria-label={opcao.label}
            >
              <Icone nome={opcao.icone as any} tamanho={18} />
              {!selecionado && (
                <span className="hidden sm:inline">{opcao.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
