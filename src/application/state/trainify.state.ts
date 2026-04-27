/* ═══════════════════════════════════════════
   Estado do Trainify — Gerenciador de Dados de Treino
   ═══════════════════════════════════════════ */

import type {
  Programa,
  Ficha,
  RegistroTreino,
  Exercicio,
} from "@/domain/tipos";
import { STORAGE_KEYS } from "@/constants";
import { exerciciosPadrao } from "@/infrastructure/repo/mock/exercicio-mock.repo";

/** Interface dos dados persistidos */
interface DadosTreino {
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  exerciciosCustom: Exercicio[];
}

/** Estado gerenciado pelo Trainify */
interface TrainifyState {
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  exerciciosCustom: Exercicio[];
}

/** Gerenciador de estado global para dados de treino */
export class TrainifyStateManager {
  private static instancia: TrainifyStateManager;
  private estado: TrainifyState;
  private listeners: Set<() => void>;

  private constructor() {
    this.listeners = new Set();
    this.estado = this.carregarDadosSalvos() || this.criarEstadoInicial();
  }

  /** Obter instância singleton */
  static obterInstancia(): TrainifyStateManager {
    if (!TrainifyStateManager.instancia) {
      TrainifyStateManager.instancia = new TrainifyStateManager();
    }
    return TrainifyStateManager.instancia;
  }

