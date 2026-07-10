/* ═══════════════════════════════════════════
   Guarda de saída — protege contra perder alterações não salvas.

   Os editores (ficha/programa) só persistem no "Salvar". Ao fechar com
   edições pendentes, interceptamos a saída e pedimos confirmação. Sem
   alterações, a saída é imediata (sem modal desnecessário).
   ═══════════════════════════════════════════ */

import { useCallback, useState } from "react";

export interface GuardaSaida {
  /** Verdadeiro enquanto o modal de confirmação está aberto. */
  confirmando: boolean;
  /**
   * Tenta executar uma saída (ex.: `aoVoltar`). Se houver alterações não
   * salvas, guarda a ação e abre a confirmação; caso contrário, executa já.
   */
  solicitarSaida: (sair: () => void) => void;
  /** Confirma o descarte: executa a saída pendente. */
  confirmarSaida: () => void;
  /** Cancela: mantém o usuário no editor. */
  cancelarSaida: () => void;
}

export function useGuardaSaida(temAlteracoes: boolean): GuardaSaida {
  const [acaoPendente, setAcaoPendente] = useState<(() => void) | null>(null);

  const solicitarSaida = useCallback(
    (sair: () => void) => {
      if (temAlteracoes) {
        // Envolvemos em função para o setState não interpretar `sair` como updater.
        setAcaoPendente(() => sair);
      } else {
        sair();
      }
    },
    [temAlteracoes]
  );

  const confirmarSaida = useCallback(() => {
    const sair = acaoPendente;
    setAcaoPendente(null);
    sair?.();
  }, [acaoPendente]);

  const cancelarSaida = useCallback(() => setAcaoPendente(null), []);

  return {
    confirmando: acaoPendente !== null,
    solicitarSaida,
    confirmarSaida,
    cancelarSaida,
  };
}
