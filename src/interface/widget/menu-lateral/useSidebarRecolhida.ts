import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "@/constants";
import { appModule } from "@/interface/configuration/module/app.module";

/** Leitura síncrona no init para evitar flash de expandida→recolhida a cada
 *  carregamento. A barra lateral só aparece em lg+ (desktop web), onde
 *  `appModule.armazenamento` delega ao próprio localStorage com esta mesma
 *  chave — então ler daqui é coerente com o que a gravação persiste. */
function lerRecolhidaInicial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_RECOLHIDA) === "true";
  } catch {
    return false;
  }
}

/** Estado (persistido) de recolhimento da barra lateral do desktop. */
export function useSidebarRecolhida(): readonly [boolean, () => void] {
  const [recolhida, setRecolhida] = useState<boolean>(lerRecolhidaInicial);

  const alternar = useCallback(() => {
    setRecolhida((atual) => {
      const proximo = !atual;
      void appModule.armazenamento
        .definir(STORAGE_KEYS.SIDEBAR_RECOLHIDA, String(proximo))
        .catch(() => {
          // Falha na persistência não deve quebrar a navegação.
        });
      return proximo;
    });
  }, []);

  return [recolhida, alternar] as const;
}
