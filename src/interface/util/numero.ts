/** Padrão brasileiro de números decimais: vírgula como separador decimal.
 *
 * Estes helpers são a fonte única de verdade pra converter entre o texto
 * digitado pelo usuário (com vírgula) e o `number` do domínio (que sempre
 * usa ponto internamente, como todo número em JS). */

/** Texto digitado → número. Aceita tanto vírgula (padrão BR) quanto ponto,
 *  então funciona mesmo se o usuário colar um valor com ponto. Retorna `NaN`
 *  para texto inválido — cabe a quem chama checar com `Number.isFinite`. */
export function parseNumeroBR(texto: string): number {
  return Number(texto.replace(",", "."));
}

/** Número → texto pra exibir num input decimal, com vírgula e sem separador
 *  de milhar (não faz sentido "1.234,5" dentro de uma caixa de digitação).
 *  Inteiros saem sem casas decimais. */
export function textoDecimalBR(valor: number): string {
  return String(valor).replace(".", ",");
}
