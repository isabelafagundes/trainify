import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesSugestaoAcao {
  icone?: string;
  titulo: string;
  descricao?: string;
  textoBotao: string;
  aoClicar: () => void;
  variante?: "destaque" | "suave";
}

/**
 * Card de sugestão de ação para incentivar comportamentos específicos
 * Estilo Notion-like: clean, minimalista, com foco na mensagem
 */
export function SugestaoAcao({
  icone,
  titulo,
  descricao,
  textoBotao,
  aoClicar,
  variante = "suave",
}: PropriedadesSugestaoAcao) {
  const estilosVariante = {
    destaque: "bg-superficie border border-borda",
    suave: "bg-superficie-suave border border-borda-suave",
  };

  const estilosBotao = {
    destaque: "bg-acento text-texto-invertido hover:bg-acento-hover",
    suave: "bg-superficie text-texto-secundario border border-borda hover:bg-superficie-hover hover:text-texto-primario",
  };

  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-3.5 rounded-[12px]
        transition-all duration-200 ease-out
        ${estilosVariante[variante]}
        hover:shadow-sm
      `}
    >
      {/* Ícone decorativo */}
      {icone && (
        <div className="flex-shrink-0 text-texto-sutil">
          <Icone nome={icone} tamanho={22} />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-texto-primario leading-tight">
          {titulo}
        </p>
        {descricao && (
          <p className="text-xs text-texto-secundario mt-0.5 leading-snug">
            {descricao}
          </p>
        )}
      </div>

      {/* Botão de ação */}
      <button
        onClick={aoClicar}
        className={`
          flex-shrink-0 px-3 py-1.5 rounded-[8px]
          text-xs font-medium
          transition-all duration-150 ease-out
          active:scale-[0.95]
          ${estilosBotao[variante]}
        `}
      >
        {textoBotao}
      </button>
    </div>
  );
}
