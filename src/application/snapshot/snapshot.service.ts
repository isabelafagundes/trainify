import { VERSAO_SCHEMA } from "@/constants";
import type { SnapshotPezzo } from "@/domain/snapshot";
import type { EntradaCardio, ExercicioFicha } from "@/domain/tipos";
import { itensDeFormatoAntigo } from "@/domain/ficha";
import type { Usuario } from "@/domain/usuario";
import { pezzoState } from "@/application/state/pezzo.state";
import { usuarioManager } from "@/application/state/usuario.state";

export type EstrategiaImportacaoSnapshot = "substituir" | "maisRecente";

export interface SnapshotService {
  exportarSnapshot(): Promise<SnapshotPezzo>;
  importarSnapshot(
    snapshot: SnapshotPezzo,
    estrategia: EstrategiaImportacaoSnapshot
  ): Promise<void>;
  serializar(snapshot: SnapshotPezzo): string;
  desserializar(texto: string): SnapshotPezzo;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehDataIsoValida(valor: unknown): valor is string {
  return typeof valor === "string" && !Number.isNaN(Date.parse(valor));
}

function validarUsuario(valor: unknown): Usuario | null {
  if (valor === null) return null;
  if (!ehObjeto(valor)) {
    throw new Error("Usuario do backup invalido.");
  }

  if (
    typeof valor.nome !== "string" ||
    typeof valor.avatarEmoji !== "string" ||
    !ehDataIsoValida(valor.criadoEm)
  ) {
    throw new Error("Usuario do backup invalido.");
  }

  return {
    nome: valor.nome,
    avatarEmoji: valor.avatarEmoji,
    criadoEm: valor.criadoEm,
  };
}

function validarSnapshotV2(valor: unknown): SnapshotPezzo {
  if (!ehObjeto(valor)) {
    throw new Error("Backup invalido.");
  }

  if (valor.versaoSchema !== 2) {
    throw new Error("Versao de backup invalida.");
  }

  if (!ehDataIsoValida(valor.atualizadoEm) || !ehDataIsoValida(valor.exportadoEm)) {
    throw new Error("Datas do backup invalidas.");
  }

  if (!ehObjeto(valor.dados)) {
    throw new Error("Dados do backup invalidos.");
  }

  const { programas, fichas, historico, exerciciosCustom } = valor.dados;
  const cardioCustom = Array.isArray(valor.dados.cardioCustom)
    ? valor.dados.cardioCustom
    : [];
  if (
    !Array.isArray(programas) ||
    !Array.isArray(fichas) ||
    !Array.isArray(historico) ||
    !Array.isArray(exerciciosCustom)
  ) {
    throw new Error("Dados do backup invalidos.");
  }

  return {
    versaoSchema: 2,
    atualizadoEm: valor.atualizadoEm,
    exportadoEm: valor.exportadoEm,
    usuario: validarUsuario(valor.usuario),
    dados: {
      programas,
      fichas,
      historico,
      exerciciosCustom,
      cardioCustom,
    },
  };
}

/** v1 -> v2: ficha deixa de ter modalidade/exercicios/cardio separados e passa
    a ter uma lista unica ordenada de itens (exercicios primeiro, cardio no fim). */
function migrarFichaV1ParaV2(ficha: unknown): unknown {
  if (!ehObjeto(ficha) || Array.isArray(ficha.itens)) return ficha;

  const { modalidade: _modalidade, exercicios, cardio, ...resto } = ficha;
  return {
    ...resto,
    itens: itensDeFormatoAntigo(
      (Array.isArray(exercicios) ? exercicios : []) as ExercicioFicha[],
      (Array.isArray(cardio) ? cardio : []) as EntradaCardio[]
    ),
  };
}

function migrarV1ParaV2(valor: Record<string, unknown>): Record<string, unknown> {
  if (!ehObjeto(valor.dados) || !Array.isArray(valor.dados.fichas)) {
    return { ...valor, versaoSchema: 2 };
  }

  return {
    ...valor,
    versaoSchema: 2,
    dados: {
      ...valor.dados,
      fichas: valor.dados.fichas.map(migrarFichaV1ParaV2),
    },
  };
}

function migrarAteVersaoAtual(valor: unknown): SnapshotPezzo {
  if (!ehObjeto(valor) || typeof valor.versaoSchema !== "number") {
    throw new Error("Backup sem versao de schema.");
  }

  if (valor.versaoSchema > VERSAO_SCHEMA) {
    throw new Error("Este backup foi criado por uma versao mais nova do Kynori.");
  }

  if (valor.versaoSchema < 1) {
    throw new Error("Versao de backup nao suportada.");
  }

  // Cadeia de migracoes: v1 -> v2 -> ...
  const migrado = valor.versaoSchema === 1 ? migrarV1ParaV2(valor) : valor;
  return validarSnapshotV2(migrado);
}

async function garantirInicializacao(): Promise<void> {
  await Promise.all([
    pezzoState.inicializar(),
    usuarioManager.inicializar(),
  ]);
}

class SnapshotPezzoService implements SnapshotService {
  async exportarSnapshot(): Promise<SnapshotPezzo> {
    await garantirInicializacao();

    const agora = new Date().toISOString();
    return {
      versaoSchema: VERSAO_SCHEMA,
      atualizadoEm: pezzoState.getAtualizadoEm(),
      exportadoEm: agora,
      usuario: usuarioManager.obterUsuario(),
      dados: pezzoState.getDadosPortateis(),
    };
  }

  async importarSnapshot(
    snapshot: SnapshotPezzo,
    estrategia: EstrategiaImportacaoSnapshot
  ): Promise<void> {
    await garantirInicializacao();

    if (estrategia === "maisRecente") {
      const local = Date.parse(pezzoState.getAtualizadoEm());
      const remoto = Date.parse(snapshot.atualizadoEm);
      if (remoto <= local) return;
    }

    usuarioManager.substituirUsuario(snapshot.usuario);
    pezzoState.substituirDados(snapshot.dados, snapshot.atualizadoEm);
  }

  serializar(snapshot: SnapshotPezzo): string {
    return JSON.stringify(snapshot, null, 2);
  }

  desserializar(texto: string): SnapshotPezzo {
    try {
      return migrarAteVersaoAtual(JSON.parse(texto));
    } catch (erro) {
      if (erro instanceof Error) {
        throw erro;
      }
      throw new Error("Arquivo de backup invalido.");
    }
  }
}

export const snapshotService = new SnapshotPezzoService();
