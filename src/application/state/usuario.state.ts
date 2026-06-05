/* ═══════════════════════════════════════════
   Estado do Usuário — Trainify
   ═══════════════════════════════════════════ */

import { STORAGE_KEYS } from "@/constants";
import type { Usuario } from "@/domain/usuario";
import { appModule } from "@/interface/configuration/module/app.module";

/** Gerenciador do perfil do usuário */
export class UsuarioManager {
  private static instancia: UsuarioManager;
  private usuario: Usuario | null;
  private listeners: Set<() => void>;
  private inicializado: boolean;

  private constructor() {
    this.usuario = null;
    this.listeners = new Set();
    this.inicializado = false;
  }

  static obterInstancia(): UsuarioManager {
    if (!UsuarioManager.instancia) {
      UsuarioManager.instancia = new UsuarioManager();
    }
    return UsuarioManager.instancia;
  }

  inscrever(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async inicializar(): Promise<void> {
    if (this.inicializado) return;
    this.usuario = await this.carregar();
    this.inicializado = true;
  }

  estaInicializado(): boolean {
    return this.inicializado;
  }

  existeUsuario(): boolean {
    return this.usuario !== null;
  }

  obterUsuario(): Usuario | null {
    return this.usuario;
  }

  definirUsuario(dados: { nome: string; avatarEmoji: string }): Usuario {
    const usuario: Usuario = {
      nome: dados.nome.trim(),
      avatarEmoji: dados.avatarEmoji,
      criadoEm: this.usuario?.criadoEm ?? new Date().toISOString(),
    };
    this.usuario = usuario;
    void this.salvar(usuario);
    this.notificar();
    return usuario;
  }

  private notificar(): void {
    this.listeners.forEach((listener) => listener());
  }

  private async carregar(): Promise<Usuario | null> {
    try {
      const salvo = await appModule.armazenamento.obter(STORAGE_KEYS.USUARIO);
      if (!salvo) return null;
      const dados = JSON.parse(salvo) as Partial<Usuario>;
      if (!dados.nome) return null;
      return {
        nome: dados.nome,
        avatarEmoji: dados.avatarEmoji ?? "🙂",
        criadoEm: dados.criadoEm ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  private async salvar(usuario: Usuario): Promise<void> {
    try {
      await appModule.armazenamento.definir(
        STORAGE_KEYS.USUARIO,
        JSON.stringify(usuario)
      );
    } catch {
      // Falha no armazenamento não deve quebrar o app.
    }
  }
}

export const usuarioManager = UsuarioManager.obterInstancia();
