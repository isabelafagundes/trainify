/* Shim de navegação: entrega às páginas o mesmo par
   aoNavegar/aoVoltar que elas já esperam, agora sobre
   o React Router. */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { construirCaminho, type ParamsRota } from "./rotas";

export type OpcoesNavegacao = {
  substituir?: boolean;
};

export function useNavegar() {
  const navigate = useNavigate();

  const aoNavegar = useCallback(
    (destino: string, params?: ParamsRota, opcoes?: OpcoesNavegacao) => {
      navigate(construirCaminho(destino, params), { replace: opcoes?.substituir });
    },
    [navigate]
  );

  const aoVoltar = useCallback(() => navigate(-1), [navigate]);

  return { aoNavegar, aoVoltar };
}
