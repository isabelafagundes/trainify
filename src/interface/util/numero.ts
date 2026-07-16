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

/** Formata valores para exibição no app usando a convenção brasileira.
 *  Mantém a quantidade de casas pedida para valores decimais e não acrescenta
 *  zeros a inteiros. O agrupamento é desligado para métricas compactas. */
export function formatarNumeroBR(valor: number, casasDecimais = 1): string {
  const casas = Number.isInteger(valor) ? 0 : casasDecimais;

  return new Intl.NumberFormat("pt-BR", {
    useGrouping: false,
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}