  /** Inscrever para mudanças de estado */
  inscrever(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /** Notificar todos os listeners */
  private notificar(): void {
    this.listeners.forEach((cb) => cb());
  }

  /** Obter todos os programas */
  getProgramas(): Programa[] {
    return [...this.estado.programas];
  }

  /** Obter todas as fichas */
  getFichas(): Ficha[] {
    return [...this.estado.fichas];
  }

  /** Obter todo o histórico */
  getHistorico(): RegistroTreino[] {
    return [...this.estado.historico];
  }

  /** Obter exercícios customizados */
  getExerciciosCustom(): Exercicio[] {
    return [...this.estado.exerciciosCustom];
  }

  /** Obter todos os exercícios (padrão + customizados) */
  getTodosExercicios(): Exercicio[] {
    return [...exerciciosPadrao, ...this.estado.exerciciosCustom];
  }

  /** Obter programa ativo */
  getProgramaAtivo(): Programa | null {
    return (
      this.estado.programas.find((p) => p.ativo) || null
    );
  }

  /** Obter fichas de um programa */
  getFichasDoPrograma(programaId: string): Ficha[] {
    const programa = this.estado.programas.find((p) => p.id === programaId);
    if (!programa) return [];

    return this.estado.fichas.filter((f) =>
      programa.fichaIds.includes(f.id)
    );
  }

  /** Obter programa por ID */
  getProgramaPorId(id: string): Programa | null {
    return this.estado.programas.find((p) => p.id === id) || null;
  }

  /** Obter ficha por ID */
  getFichaPorId(id: string): Ficha | null {
    return this.estado.fichas.find((f) => f.id === id) || null;
  }

  /** Obter exercício por ID */
  getExercicioPorId(id: string): Exercicio | null {
    return this.getTodosExercicios().find((e) => e.id === id) || null;
  }

  /** Obter histórico de uma ficha */
  getHistoricoDaFicha(fichaId: string): RegistroTreino[] {
    return this.estado.historico.filter((h) => h.fichaId === fichaId);
  }

  /** Adicionar programa */
  adicionarPrograma(
    programa: Omit<Programa, "id">
  ): Programa {
    const novo: Programa = {
      ...programa,
      id: crypto.randomUUID(),
    };

    // Se estiver marcado como ativo, desativar os demais
    if (novo.ativo) {
      this.estado.programas.forEach((p) => (p.ativo = false));
    }

    this.estado.programas.push(novo);
    this.salvarDados();
    this.notificar();
    return novo;
  }

  /** Atualizar programa */
  atualizarPrograma(
    id: string,
    atualizacoes: Partial<Omit<Programa, "id">>
  ): Programa | null {
    const index = this.estado.programas.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // Se estiver ativando, desativar os demais
    if (atualizacoes.ativo) {
      this.estado.programas.forEach((p) => (p.ativo = false));
    }

    this.estado.programas[index] = {
      ...this.estado.programas[index],
      ...atualizacoes,
    };
    this.salvarDados();
    this.notificar();
    return this.estado.programas[index];
  }

  /** Remover programa */
  removerPrograma(id: string): boolean {
    const index = this.estado.programas.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const programa = this.estado.programas[index];

    // Remover fichas do programa (fichas são filhas do programa)
    const fichasParaRemover = new Set(programa.fichaIds);
    this.estado.fichas = this.estado.fichas.filter(
      (f) => !fichasParaRemover.has(f.id)
    );

    // Remover registros do histórico dessas fichas
    this.estado.historico = this.estado.historico.filter(
      (h) => !fichasParaRemover.has(h.fichaId)
    );

    // Remover o programa
    this.estado.programas.splice(index, 1);

    this.salvarDados();
    this.notificar();
    return true;
  }

  /** Adicionar ficha */
  adicionarFicha(
    ficha: Omit<Ficha, "id" | "programaId">,
    programaId: string
  ): Ficha {
    const nova: Ficha = {
      ...ficha,
      id: crypto.randomUUID(),
      programaId, // Adiciona referência ao programa pai
    };

    this.estado.fichas.push(nova);

    // Adiciona automaticamente ao programa
    const programa = this.estado.programas.find((p) => p.id === programaId);
    if (programa) {
      programa.fichaIds.push(nova.id);
    } else {
      throw new Error(`Programa com ID ${programaId} não encontrado`);
    }

    this.salvarDados();
    this.notificar();
    return nova;
  }

  /** Atualizar ficha */
  atualizarFicha(
    id: string,
    atualizacoes: Partial<Omit<Ficha, "id">>
  ): Ficha | null {
    const index = this.estado.fichas.findIndex((f) => f.id === id);
    if (index === -1) return null;

    this.estado.fichas[index] = {
      ...this.estado.fichas[index],
      ...atualizacoes,
    };
    this.salvarDados();
    this.notificar();
    return this.estado.fichas[index];
  }

  /** Remover ficha */
  removerFicha(id: string): boolean {
    const index = this.estado.fichas.findIndex((f) => f.id === id);
    if (index === -1) return false;

    this.estado.fichas.splice(index, 1);

    // Remover referências em programas
    this.estado.programas.forEach((p) => {
      p.fichaIds = p.fichaIds.filter((fid) => fid !== id);
    });

    // Remover registros do histórico
    this.estado.historico = this.estado.historico.filter(
      (h) => h.fichaId !== id
    );

    this.salvarDados();
    this.notificar();
    return true;
  }

  /** Adicionar exercício customizado */
  adicionarExercicioCustom(
    exercicio: Omit<Exercicio, "id">
  ): Exercicio {
    const novo: Exercicio = {
      ...exercicio,
      id: `custom-${crypto.randomUUID()}`,
    };

    this.estado.exerciciosCustom.push(novo);
    this.salvarDados();
    this.notificar();
    return novo;
  }

  /** Remover exercício customizado */
  removerExercicioCustom(id: string): boolean {
    const index = this.estado.exerciciosCustom.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.estado.exerciciosCustom.splice(index, 1);
    this.salvarDados();
    this.notificar();
    return true;
  }

  /** Adicionar registro de treino */
  adicionarTreino(
    registro: Omit<RegistroTreino, "id">
  ): RegistroTreino {
    const novo: RegistroTreino = {
      ...registro,
      id: crypto.randomUUID(),
    };

    this.estado.historico.unshift(novo);
    this.salvarDados();
    this.notificar();
    return novo;
  }

  /** Copiar ficha */
  copiarFicha(fichaId: string): Ficha | null {
    const ficha = this.getFichaPorId(fichaId);
    if (!ficha) return null;

    const copia = this.adicionarFicha({
      nome: `${ficha.nome} (cópia)`,
      descricao: ficha.descricao,
      icone: ficha.icone,
      emoji: ficha.emoji,
      exercicios: [...ficha.exercicios],
      cardio: ficha.cardio.map((c) => ({ ...c, id: crypto.randomUUID() })),
    });

    return copia;
  }

  /** Copiar programa */
  copiarPrograma(programaId: string): Programa | null {
    const programa = this.getProgramaPorId(programaId);
    if (!programa) return null;

    // Criar o programa novo sem fichas (serão copiadas depois)
    const copia = this.adicionarPrograma({
      nome: `${programa.nome} (cópia)`,
      descricao: programa.descricao,
      corBanner: programa.corBanner,
      fichaIds: [], // Será preenchido com as cópias das fichas
      ativo: false,
    });

    // Copiar cada ficha do programa original
    const fichasOriginais = programa.fichaIds.map((id) =>
      this.getFichaPorId(id)
    );

    fichasOriginais.forEach((fichaOriginal) => {
      if (fichaOriginal) {
        const copiaFicha = this.adicionarFicha(
          {
            nome: fichaOriginal.nome,
            descricao: fichaOriginal.descricao,
            icone: fichaOriginal.icone,
            emoji: fichaOriginal.emoji,
            exercicios: [...fichaOriginal.exercicios],
            cardio: fichaOriginal.cardio.map((c) => ({
              ...c,
              id: crypto.randomUUID(),
            })),
          },
          copia.id // Adicionar ao programa copiado
        );

        // A adicionarFicha já adiciona ao programa, mas vamos garantir
        // que fichaIds está correto (caso a implementação mude)
        if (!copia.fichaIds.includes(copiaFicha.id)) {
          copia.fichaIds.push(copiaFicha.id);
        }
      }
    });

    // Salvar novamente para garantir consistência
    this.salvarDados();

    return copia;
  }

  /** Gerar nome único para ficha */
  gerarNomeFicha(): string {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fichasExistentes = this.estado.fichas.map((f) =>
      f.nome.replace("Treino ", "")
    );

    for (let i = 0; i < letras.length; i++) {
      const nome = `Treino ${letras[i]}`;
      if (!fichasExistentes.includes(letras[i])) {
        return nome;
      }
    }

    // Se todas as letras foram usadas, adicionar número
    return `Treino ${fichasExistentes.length + 1}`;
  }

  /** Obter grupos musculares usados nas fichas */
  getGruposMusculares(): string[] {
    const grupos = new Set<string>();

    this.estado.fichas.forEach((ficha) => {
      ficha.exercicios.forEach((exFicha) => {
        const exercicio = this.getExercicioPorId(exFicha.exercicioId);
        if (exercicio) {
          grupos.add(exercicio.grupoMuscular);
        }
      });
    });

    return Array.from(grupos).sort();
  }

  /** Obter próximo número de treino para nomeação automática */
  proximoNumeroTreino(): number {
    return this.estado.fichas.length + 1;
  }

  /** Carregar dados salvos do localStorage */
  private carregarDadosSalvos(): TrainifyState | null {
    try {
      const salvo = localStorage.getItem(STORAGE_KEYS.DADOS_TREINO);
      if (salvo) {
        const dados: DadosTreino = JSON.parse(salvo);

        // Cleanup: remover fichas órfãs (não pertencem a nenhum programa)
        const fichaIdsEmUso = new Set(
          (dados.programas || []).flatMap((p) => p.fichaIds)
        );
        const fichasFiltradas = (dados.fichas || []).filter((f) =>
          fichaIdsEmUso.has(f.id)
        );

        return {
          programas: dados.programas || [],
          fichas: fichasFiltradas,
          historico: dados.historico || [],
          exerciciosCustom: dados.exerciciosCustom || [],
        };
      }
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
    }
    return null;
  }

  /** Criar estado inicial vazio */
  private criarEstadoInicial(): TrainifyState {
    return {
      programas: [],
      fichas: [],
      historico: [],
      exerciciosCustom: [],
    };
  }

  /** Salvar dados no localStorage */
  private salvarDados(): void {
    try {
      const dados: DadosTreino = {
        programas: this.estado.programas,
        fichas: this.estado.fichas,
        historico: this.estado.historico,
        exerciciosCustom: this.estado.exerciciosCustom,
      };
      localStorage.setItem(STORAGE_KEYS.DADOS_TREINO, JSON.stringify(dados));
    } catch (erro) {
      console.error("Erro ao salvar dados:", erro);
    }
  }

  /** Limpar todos os dados (útil para testes) */
  limparDados(): void {
    this.estado = this.criarEstadoInicial();
    this.salvarDados();
    this.notificar();
  }
}

/** Instância global do gerenciador de estado */
export const trainifyState = TrainifyStateManager.obterInstancia();
