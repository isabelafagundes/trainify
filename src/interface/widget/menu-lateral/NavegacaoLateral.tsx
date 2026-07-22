import { AVATAR_EMOJI_PADRAO } from "@/domain/usuario";
import { Icone } from "@/interface/widget/svg/Icone";
import { ABAS, type AbaNavegacao } from "./NavegacaoInferior";
import { useSidebarRecolhida } from "./useSidebarRecolhida";
import { ROTAS } from "@/interface/rota/rotas";

interface PropriedadesNavegacaoLateral {
  abaAtiva: AbaNavegacao;
  /** Caminho atual — distingue Programas / Fichas / Exercícios dentro da seção. */
  caminhoAtual: string;
  aoMudarAba: (aba: AbaNavegacao) => void;
  /** Navega para um caminho literal (sub-itens da seção Programas). */
  aoIrPara: (caminho: string) => void;
  nomeUsuario?: string;
  avatarEmoji?: string;
  aoAbrirPerfil?: () => void;
}

/** Sub-itens (bibliotecas) aninhados sob "Programas" no desktop. */
const SUBITENS_PROGRAMAS = [
  { rotulo: "Fichas", icone: "halter", caminho: ROTAS.gerenciarFichas },
  { rotulo: "Exercícios", icone: "alvo", caminho: ROTAS.gerenciarExercicios },
];

/**
 * Navegação principal em barra lateral — visível apenas no desktop (lg+).
 * Herda a linguagem da navegação inferior do mobile: casca de pill flutuante
 * (glass, cantos arredondados, margem em vez de encostar na borda) e ativo por
 * dot + cor/peso, em vez de fundo preenchido. Reaproveita a config de abas
 * (ABAS) e o handler aoMudarAba.
 *
 * Recolhível: por padrão vem expandida (marca + labels); um botão no rodapé a
 * minimiza para só ícones — e, recolhida, cada item vira ícone + dot embaixo,
 * espelhando a bottom bar. Estado persistido via useSidebarRecolhida.
 *
 * A aba "Programas" (id "gerenciar") é a casa da seção de gerenciamento;
 * expandida e ativa, revela Fichas / Exercícios (as bibliotecas). Recolhida, a
 * sub-árvore some e o próprio ícone de Programas acende em qualquer sub-rota da
 * seção, para não perder o indicador de localização.
 */
