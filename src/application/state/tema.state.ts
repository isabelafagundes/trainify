/* ═══════════════════════════════════════════
   Estado do Tema — Trainify
   ═══════════════════════════════════════════ */

import { STORAGE_KEYS } from "@/constants";
import type { Tema, TemaId } from "@/domain/tema";
import { appModule } from "@/interface/configuration/module/app.module";
import { SafeArea, SystemBarsStyle } from "@capacitor-community/safe-area";
import { Capacitor } from "@capacitor/core";

/** Tema base atual do app. Novos temas devem sobrescrever estes mesmos tokens. */
export const TEMA_CLARO: Tema = {
  id: "claro",
  nome: "Claro quente",
  variaveis: {
    "--color-fundo": "oklch(0.965 0.007 70)",
    "--color-superficie": "oklch(0.985 0.005 70)",
    "--color-superficie-elevada": "oklch(0.985 0.005 70)",
    "--color-superficie-suave": "oklch(0.950 0.008 68)",
    "--color-superficie-hover": "oklch(0.940 0.010 68)",
    "--color-texto-primario": "oklch(0.200 0.015 55)",
    "--color-texto-secundario": "oklch(0.450 0.018 55)",
    "--color-texto-sutil": "oklch(0.510 0.015 55)",
    "--color-texto-invertido": "oklch(0.965 0.007 70)",
    "--color-borda": "oklch(0.895 0.010 65)",
    "--color-borda-suave": "oklch(0.930 0.008 65)",
    "--color-borda-forte": "oklch(0.620 0.020 60)",
    "--color-acento": "oklch(0.220 0.015 55)",
    "--color-acento-hover": "oklch(0.310 0.018 55)",
    "--color-acento-suave": "oklch(0.935 0.014 65)",
    "--color-perigo": "oklch(0.455 0.095 35)",
    "--color-perigo-hover": "oklch(0.385 0.090 35)",
    "--color-perigo-suave": "oklch(0.930 0.025 35)",
    "--background-app-a": "oklch(0.91 0.035 55 / 0.5)",
    "--background-app-b": "oklch(0.90 0.03 40 / 0.4)",
    "--background-app-c": "oklch(0.91 0.035 50 / 0.5)",
    "--background-app-d": "oklch(0.90 0.03 35 / 0.4)",
    "--background-app-start": "oklch(0.95 0.015 55)",
    "--background-app-end": "oklch(0.95 0.015 50)",
  },
};

/** Tema pronto para evolução futura, ainda sem controle visível na interface. */
export const TEMA_ESCURO: Tema = {
  id: "escuro",
  nome: "Escuro quente",
  variaveis: {
    "--color-fundo": "oklch(0.165 0.010 55)",
    "--color-superficie": "oklch(0.225 0.010 55)",
    "--color-superficie-elevada": "oklch(0.275 0.012 55)",
    "--color-superficie-suave": "oklch(0.315 0.012 55)",
    "--color-superficie-hover": "oklch(0.365 0.014 55)",
    "--color-texto-primario": "oklch(0.965 0.006 70)",
    "--color-texto-secundario": "oklch(0.835 0.010 70)",
    "--color-texto-sutil": "oklch(0.735 0.012 70)",
    "--color-texto-invertido": "oklch(0.180 0.010 55)",
    "--color-borda": "oklch(0.440 0.014 55)",
    "--color-borda-suave": "oklch(0.380 0.012 55)",
    "--color-borda-forte": "oklch(0.600 0.014 60)",
    "--color-acento": "oklch(0.890 0.012 70)",
    "--color-acento-hover": "oklch(0.800 0.014 70)",
    "--color-acento-suave": "oklch(0.355 0.020 55)",
    "--color-perigo": "oklch(0.640 0.105 35)",
    "--color-perigo-hover": "oklch(0.700 0.105 35)",
    "--color-perigo-suave": "oklch(0.300 0.040 35)",
    "--background-app-a": "oklch(0.32 0.035 55 / 0.45)",
    "--background-app-b": "oklch(0.30 0.030 40 / 0.35)",
    "--background-app-c": "oklch(0.28 0.035 50 / 0.45)",
    "--background-app-d": "oklch(0.27 0.030 35 / 0.35)",
    "--background-app-start": "oklch(0.205 0.014 55)",
    "--background-app-end": "oklch(0.175 0.012 50)",
  },
};

