/* ═══════════════════════════════════════════
   Constantes Globais — Trainify
   ═══════════════════════════════════════════ */

/** Nome da aplicação */
export const APP_NAME = "Trainify";

/** Versão da aplicação */
export const APP_VERSION = "1.0.0";

/** Timeout padrão para requisições (ms) */
export const DEFAULT_TIMEOUT = 30000;

/** Chaves de armazenamento local */
export const STORAGE_KEYS = {
  TEMA: "trainify_tema",
  FONTE_GRANDE: "trainify_fonte_grande",
  USUARIO: "trainify_usuario",
  TOKEN: "trainify_token",
} as const;
