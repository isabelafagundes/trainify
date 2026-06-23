/* ═══════════════════════════════════════════
   Constantes Globais — Trainify
   ═══════════════════════════════════════════ */

/** Nome da aplicação */
export const APP_NAME = "Trainify";

/** Versão da aplicação */
export const APP_VERSION = "1.0.0";

/** Versao do formato de snapshot exportado/importado */
export const VERSAO_SCHEMA = 1;

/** Timeout padrão para requisições (ms) */
export const DEFAULT_TIMEOUT = 30000;

/** Chaves de armazenamento local */
export const STORAGE_KEYS = {
  TEMA: "trainify_tema",
  FONTE_GRANDE: "trainify_fonte_grande",
  USUARIO: "trainify_usuario",
  TOKEN: "trainify_token",
  // Dados de treino
  DADOS_TREINO: "trainify_dados_treino",
  // Identificador estavel desta instalacao
  INSTALACAO_ID: "trainify_instalacao_id",
} as const;