export function NavegacaoLateral({
  abaAtiva,
  caminhoAtual,
  aoMudarAba,
  aoIrPara,
  nomeUsuario,
  avatarEmoji,
  aoAbrirPerfil,
}: PropriedadesNavegacaoLateral) {
  const emoji = avatarEmoji || AVATAR_EMOJI_PADRAO;
  const [recolhida, alternarRecolhida] = useSidebarRecolhida();

  return (
    // Wrapper com margem: a barra "flutua" como a pill inferior do mobile,
    // em vez de encostar na borda da viewport.
    <div className="hidden lg:flex shrink-0 p-4">
      <aside
        className={`
          flex h-full flex-col
          bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
          border border-borda-suave/60
          rounded-[20px]
          shadow-md shadow-black/[0.04]
          px-2.5 py-4
          transition-[width] duration-200 ease-out
          ${recolhida ? "w-[76px]" : "w-56"}
        `}
      >
        {/* Marca */}
        <div
          className={`flex items-center gap-2 pb-4 pt-0.5 ${
            recolhida ? "justify-center px-0" : "px-2"
          }`}
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white p-1 shadow-sm">
              <img src="/kynori-mark-black.png" alt="" className="h-full w-full object-contain" />
            </span>
          {!recolhida && (
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-texto-primario">
              Kynori
            </span>
          )}
        </div>

        <nav role="tablist" aria-label="Navegação principal" className="flex flex-col gap-1">
          {ABAS.map((aba) => {
            const secaoGerenciar = aba.id === "gerenciar";
            // Expandida: a aba "Programas" só destaca na home exata da seção
            // (/gerenciar); nas bibliotecas quem destaca é o sub-item.
            // Recolhida: como a sub-árvore some, o ícone acende na seção inteira.
            const ativa = secaoGerenciar
              ? recolhida
                ? abaAtiva === "gerenciar"
                : caminhoAtual === ROTAS.gerenciar
              : abaAtiva === aba.id;

            if (recolhida) {
              // Recolhida: espelha a bottom bar (ícone + dot embaixo, centralizado).
              return (
                <button
                  key={aba.id}
                  role="tab"
                  aria-selected={ativa}
                  aria-label={aba.rotulo}
                  title={aba.rotulo}
                  onClick={() => aoMudarAba(aba.id)}
                  className={`
                    flex flex-col items-center justify-center gap-1 rounded-xl py-2
                    transition-colors duration-150 ease-out cursor-pointer
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
                    ${ativa
                      ? "text-texto-primario"
                      : "text-texto-sutil hover:text-texto-secundario"
                    }
                  `}
                >
                  <Icone nome={aba.icone} tamanho={23} />
                  <span
                    className={`h-1 w-1 rounded-full ${ativa ? "bg-acento" : "bg-transparent"}`}
                  />
                </button>
              );
            }

            // Expandida: linha legível, dot logo após o label (não flutua na borda).
            return (
              <div key={aba.id}>
                <button
                  role="tab"
                  aria-selected={ativa}
                  aria-label={aba.rotulo}
                  onClick={() => aoMudarAba(aba.id)}
                  className={`
                    flex h-11 w-full items-center gap-3 rounded-xl px-3.5
                    text-sm transition-colors duration-150 ease-out cursor-pointer
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
                    ${ativa
                      ? "text-texto-primario font-semibold"
                      : "text-texto-secundario font-medium hover:text-texto-primario"
                    }
                  `}
                >
                  <Icone nome={aba.icone} tamanho={22} />
                  <span className="flex items-center gap-1.5">
                    <span>{aba.rotulo}</span>
                    <span
                      className={`h-[5px] w-[5px] rounded-full ${ativa ? "bg-acento" : "bg-transparent"}`}
                    />
                  </span>
                </button>

                {/* Bibliotecas aninhadas — visíveis quando a seção está ativa. */}
                {secaoGerenciar && abaAtiva === "gerenciar" && (
                  <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-borda pl-3">
                    {SUBITENS_PROGRAMAS.map((sub) => {
                      const subAtivo = caminhoAtual === sub.caminho;
                      return (
                        <button
                          key={sub.caminho}
                          onClick={() => aoIrPara(sub.caminho)}
                          aria-current={subAtivo ? "page" : undefined}
                          className={`
                            flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2
                            text-[13px] transition-colors duration-150 cursor-pointer
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
                            ${subAtivo
                              ? "text-texto-primario font-semibold"
                              : "text-texto-secundario font-medium hover:text-texto-primario"
                            }
                          `}
                        >
                          <Icone nome={sub.icone} tamanho={16} />
                          <span className="flex items-center gap-1.5">
                            <span>{sub.rotulo}</span>
                            <span
                              className={`h-1 w-1 rounded-full ${subAtivo ? "bg-acento" : "bg-transparent"}`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Perfil / preferências — abre o mesmo drawer do cabeçalho */}
        {nomeUsuario && (
          <button
            type="button"
            onClick={aoAbrirPerfil}
            aria-label={`Perfil de ${nomeUsuario}`}
            title={recolhida ? nomeUsuario : undefined}
            className={`
              mt-auto flex items-center gap-3 rounded-xl py-2.5 text-left
              transition-colors duration-150 cursor-pointer
              hover:bg-superficie-suave
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
              ${recolhida ? "justify-center px-0" : "px-3"}
            `}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-acento-suave text-lg ring-[1.5px] ring-borda-suave">
              {emoji}
            </span>
            {!recolhida && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-texto-primario">
                  {nomeUsuario}
                </span>
                <span className="block text-xs text-texto-sutil">Preferências</span>
              </span>
            )}
          </button>
        )}

        {/* Recolher / expandir */}
        <div className="mt-2 border-t border-borda-suave/70 pt-2">
          <button
            type="button"
            onClick={alternarRecolhida}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!recolhida}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
            className={`
              flex h-10 w-full items-center gap-2.5 rounded-xl
              text-[13px] font-medium text-texto-sutil
              transition-colors duration-150 cursor-pointer
              hover:bg-superficie-suave hover:text-texto-secundario
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
              ${recolhida ? "justify-center px-0" : "px-3.5"}
            `}
          >
            <Icone nome={recolhida ? "setaDireita" : "setaEsquerda"} tamanho={18} />
            {!recolhida && <span>Recolher</span>}
          </button>
        </div>
      </aside>
    </div>
  );
}
