import { Icone } from "@/interface/widget/svg/Icone";

type AbaNavegacao = "treinos" | "historico" | "estatisticas" | "gerenciar";

interface PropriedadesNavegacaoInferior {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  aoCriarPrograma?: () => void;
}

const abasEsquerda: { id: AbaNavegacao; rotulo: string; icone: string }[] = [
  { id: "treinos", rotulo: "Treinos", icone: "halter" },
  { id: "historico", rotulo: "Histórico", icone: "grafico" },
];

const abasDireita: { id: AbaNavegacao; rotulo: string; icone: string }[] = [
  { id: "estatisticas", rotulo: "Estatísticas", icone: "tendencia" },
  { id: "gerenciar", rotulo: "Gerenciar", icone: "engrenagem" },
];

export type { AbaNavegacao };

export function NavegacaoInferior({ abaAtiva, aoMudarAba, aoCriarPrograma }: PropriedadesNavegacaoInferior) {
  const renderizarAba = (aba: { id: AbaNavegacao; rotulo: string; icone: string }) => {
    const ativa = abaAtiva === aba.id;
    return (
      <button
        key={aba.id}
        role="tab"
        aria-selected={ativa}
        aria-label={aba.rotulo}
        onClick={() => aoMudarAba(aba.id)}
        className={`
          flex-1 flex flex-col items-center justify-center gap-0.5
          pt-2 pb-1 min-h-[52px]
          transition-colors duration-150 ease-out
          cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acento
          ${ativa
            ? "text-texto-primario"
            : "text-texto-sutil hover:text-texto-secundario"
          }
        `}
      >
        <Icone nome={aba.icone} tamanho={22} />
        <span className={`text-[11px] leading-tight ${ativa ? "font-semibold" : "font-medium"}`}>
          {aba.rotulo}
        </span>
        {ativa && (
          <div className="w-1 h-1 rounded-full bg-acento mt-0.5" />
        )}
      </button>
    );
  };

  return (
    <nav
      className="
        fixed bottom-0 left-5 right-5 z-50
        bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
        border border-borda-suave/60
        mb-[max(env(safe-area-inset-bottom),16px)]
        rounded-2xl
        shadow-md shadow-black/[0.04]
      "
      role="tablist"
      aria-label="Navegação principal"
    >
      <div className="max-w-[480px] mx-auto flex items-stretch">
        {abasEsquerda.map(renderizarAba)}

        {/* Botão central de adição */}
        <div className="flex flex-col items-center justify-center px-2 flex-1 min-w-[64px]">
          <button
            type="button"
            aria-label="Criar novo programa de treino"
            onClick={aoCriarPrograma}
            className="
              w-[52px] h-[52px] -mt-[26px] relative
              flex items-center justify-center
              rounded-full
              bg-acento text-texto-invertido
              shadow-md shadow-acento/20
              transition-all duration-200 ease-out
              hover:bg-acento-hover hover:shadow-lg hover:shadow-acento/25 hover:-mt-[28px]
              active:scale-95 active:mt-[26px]
              cursor-pointer
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
            "
          >
            <Icone nome="mais" tamanho={24} />
          </button>
          <span className="text-[10px] font-semibold text-acento tracking-wide mt-0.5">
            Novo
          </span>
        </div>

        {abasDireita.map(renderizarAba)}
      </div>
    </nav>
  );
}
