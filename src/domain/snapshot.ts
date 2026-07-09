import type { Usuario } from "@/domain/usuario";
import type {
  Exercicio,
  Ficha,
  Programa,
  RegistroTreino,
  TipoCardioDef,
} from "@/domain/tipos";

export interface DadosSnapshotPezzo {
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  exerciciosCustom: Exercicio[];
  cardioCustom: TipoCardioDef[];
}

export interface SnapshotPezzo {
  versaoSchema: number;
  atualizadoEm: string;
  exportadoEm: string;
  usuario: Usuario | null;
  dados: DadosSnapshotPezzo;
}
