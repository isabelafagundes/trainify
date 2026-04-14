/* ═══════════════════════════════════════════
   Estado do Tema — Trainify
   ═══════════════════════════════════════════ */

import type { Tema } from "@/domain/tema";
import { STORAGE_KEYS } from "@/constants";

/** Tema claro */
export const TEMA_CLARO: Tema = {
  id: "claro",
  nome: "Claro",
  cores: {
    accent: "#8B5CF6",
    primary: "#000000",
    secondary: "#666666",
    error: "#EF4444",
    warning: "#F59E0B",
    success: "#10B981",
    base: "#FAFAF9",
    neutral: "#A1A1AA",
  },
  bordas: {
    P: "4px",
    M: "8px",
    G: "16px",
    XG: "24px",
  },
  fontes: {
    P: "14px",
    M: "16px",
    G: "20px",
    XG: "24px",
  },
  familias: {
    principal: "Inter, sans-serif",
    secundaria: "Georgia, serif",
  },
  espacamento: "16px",
};

/** Tema escuro */
export const TEMA_ESCURO: Tema = {
  id: "escuro",
  nome: "Escuro",
  cores: {
    accent: "#A78BFA",
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    error: "#F87171",
    warning: "#FBBF24",
    success: "#34D399",
    base: "#18181B",
    neutral: "#71717A",
  },
  bordas: {
    P: "4px",
    M: "8px",
    G: "16px",
    XG: "24px",
  },
  fontes: {
    P: "14px",
    M: "16px",
    G: "20px",
    XG: "24px",
  },
  familias: {
    principal: "Inter, sans-serif",
    secundaria: "Georgia, serif",
  },
  espacamento: "16px",
};

/** Classe gerenciadora do tema */
export class TemaManager {
  private static instancia: TemaManager;
  private temaAtual: Tema;
  private modoFonteGrande: boolean;

  private constructor() {
    this.temaAtual = this.carregarTemaSalvo() ?? TEMA_CLARO;
    this.modoFonteGrande = this.carregarFonteGrandeSalva() ?? false;
  }

  /** Obter instância singleton */
  static obterInstancia(): TemaManager {
    if (!TemaManager.instancia) {
      TemaManager.instancia = new TemaManager();
    }
    return TemaManager.instancia;
  }

  /** Obter tema atual */
  obterTema(): Tema {
    return this.temaAtual;
  }

  /** Definir tema */
  definirTema(tema: Tema): void {
    this.temaAtual = tema;
    this.salvarTema(tema.id);
    this.aplicarTema(tema);
  }

  /** Alternar entre claro/escuro */
  alternarTema(): void {
    const novoTema = this.temaAtual.id === "claro" ? TEMA_ESCURO : TEMA_CLARO;
    this.definirTema(novoTema);
  }

  /** Obter tamanho de fonte com ajuste de acessibilidade */
  obterTamanhoFonte(base: keyof Tema["fontes"]): string {
    if (this.modoFonteGrande) {
      const tamanhos = { P: "M", M: "G", G: "XG", XG: "XG" } as const;
      return this.temaAtual.fontes[tamanhos[base]];
    }
    return this.temaAtual.fontes[base];
  }

  /** Ativar/desativar modo fonte grande */
  alternarFonteGrande(): void {
    this.modoFonteGrande = !this.modoFonteGrande;
    this.salvarFonteGrande(this.modoFonteGrande);
    this.aplicarTema(this.temaAtual);
  }

  /** Verificar se modo fonte grande está ativo */
  estaFonteGrandeAtiva(): boolean {
    return this.modoFonteGrande;
  }

  /** Carregar tema salvo */
  private carregarTemaSalvo(): Tema | null {
    try {
      const salvo = localStorage.getItem(STORAGE_KEYS.TEMA);
      return salvo === "escuro" ? TEMA_ESCURO : TEMA_CLARO;
    } catch {
      return TEMA_CLARO;
    }
  }

  /** Carregar configuração de fonte grande */
  private carregarFonteGrandeSalva(): boolean | null {
    try {
      const salvo = localStorage.getItem(STORAGE_KEYS.FONTE_GRANDE);
      return salvo === "true";
    } catch {
      return false;
    }
  }

  /** Salvar preferência de tema */
  private salvarTema(temaId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMA, temaId);
    } catch {
      // Silencioso - falha no localStorage não deve quebrar o app
    }
  }

  /** Salvar preferência de fonte grande */
  private salvarFonteGrande(ativo: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONTE_GRANDE, String(ativo));
    } catch {
      // Silencioso
    }
  }

  /** Aplicar tema ao DOM */
  private aplicarTema(tema: Tema): void {
    const root = document.documentElement;
    root.setAttribute("data-tema", tema.id);
    root.setAttribute("data-fonte-grande", String(this.modoFonteGrande));
  }
}

/** Instância global do gerenciador de tema */
export const temaManager = TemaManager.obterInstancia();
