/* Shim de navegação: entrega às páginas o mesmo par
   aoNavegar/aoVoltar que elas já esperam, agora sobre
   o React Router. */

import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { construirCaminho, type ParamsRota } from "./rotas";

export type OpcoesNavegacao = {
  substituir?: boolean;
};

/** Editores apresentados como drawer (sobre a tela anterior) em telas largas. */
const DESTINOS_DRAWER = new Set([
  "criarPrograma",
  "editarPrograma",
  "criarFicha",
  "editarFicha",
]);

export function useNavegar() {
  const navigate = useNavigate();
  const location = useLocation();

  const aoNavegar = useCallback(
    (destino: string, params?: ParamsRota, opcoes?: OpcoesNavegacao) => {
      // Ao abrir um editor, guardamos a rota atual como "fundo" para que a
      // tela anterior continue renderizada atrás do drawer (no md+). Em
      // transições editor→editor, herdamos o mesmo fundo.
      const herdado = (location.state as { background?: unknown } | null)?.background;
      const state = DESTINOS_DRAWER.has(destino)
        ? { background: herdado ?? location }
        : undefined;
      navigate(construirCaminho(destino, params), {
        replace: opcoes?.substituir,
        state,
      });
    },
    [navigate, location]
  );

  const aoVoltar = useCallback(() => navigate(-1), [navigate]);

  return { aoNavegar, aoVoltar };
}
