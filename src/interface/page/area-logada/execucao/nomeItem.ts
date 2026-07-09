import type { Exercicio, TipoCardioDef } from "@/domain/tipos";
import { resolverTipoCardio } from "@/domain/tipos";
import type { StatusItem } from "./hooks/useSessaoTreino";

export interface NomeItem {
  nome: string;
  /** Emoji do tipo de cardio (ex.: 🏃 Esteira); ausente em exercícios. */
  emoji?: string;
}

/** Resolve o nome exibível de um item da sessão: exercício via catálogo,
    cardio via catálogo de tipos (builtin + customizados). */
export function nomeDoItem(
  item: StatusItem,
  catalogo: Exercicio[],
  tiposCardio: TipoCardioDef[]
): NomeItem {
  if (item.tipo === "exercicio") {
    return {
      nome: catalogo.find((exercicio) => exercicio.id === item.exercicioId)?.nome ?? "Exercício",
    };
  }
  const tipo = resolverTipoCardio(item.tipoCardio ?? "", tiposCardio);
  return { nome: tipo.nome, emoji: tipo.emoji };
}
