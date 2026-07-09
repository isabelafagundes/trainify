import { AVATAR_EMOJI_PADRAO } from "@/domain/usuario";
import { Icone } from "@/interface/widget/svg/Icone";
import { ABAS, type AbaNavegacao } from "./NavegacaoInferior";
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
 * Reaproveita a config de abas (ABAS) e o handler aoMudarAba da navegação
 * inferior. A aba "Programas" (id "gerenciar") é a casa da seção de
 * gerenciamento; quando ativa, expande em Fichas / Exercícios (as bibliotecas),
 * espelhando o rodapé "Bibliotecas" do mobile.
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

  return (
    <aside
      className="
        hidden lg:flex w-60 shrink-0 flex-col
        border-r border-borda-suave/70 bg-superficie/40
        px-3 pt-[max(var(--safe-top),24px)] pb-[max(var(--safe-bottom),20px)]
      "
    >
      {/* Marca */}
      <div className="flex items-center gap-1.5 px-3 pb-6 pt-2">
        <span className="font-display text-lg font-bold tracking-tight text-texto-primario">
          Pezzo
        </span>
      </div>

      <nav role="tablist" aria-label="Navegação principal" className="flex flex-col gap-1">
        {ABAS.map((aba) => {
          const secaoGerenciar = aba.id === "gerenciar";
          // A aba "Programas" só fica destacada quando estamos na home da seção
          // (/gerenciar exato); nas bibliotecas quem destaca é o sub-item.
          const ativa = secaoGerenciar
            ? caminhoAtual === ROTAS.gerenciar
            : abaAtiva === aba.id;

          return (
            <div key={aba.id}>
              <button
                role="tab"
                aria-selected={ativa}
                aria-label={aba.rotulo}
                onClick={() => aoMudarAba(aba.id)}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                  text-sm transition-colors duration-150 ease-out cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
                  ${ativa
                    ? "bg-acento-suave text-texto-primario font-semibold"
                    : "text-texto-secundario font-medium hover:bg-superficie-suave hover:text-texto-primario"
                  }
                `}
              >
                <Icone nome={aba.icone} tamanho={20} />
                <span>{aba.rotulo}</span>
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
                            ? "bg-acento-suave text-texto-primario font-semibold"
                            : "text-texto-secundario font-medium hover:bg-superficie-suave hover:text-texto-primario"
                          }
                        `}
                      >
                        <Icone nome={sub.icone} tamanho={16} />
                        <span>{sub.rotulo}</span>
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
          className="
            mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left
            transition-colors duration-150 cursor-pointer
            hover:bg-superficie-suave
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
          "
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-acento-suave text-lg ring-[1.5px] ring-borda-suave">
            {emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-texto-primario">
              {nomeUsuario}
            </span>
            <span className="block text-xs text-texto-sutil">Preferências</span>
          </span>
        </button>
      )}
    </aside>
  );
}
