import { AVATAR_EMOJI_PADRAO } from "@/domain/usuario";
import { Icone } from "@/interface/widget/svg/Icone";
import { ABAS, type AbaNavegacao } from "./NavegacaoInferior";

interface PropriedadesNavegacaoLateral {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  nomeUsuario?: string;
  avatarEmoji?: string;
  aoAbrirPerfil?: () => void;
}

/**
 * Navegação principal em barra lateral — visível apenas no desktop (lg+).
 * Reaproveita exatamente a config de abas (ABAS) e o handler aoMudarAba
 * da navegação inferior; é só uma apresentação alternativa para telas largas.
 * No rodapé fica o acesso ao perfil/preferências (mesmo drawer do cabeçalho).
 */
export function NavegacaoLateral({
  abaAtiva,
  aoMudarAba,
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
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              role="tab"
              aria-selected={ativa}
              aria-label={aba.rotulo}
              onClick={() => aoMudarAba(aba.id)}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5
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
