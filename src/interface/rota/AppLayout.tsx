/* Shell da área logada: cabeçalho fixo + <main> rolável
   + navegação inferior. Substitui os ternários do App.tsx
   por um layout único com <Outlet/>. */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior } from "@/interface/widget/menu-lateral/NavegacaoInferior";
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

  return (
    // Shell que NÃO rola (altura travada na viewport). Header e nav ficam
    // fixos por cima e apenas <main> rola por baixo deles — evita o bug de
    // position:fixed + backdrop-filter no WebView do Android.
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <CabecalhoApp
        tituloTela={tituloDoCaminho(location.pathname)}
        nomeUsuario={usuario?.nome}
        avatarEmoji={usuario?.avatarEmoji}
        onBack={tabRaiz ? undefined : () => navigate(-1)}
      />

      <main
        className={`min-h-0 flex-1 overflow-y-auto pt-[calc(max(var(--safe-top),8px)+68px)] ${
          semNav
            ? "pb-[calc(var(--safe-bottom)+24px)]"
            : "pb-[calc(var(--safe-bottom)+116px)]"
        }`}
      >
        <Outlet />
      </main>

      {!semNav && (
        <NavegacaoInferior
          abaAtiva={abaDoCaminho(location.pathname)}
          aoMudarAba={(aba) => navigate(construirCaminho(aba))}
        />
      )}
    </div>
  );
}
