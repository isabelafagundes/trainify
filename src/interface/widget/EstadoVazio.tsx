import type { ReactNode } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesEstadoVazio {
  icone?: string;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

/** Placeholder para estados sem conteúdo */
export function EstadoVazio({ icone, titulo, descricao, acao }: PropriedadesEstadoVazio) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center fade-in">
      {icone && (
        <div className="mb-4 text-texto-secundario transition-all duration-300 hover:scale-110 hover:text-texto-primario">
          <Icone nome={icone} tamanho={48} />
        </div>
      )}
      <h3 className="text-base font-semibold text-texto-primario mb-2 transition-colors duration-200">
        {titulo}
      </h3>
      <p className="text-sm text-texto-secundario mb-6 max-w-[260px] transition-opacity duration-200">
        {descricao}
      </p>
      {acao && (
        <div className="transition-all duration-300 hover:scale-105">
          {acao}
        </div>
      )}
    </div>
  );
}
