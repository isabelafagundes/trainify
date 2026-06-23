import { VERSAO_SCHEMA } from "@/constants";
import type { SnapshotTrainify } from "@/domain/snapshot";
import type { Usuario } from "@/domain/usuario";
import { trainifyState } from "@/application/state/trainify.state";
import { usuarioManager } from "@/application/state/usuario.state";

export type EstrategiaImportacaoSnapshot = "substituir" | "maisRecente";

export interface SnapshotService {
  exportarSnapshot(): Promise<SnapshotTrainify>;
  importarSnapshot(
    snapshot: SnapshotTrainify,
    estrategia: EstrategiaImportacaoSnapshot
  ): Promise<void>;
  serializar(snapshot: SnapshotTrainify): string;
  desserializar(texto: string): SnapshotTrainify;
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

function validarSnapshotV1(valor: unknown): SnapshotTrainify {
  if (!ehObjeto(valor)) {
    throw new Error("Backup invalido.");
  }

  if (valor.versaoSchema !== 1) {
    throw new Error("Versao de backup invalida.");
  }

  if (!ehDataIsoValida(valor.atualizadoEm) || !ehDataIsoValida(valor.exportadoEm)) {
    throw new Error("Datas do backup invalidas.");
  }

  if (!ehObjeto(valor.dados)) {
    throw new Error("Dados do backup invalidos.");
  }

  const { programas, fichas, historico, exerciciosCustom } = valor.dados;
  if (
    !Array.isArray(programas) ||
    !Array.isArray(fichas) ||
    !Array.isArray(historico) ||
    !Array.isArray(exerciciosCustom)
  ) {
    throw new Error("Dados do backup invalidos.");
  }

  return {
    versaoSchema: 1,
    atualizadoEm: valor.atualizadoEm,
    exportadoEm: valor.exportadoEm,
    usuario: validarUsuario(valor.usuario),
    dados: {
      programas,
      fichas,
      historico,
      exerciciosCustom,
    },
  };
}

function migrarAteVersaoAtual(valor: unknown): SnapshotTrainify {
  if (!ehObjeto(valor) || typeof valor.versaoSchema !== "number") {
    throw new Error("Backup sem versao de schema.");
  }

  if (valor.versaoSchema > VERSAO_SCHEMA) {
    throw new Error("Este backup foi criado por uma versao mais nova do Trainify.");
  }

  if (valor.versaoSchema < 1) {
    throw new Error("Versao de backup nao suportada.");
  }

  // Cadeia de migracoes futuras: v1 -> v2 -> ...
  return validarSnapshotV1(valor);
}

async function garantirInicializacao(): Promise<void> {
  await Promise.all([
    trainifyState.inicializar(),
    usuarioManager.inicializar(),
  ]);
}

class SnapshotTrainifyService implements SnapshotService {
  async exportarSnapshot(): Promise<SnapshotTrainify> {
    await garantirInicializacao();

    const agora = new Date().toISOString();
    return {
      versaoSchema: VERSAO_SCHEMA,
      atualizadoEm: trainifyState.getAtualizadoEm(),
      exportadoEm: agora,
      usuario: usuarioManager.obterUsuario(),
      dados: trainifyState.getDadosPortateis(),
    };
  }

  async importarSnapshot(
    snapshot: SnapshotTrainify,
    estrategia: EstrategiaImportacaoSnapshot
  ): Promise<void> {
    await garantirInicializacao();

    if (estrategia === "maisRecente") {
      const local = Date.parse(trainifyState.getAtualizadoEm());
      const remoto = Date.parse(snapshot.atualizadoEm);
      if (remoto <= local) return;
    }

    usuarioManager.substituirUsuario(snapshot.usuario);
    trainifyState.substituirDados(snapshot.dados, snapshot.atualizadoEm);
  }

  serializar(snapshot: SnapshotTrainify): string {
    return JSON.stringify(snapshot, null, 2);
  }

  desserializar(texto: string): SnapshotTrainify {
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

export const snapshotService = new SnapshotTrainifyService();
