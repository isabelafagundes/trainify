import type { ReactNode } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesLinkCabecalho {
  children: ReactNode;
  aoClicar?: () => void;
  icone?: string;
}

/**
 * Link de cabeçalho — integração natural
 * Aparece como uma opção adicional no topo, sem chamar atenção
 * Estilo Notion-like: parte da interface, não um destaque
 */
export function LinkCabecalho({
  children,
  aoClicar,
  icone,
}: PropriedadesLinkCabecalho) {
  return (
    <button
      onClick={aoClicar}
      className="
        flex items-center gap-1.5
        text-xs text-texto-sutil/60
        hover:text-texto-secundario
        transition-colors duration-200 ease-out
        py-1 px-2 -mx-2 rounded
        hover:bg-superficie-suave/50
      "
    >
      {icone && <Icone nome={icone} tamanho={14} />}
      <span>{children}</span>
    </button>
  );
}
