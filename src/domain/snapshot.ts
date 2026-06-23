import type { Usuario } from "@/domain/usuario";
import type {
  Exercicio,
  Ficha,
  Programa,
  RegistroTreino,
} from "@/domain/tipos";

export interface DadosSnapshotTrainify {
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  exerciciosCustom: Exercicio[];
}

export interface SnapshotTrainify {
  versaoSchema: number;
  atualizadoEm: string;
  exportadoEm: string;
  usuario: Usuario | null;
  dados: DadosSnapshotTrainify;
}
