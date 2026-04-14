import type { ReactNode } from "react";

interface PropriedadesCabecalhoTela {
  titulo: string;
  acaoDireita?: ReactNode;
}

/** Header de tela com título e ação opcional à direita */
export function CabecalhoTela({ titulo, acaoDireita }: PropriedadesCabecalhoTela) {
  return (
    <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
      <h1 className="text-2xl font-bold text-texto-primario tracking-tight font-display">
        {titulo}
      </h1>
      {acaoDireita}
    </header>
  );
}
