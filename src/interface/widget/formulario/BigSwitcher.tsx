/* ═══════════════════════════════════════════
   Big Switcher — Seletor de Visualização
   Componente estilo toggle grande para alternar entre visualizações
   ═══════════════════════════════════════════ */

import type { KeyboardEvent } from "react";
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
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, indiceAtual: number) {
    const ultimaOpcao = opcoes.length - 1;
    let proximoIndice: number | null = null;

    if (event.key === "ArrowRight") {
      proximoIndice = indiceAtual === ultimaOpcao ? 0 : indiceAtual + 1;
    }
    if (event.key === "ArrowLeft") {
      proximoIndice = indiceAtual === 0 ? ultimaOpcao : indiceAtual - 1;
    }
    if (event.key === "Home") {
      proximoIndice = 0;
    }
    if (event.key === "End") {
      proximoIndice = ultimaOpcao;
    }

    if (proximoIndice === null) return;

    event.preventDefault();
    aoAlterar(opcoes[proximoIndice].id);

    const abas = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    requestAnimationFrame(() => abas?.[proximoIndice]?.focus());
  }

  return (
    <div className="bg-superficie-hover border border-borda rounded-2xl p-1.5">
      <div className="flex gap-1.5" role="tablist" aria-label="Visualização de gerenciamento">
        {opcoes.map((opcao, indice) => {
          const selecionado = valorSelecionado === opcao.id;

          return (
            <button
              key={opcao.id}
              type="button"
              role="tab"
              aria-selected={selecionado}
              tabIndex={selecionado ? 0 : -1}
              onClick={() => aoAlterar(opcao.id)}
              onKeyDown={(event) => handleKeyDown(event, indice)}
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
