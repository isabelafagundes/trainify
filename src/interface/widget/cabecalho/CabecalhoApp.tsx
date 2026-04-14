import type { ReactNode } from "react";
import { Icone } from "@/interface/widget/svg/Icone";
import avatarImg from "@/assets/avatar.jpg";

interface PropriedadesCabecalhoApp {
  tituloTela: string;
  acaoDireita?: ReactNode;
  onBack?: () => void;
  nomeUsuario?: string;
}

export function CabecalhoApp({ tituloTela, acaoDireita, onBack, nomeUsuario }: PropriedadesCabecalhoApp) {
  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),8px)] pb-1">
      <header className="
        flex items-center justify-between gap-3
        px-4 py-3
        bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
        border border-borda-suave/60
        rounded-2xl
        shadow-md shadow-black/[0.04]
      ">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-superficie-suave flex items-center justify-center text-texto-secundario hover:bg-superficie-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento transition-all duration-150"
            >
              <Icone nome="setaEsquerda" tamanho={16} />
            </button>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-bold text-texto-sutil uppercase tracking-[0.08em] font-display flex-shrink-0">
              Trainify
            </span>
            <span className="text-texto-sutil/30 text-[10px] flex-shrink-0">/</span>
            <h1 className="text-sm font-semibold text-texto-primario tracking-tight font-display truncate">
              {tituloTela}
            </h1>
          </div>
        </div>
        {nomeUsuario ? (
          <button
            className="
              flex-shrink-0 relative group cursor-pointer
              p-1 -m-1
              rounded-full
              active:scale-[0.95]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
              transition-transform duration-150
            "
            aria-label={`Perfil de ${nomeUsuario}`}
          >
            <img
              src={avatarImg}
              alt={nomeUsuario}
              className="w-8 h-8 rounded-full object-cover ring-[1.5px] ring-borda-suave group-hover:ring-acento/30 transition-all duration-200"
            />
            <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-acento ring-[1.5px] ring-superficie" />
          </button>
        ) : (
          acaoDireita
        )}
      </header>
    </div>
  );
}
