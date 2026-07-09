/* ============================================================================
   Helpers de derivação da Ficha
   A ficha é uma sequência ordenada de itens (exercício ou cardio); estas
   funções derivam as visões separadas para call-sites que precisam delas.
   ============================================================================ */

import type { EntradaCardio, ExercicioFicha, Ficha, ItemFicha } from "./tipos";

/** Exercícios de força da ficha, na ordem em que aparecem nos itens */
export function exerciciosDaFicha(ficha: Pick<Ficha, "itens">): ExercicioFicha[] {
  return ficha.itens
    .filter((item): item is Extract<ItemFicha, { tipo: "exercicio" }> => item.tipo === "exercicio")
    .map((item) => item.exercicio);
}

/** Atividades de cardio da ficha, na ordem em que aparecem nos itens */
export function cardioDaFicha(ficha: Pick<Ficha, "itens">): EntradaCardio[] {
  return ficha.itens
    .filter((item): item is Extract<ItemFicha, { tipo: "cardio" }> => item.tipo === "cardio")
    .map((item) => item.cardio);
}

export function temCardio(ficha: Pick<Ficha, "itens">): boolean {
  return ficha.itens.some((item) => item.tipo === "cardio");
}

export function temMusculacao(ficha: Pick<Ficha, "itens">): boolean {
  return ficha.itens.some((item) => item.tipo === "exercicio");
}

/** Monta itens a partir do formato antigo (exercícios primeiro, cardio no fim) */
export function itensDeFormatoAntigo(
  exercicios: ExercicioFicha[],
  cardio: EntradaCardio[]
): ItemFicha[] {
  return [
    ...exercicios.map((exercicio): ItemFicha => ({ tipo: "exercicio", exercicio })),
    ...cardio.map((cardio): ItemFicha => ({ tipo: "cardio", cardio })),
  ];
}
