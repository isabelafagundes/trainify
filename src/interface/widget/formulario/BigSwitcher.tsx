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
    <div className="flex bg-superficie-suave rounded-2xl p-1.5 gap-2">
      {opcoes.map((opcao) => {
        const selecionado = valorSelecionado === opcao.id;

        return (
          <button
            key={opcao.id}
            type="button"
            onClick={() => aoAlterar(opcao.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              font-medium text-base transition-all duration-200
              ${
                selecionado
                  ? "bg-superficie text-texto-primario shadow-sm"
                  : "text-texto-secundario hover:text-texto-primario hover:bg-superficie/60"
              }
            `}
          >
            <Icone nome={opcao.icone as any} tamanho={18} />
            <span>{opcao.label}</span>
          </button>
        );
      })}
    </div>
  );
}
