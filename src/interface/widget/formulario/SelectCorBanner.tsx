/* ═══════════════════════════════════════════
   Seletor de Cor do Banner — Programas
   ═══════════════════════════════════════════ */

import type { CorBanner } from "@/domain/tipos";

interface SelectCorBannerProps {
  valor: CorBanner | null;
  aoAlterar: (cor: CorBanner | null) => void;
}

const CORES: { valor: CorBanner; nome: string; classe: string }[] = [
  {
    valor: "azul",
    nome: "Azul",
    classe: "bg-[oklch(0.52_0.10_250)]",
  },
  {
    valor: "verde",
    nome: "Verde",
    classe: "bg-[oklch(0.52_0.10_155)]",
  },
  {
    valor: "roxo",
    nome: "Roxo",
    classe: "bg-[oklch(0.50_0.10_300)]",
  },
  {
    valor: "laranja",
    nome: "Laranja",
    classe: "bg-[oklch(0.55_0.12_55)]",
  },
  {
    valor: "rosa",
    nome: "Rosa",
    classe: "bg-[oklch(0.52_0.10_350)]",
  },
  {
    valor: "vermelho",
    nome: "Vermelho",
    classe: "bg-[oklch(0.50_0.11_25)]",
  },
  {
    valor: "amarelo",
    nome: "Amarelo",
    classe: "bg-[oklch(0.55_0.11_85)]",
  },
  {
    valor: "ciano",
    nome: "Ciano",
    classe: "bg-[oklch(0.52_0.08_210)]",
  },
  {
    valor: "indigo",
    nome: "Indigo",
    classe: "bg-[oklch(0.50_0.11_280)]",
  },
];

export function SelectCorBanner({ valor, aoAlterar }: SelectCorBannerProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-texto-primario">
        Cor do banner
      </label>

      <div className="grid grid-cols-5 gap-2">
        {CORES.map((cor) => (
          <button
            key={cor.valor}
            type="button"
            onClick={() => aoAlterar(cor.valor)}
            aria-label={`Selecionar cor ${cor.nome}`}
            className={`
              relative w-full aspect-square
              ${cor.classe}
              rounded-lg
              transition-all duration-200 ease-out
              hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-acento focus:ring-offset-2
              ${valor === cor.valor ? "ring-2 ring-offset-2 ring-acento" : ""}
            `}
          >
            {valor === cor.valor && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}

        {/* Opção "nenhum" */}
        <button
          type="button"
          onClick={() => aoAlterar(null)}
          aria-label="Sem cor"
          className={`
            relative w-full aspect-square
            bg-superficie border border-borda
            rounded-lg
            transition-all duration-200 ease-out
            hover:scale-105 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-acento focus:ring-offset-2
            ${valor === null ? "ring-2 ring-offset-2 ring-acento" : ""}
          `}
        >
          <span className="absolute inset-0 flex items-center justify-center text-texto-sutil text-lg">
            ✕
          </span>
        </button>
      </div>

      <p className="text-xs text-texto-secundario">
        {valor ? `Cor selecionada: ${CORES.find((c) => c.valor === valor)?.nome}` : "Sem cor"}
      </p>
    </div>
  );
}
