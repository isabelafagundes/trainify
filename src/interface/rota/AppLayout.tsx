/* Shell da área logada: cabeçalho fixo + <main> rolável
   + navegação inferior. Substitui os ternários do App.tsx
   por um layout único com <Outlet/>. */

import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior } from "@/interface/widget/menu-lateral/NavegacaoInferior";
import { NavegacaoLateral } from "@/interface/widget/menu-lateral/NavegacaoLateral";
import { Icone } from "@/interface/widget/svg/Icone";
import { useDados } from "./DadosProvider";
import {
  abaDoCaminho,
  construirCaminho,
  ehRotaSemNav,
  ehTabRaiz,
  tituloDoCaminho,
} from "./rotas";

export function AppLayout() {
  const { usuario } = useDados();
  const location = useLocation();
  const navigate = useNavigate();

  const semNav = ehRotaSemNav(location.pathname);
  const tabRaiz = ehTabRaiz(location.pathname);
  const titulo = tituloDoCaminho(location.pathname);

  // Drawer de preferências: estado de UI subido para cá porque, no desktop, o
  // gatilho passa a ficar na barra lateral (cabeçalho some); no mobile/tablet
  // o gatilho continua no cabeçalho. Um único drawer controla os dois.
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    // Shell que NÃO rola (altura travada na viewport). No desktop (lg+) a
    // navegação vira uma barra lateral à esquerda; no mobile/tablet, header e
    // pill inferior ficam fixos por cima e apenas <main> rola por baixo deles —
    // evita o bug de position:fixed + backdrop-filter no WebView do Android.
    <div className="flex h-[100dvh] overflow-hidden">
      <NavegacaoLateral
        abaAtiva={abaDoCaminho(location.pathname)}
        aoMudarAba={(aba) => navigate(construirCaminho(aba))}
        nomeUsuario={usuario?.nome}
        avatarEmoji={usuario?.avatarEmoji}
        aoAbrirPerfil={() => setMenuAberto(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CabecalhoApp
          tituloTela={titulo}
          nomeUsuario={usuario?.nome}
          avatarEmoji={usuario?.avatarEmoji}
          onBack={tabRaiz ? undefined : () => navigate(-1)}
          menuAberto={menuAberto}
          aoAbrirMenu={() => setMenuAberto(true)}
          aoFecharMenu={() => setMenuAberto(false)}
        />

        <main
          className={`min-h-0 flex-1 overflow-y-auto pt-[calc(max(var(--safe-top),8px)+68px)] lg:pt-4 ${
            semNav
              ? "pb-[calc(var(--safe-bottom)+24px)]"
              : "pb-[calc(var(--safe-bottom)+116px)] lg:pb-12"
          }`}
        >
          {/* Container de leitura: largura confortável e centralizada em telas largas.
              (max-w em px explícito — o nome "3xl" colide com --spacing-3xl do @theme.) */}
          <div className="mx-auto w-full max-w-[768px]">
            {/* Título da página no topo do conteúdo (desktop): substitui a barra
                superior, que fica oculta em lg+. Inclui voltar nas subtelas. */}
            <div className="hidden lg:flex items-center gap-3 px-4 pb-3 pt-2">
              {!tabRaiz && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Voltar"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-superficie-suave text-texto-secundario transition-colors duration-150 hover:bg-superficie-hover hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
                >
                  <Icone nome="setaEsquerda" tamanho={16} />
                </button>
              )}
              <h1 className="font-display text-2xl font-bold tracking-tight text-texto-primario">
                {titulo}
              </h1>
            </div>
            <Outlet />
          </div>
        </main>

        {!semNav && (
          <NavegacaoInferior
            abaAtiva={abaDoCaminho(location.pathname)}
            aoMudarAba={(aba) => navigate(construirCaminho(aba))}
          />
        )}
      </div>
    </div>
  );
}