export const TEMAS_DISPONIVEIS: Tema[] = [TEMA_CLARO, TEMA_ESCURO];

/** Classe gerenciadora do tema */
export class TemaManager {
  private static instancia: TemaManager;
  private temaAtual: Tema;
  private modoFonteGrande: boolean;

  private constructor() {
    this.temaAtual = TEMA_CLARO;
    this.modoFonteGrande = false;
  }

  static obterInstancia(): TemaManager {
    if (!TemaManager.instancia) {
      TemaManager.instancia = new TemaManager();
    }
    return TemaManager.instancia;
  }

  async inicializar(): Promise<void> {
    this.temaAtual = await this.carregarTemaSalvo();
    this.modoFonteGrande = await this.carregarFonteGrandeSalva();
    this.aplicarTema(this.temaAtual);
  }

  obterTema(): Tema {
    return this.temaAtual;
  }

  listarTemas(): Tema[] {
    return [...TEMAS_DISPONIVEIS];
  }

  definirTemaPorId(temaId: TemaId): boolean {
    const tema = this.encontrarTema(temaId);
    if (!tema) return false;

    this.definirTema(tema);
    return true;
  }

  definirTema(tema: Tema): void {
    this.temaAtual = tema;
    void this.salvarTema(tema.id);
    this.aplicarTema(tema);
  }

  alternarTema(): void {
    const indiceAtual = TEMAS_DISPONIVEIS.findIndex((tema) => tema.id === this.temaAtual.id);
    const proximoTema = TEMAS_DISPONIVEIS[(indiceAtual + 1) % TEMAS_DISPONIVEIS.length] ?? TEMA_CLARO;
    this.definirTema(proximoTema);
  }

  alternarFonteGrande(): void {
    this.modoFonteGrande = !this.modoFonteGrande;
    void this.salvarFonteGrande(this.modoFonteGrande);
    this.aplicarTema(this.temaAtual);
  }

  estaFonteGrandeAtiva(): boolean {
    return this.modoFonteGrande;
  }

  private encontrarTema(temaId: TemaId): Tema | null {
    return TEMAS_DISPONIVEIS.find((tema) => tema.id === temaId) ?? null;
  }

  private async carregarTemaSalvo(): Promise<Tema> {
    try {
      const salvo = (await appModule.armazenamento.obter(STORAGE_KEYS.TEMA)) as TemaId | null;
      return (salvo && this.encontrarTema(salvo)) || TEMA_CLARO;
    } catch {
      return TEMA_CLARO;
    }
  }

  private async carregarFonteGrandeSalva(): Promise<boolean> {
    try {
      return (await appModule.armazenamento.obter(STORAGE_KEYS.FONTE_GRANDE)) === "true";
    } catch {
      return false;
    }
  }

  private async salvarTema(temaId: TemaId): Promise<void> {
    try {
      await appModule.armazenamento.definir(STORAGE_KEYS.TEMA, temaId);
    } catch {
      // Falha no localStorage não deve quebrar o app.
    }
  }

  private async salvarFonteGrande(ativo: boolean): Promise<void> {
    try {
      await appModule.armazenamento.definir(STORAGE_KEYS.FONTE_GRANDE, String(ativo));
    } catch {
      // Falha no localStorage não deve quebrar o app.
    }
  }

  private aplicarTema(tema: Tema): void {
    const root = document.documentElement;

    root.setAttribute("data-tema", tema.id);
    root.setAttribute("data-fonte-grande", String(this.modoFonteGrande));
    root.style.colorScheme = tema.id === "escuro" ? "dark" : "light";

    Object.entries(tema.variaveis).forEach(([nome, valor]) => {
      root.style.setProperty(nome, valor);
    });

    void this.atualizarStatusBar(tema);
  }

  private async atualizarStatusBar(tema: Tema): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await SafeArea.setSystemBarsStyle({
        style: tema.id === "escuro" ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      });
    } catch {
      // Plugins nativos podem nao estar disponiveis durante preview web.
    }
  }
}

export const temaManager = TemaManager.obterInstancia();
