/* ═══════════════════════════════════════════
   Tokens compartilhados de campo (input/textarea/
   busca/select/caixa numérica)

   Fonte de verdade do estilo de campo: tom de
   contraste, borda, raio e foco. Toda variante de
   campo importa daqui — mudar o look do input passa
   a acontecer em um lugar só.

   Ver design-system.md §7.12.
   ═══════════════════════════════════════════ */

/** Base compartilhada por todas as variantes de campo. O tom
    `superficie-suave` é o que dá contraste do campo sobre o card
    (`superficie`) — sem ele o input "some" no fundo. */
export const CAMPO_BASE = `
  bg-superficie-suave
  border border-borda
  rounded-[10px]
  text-texto-primario placeholder:text-texto-sutil
  transition-all duration-200 ease-out
  focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20
  disabled:opacity-40 disabled:cursor-not-allowed
`;

/** Mesma base, mas com a borda em estado de erro. */
export const CAMPO_BASE_ERRO = CAMPO_BASE.replace("border-borda", "border-perigo");
