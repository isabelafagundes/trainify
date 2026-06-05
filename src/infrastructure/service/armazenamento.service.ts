import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export interface Armazenamento {
  obter(chave: string): Promise<string | null>;
  definir(chave: string, valor: string): Promise<void>;
  remover(chave: string): Promise<void>;
}

class ArmazenamentoWeb implements Armazenamento {
  async obter(chave: string): Promise<string | null> {
    return localStorage.getItem(chave);
  }

  async definir(chave: string, valor: string): Promise<void> {
    localStorage.setItem(chave, valor);
  }

  async remover(chave: string): Promise<void> {
    localStorage.removeItem(chave);
  }
}

class ArmazenamentoCapacitor implements Armazenamento {
  async obter(chave: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: chave });
    return value;
  }

  async definir(chave: string, valor: string): Promise<void> {
    await Preferences.set({ key: chave, value: valor });
  }

  async remover(chave: string): Promise<void> {
    await Preferences.remove({ key: chave });
  }
}

export function criarArmazenamento(): Armazenamento {
  return Capacitor.isNativePlatform()
    ? new ArmazenamentoCapacitor()
    : new ArmazenamentoWeb();
}
