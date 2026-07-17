import type { ReactNode } from "react";

interface PropriedadesCartaoEstatistica {
  /** Valor em destaque (número ou texto curto, ex: "há 2d") */
  valor: ReactNode;
  /** Rótulo descritivo abaixo do valor */
  rotulo: string;
}

/**
 * Célula de estatística usada na grade de resumo do programa.
 * Número grande em fonte display + rótulo sutil.
 */
export function CartaoEstatistica({ valor, rotulo }: PropriedadesCartaoEstatistica) {
  return (
    <div className="rounded-2xl border border-borda bg-superficie px-4 py-3">
      <p className="text-xl font-bold text-texto-primario font-display tabular-nums leading-none">
        {valor}
      </p>
      <p className="mt-1.5 text-xs text-texto-sutil leading-tight">{rotulo}</p>
    </div>
  );
}
