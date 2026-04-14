import type { ReactNode } from "react";

interface PropriedadesDicaRodape {
  children: ReactNode;
  aoClicar?: () => void;
  variante?: "centro" | "esquerda";
}

/**
 * Dica de rodapé — máxima sutileza
 * Um lembrete ainda mais discreto, integrado ao fluxo da página
 * Não interrompe, não pressiona — apenas informa
 */
export function DicaRodape({
  children,
  aoClicar,
  variante = "centro",
}: PropriedadesDicaRodape) {
  return (
    <div
      className={`
        ${variante === "centro" ? "text-center" : "text-left"}
        py-4
      `}
    >
      <button
        onClick={aoClicar}
        className="
          text-xs text-texto-sutil/50
          hover:text-texto-sutil
          transition-colors duration-200 ease-out
          underline decoration-texto-sutil/20 hover:decoration-texto-sutil/40
          underline-offset-2
        "
      >
        {children}
      </button>
    </div>
  );
}
