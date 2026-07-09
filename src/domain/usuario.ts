/* ═══════════════════════════════════════════
   Modelo de Usuário — Pezzo
   ═══════════════════════════════════════════ */

export interface Usuario {
  nome: string;
  avatarEmoji: string;
  criadoEm: string;
}

/** Emoji padrão de avatar ao criar o perfil */
export const AVATAR_EMOJI_PADRAO = "🙂";

/** Emojis disponíveis para o avatar do usuário */
export const emojisAvatar = [
  "🙂", "😎", "🤩", "🥳", "😺", "🦊",
  "🐯", "🐼", "🐵", "🐶", "🦁", "🐸",
  "💪", "🏋️", "🏃", "🚴", "🔥", "⚡",
  "⭐", "🏆", "🎯", "🌱", "🚀", "💎",
];
