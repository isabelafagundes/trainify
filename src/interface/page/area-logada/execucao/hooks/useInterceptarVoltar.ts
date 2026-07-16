/* ═══════════════════════════════════════════
   Intercepta o "voltar" durante a execução.
   ───────────────────────────────────────────
   A execução é tela cheia sem botão de voltar próprio: abandonar o treino
   mora no kebab e pede confirmação. O gesto de "voltar" (back do navegador e
   botão físico do Android — que dispara popstate via navigate(-1)) saía direto
   pra home, sem confirmação e sem encerrar a sessão.

   Enquanto `ativo`, mantemos uma entrada-sentinela no history: cada "voltar"
   consome a sentinela, nós a repomos (segurando o usuário na tela) e chamamos
   `aoInterceptar` — que abre a mesma confirmação do kebab. Some sozinho quando
   `ativo` vira falso ou no desmonte.
   ═══════════════════════════════════════════ */

import { useEffect, useRef } from "react";

export function useInterceptarVoltar(ativo: boolean, aoInterceptar: () => void) {
  // Ref pra o popstate sempre enxergar o callback (e o estado) mais recente.
  const callbackRef = useRef(aoInterceptar);
  callbackRef.current = aoInterceptar;

  useEffect(() => {
    if (!ativo) return;

    // Duplicamos o state atual do React Router (idx/key) pra não confundir a
    // reconciliação dele ao repor a sentinela.
    window.history.pushState(window.history.state, "");

    const aoVoltar = () => {
      window.history.pushState(window.history.state, "");
      callbackRef.current();
    };

    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, [ativo]);
}
