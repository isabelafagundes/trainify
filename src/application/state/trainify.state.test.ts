import { beforeEach, describe, expect, it, vi } from "vitest";
import { trainifyState } from "@/application/state/trainify.state";
import type {
  EntradaCardio,
  ExercicioFicha,
  Ficha,
  Programa,
} from "@/domain/tipos";

const dadosVazios = {
  programas: [],
  fichas: [],
  historico: [],
  exerciciosCustom: [],
  cardioCustom: [],
};

/* ── Factories de teste ───────────────────────────────── */

function novoExercicioFicha(
  parcial: Partial<ExercicioFicha> = {}
): ExercicioFicha {
  return {
    exercicioId: "ex-1",
    series: 3,
    repeticoes: 10,
    usaCarga: true,
    descansoSegundos: 60,
    ...parcial,
  };
}

function novaEntradaCardio(parcial: Partial<EntradaCardio> = {}): EntradaCardio {
  return {
    id: "cardio-1",
    tipo: "Esteira",
    duracaoMinutos: 20,
    nota: "",
    ...parcial,
  };
}

/** Cria os dados de uma ficha (sem id — para passar ao adicionarFicha) */
function dadosFicha(parcial: Partial<Omit<Ficha, "id">> = {}): Omit<Ficha, "id"> {
  return {
    nome: "Treino A",
    descricao: "",
    icone: "halter",
    modalidade: "musculacao",
    exercicios: [novoExercicioFicha()],
    cardio: [],
    ...parcial,
  };
}

/** Cria os dados de um programa (sem id — para passar ao adicionarPrograma) */
function dadosPrograma(
  parcial: Partial<Omit<Programa, "id">> = {}
): Omit<Programa, "id"> {
  return {
    nome: "Hipertrofia",
    descricao: "",
    fichaIds: [],
    ativo: false,
    ...parcial,
  };
}

describe("trainifyState", () => {
  beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    trainifyState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
  });

  it("substituirDados aplica dados e preserva atualizadoEm informado", () => {
    const atualizadoEm = "2024-03-04T05:06:07.000Z";

    trainifyState.substituirDados(
      {
        programas: [
          {
            id: "programa-1",
            nome: "Hipertrofia",
            descricao: "",
            fichaIds: [],
            ativo: true,
          },
        ],
        fichas: [],
        historico: [],
        exerciciosCustom: [],
        cardioCustom: [],
      },
      atualizadoEm
    );

    expect(trainifyState.getProgramas()).toHaveLength(1);
    expect(trainifyState.getAtualizadoEm()).toBe(atualizadoEm);
  });

  it("normaliza modalidade de ficha antiga ao substituir dados", () => {
    trainifyState.substituirDados(
      {
        programas: [],
        fichas: [
          {
            id: "ficha-cardio",
            nome: "Cardio",
            descricao: "",
            icone: "halter",
            exercicios: [],
            cardio: [novaEntradaCardio()],
          },
          {
            id: "ficha-musculacao",
            nome: "Musculacao",
            descricao: "",
            icone: "halter",
            exercicios: [novoExercicioFicha()],
            cardio: [],
          },
        ] as unknown as Ficha[],
        historico: [],
        exerciciosCustom: [],
        cardioCustom: [],
      },
      "2024-03-04T05:06:07.000Z"
    );

    expect(trainifyState.getFichaPorId("ficha-cardio")?.modalidade).toBe("cardio");
    expect(trainifyState.getFichaPorId("ficha-musculacao")?.modalidade).toBe("musculacao");
  });

  it("normaliza arrays ausentes em dados antigos ao substituir dados", () => {
    trainifyState.substituirDados(
      {
        programas: [
          {
            id: "programa-legado",
            nome: "Legado",
            descricao: "",
            ativo: true,
          },
        ] as unknown as Programa[],
        fichas: [
          {
            id: "ficha-legada",
            nome: "Ficha legada",
            descricao: "",
          },
        ] as unknown as Ficha[],
        historico: [],
        exerciciosCustom: [],
        cardioCustom: [],
      },
      "2024-03-04T05:06:07.000Z"
    );

    expect(trainifyState.getProgramas()[0]).toMatchObject({
      id: "programa-legado",
      fichaIds: [],
      ativo: true,
    });
    expect(trainifyState.getFichaPorId("ficha-legada")).toMatchObject({
      icone: "halter",
      modalidade: "ambos",
      exercicios: [],
      cardio: [],
    });
  });

  it("gerencia tipos de cardio customizados e customizacao de built-in", () => {
    const custom = trainifyState.adicionarCardioCustom({
      nome: "Caminhada na praia",
      emoji: "🏖️",
      metricas: ["duracaoMinutos", "distanciaKm", "passos"],
    });

    expect(custom.id).toMatch(/^cardio-/);
    expect(trainifyState.getTiposCardio().some((tipo) => tipo.id === custom.id)).toBe(true);

    trainifyState.atualizarCardioCustom("Esteira", {
      metricas: ["duracaoMinutos", "distanciaKm", "inclinacaoPct"],
    });

    expect(trainifyState.getTiposCardio().find((tipo) => tipo.id === "Esteira")?.metricas).toEqual([
      "duracaoMinutos",
      "distanciaKm",
      "inclinacaoPct",
    ]);
    expect(trainifyState.removerCardioCustom("Esteira")).toBe(false);
    expect(trainifyState.removerCardioCustom(custom.id)).toBe(true);
  });

  it("mutacoes locais atualizam atualizadoEm", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-04-05T06:07:08.000Z"));

    trainifyState.substituirDados(dadosVazios, "2024-01-01T00:00:00.000Z");
    trainifyState.adicionarPrograma({
      nome: "Forca",
      descricao: "",
      fichaIds: [],
      ativo: true,
    });

    expect(trainifyState.getAtualizadoEm()).toBe("2024-04-05T06:07:08.000Z");
    vi.useRealTimers();
  });

  /* ══════════════════════════════════════════════════════
     PROGRAMAS — criar / atualizar / remover
     ══════════════════════════════════════════════════════ */
  describe("programas", () => {
    it("adicionarPrograma gera um id e retorna o programa criado", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());

      expect(programa.id).toBeTruthy();
      expect(programa.nome).toBe("Hipertrofia");
      expect(trainifyState.getProgramas()).toHaveLength(1);
    });

    it("ao adicionar um programa ativo, desativa os demais", () => {
      const primeiro = trainifyState.adicionarPrograma(
        dadosPrograma({ nome: "A", ativo: true })
      );
      const segundo = trainifyState.adicionarPrograma(
        dadosPrograma({ nome: "B", ativo: true })
      );

      expect(trainifyState.getProgramaPorId(primeiro.id)?.ativo).toBe(false);
      expect(trainifyState.getProgramaPorId(segundo.id)?.ativo).toBe(true);
      // Só pode existir um programa ativo
      expect(trainifyState.getProgramaAtivo()?.id).toBe(segundo.id);
    });

    it("atualizarPrograma retorna null quando o programa nao existe", () => {
      expect(trainifyState.atualizarPrograma("inexistente", { nome: "X" })).toBeNull();
    });

    it("ao ativar um programa via atualizarPrograma, desativa os demais", () => {
      const a = trainifyState.adicionarPrograma(
        dadosPrograma({ nome: "A", ativo: true })
      );
      const b = trainifyState.adicionarPrograma(dadosPrograma({ nome: "B" }));

      trainifyState.atualizarPrograma(b.id, { ativo: true });

      expect(trainifyState.getProgramaPorId(a.id)?.ativo).toBe(false);
      expect(trainifyState.getProgramaPorId(b.id)?.ativo).toBe(true);
    });

    it("removerPrograma retorna false quando o programa nao existe", () => {
      expect(trainifyState.removerPrograma("inexistente")).toBe(false);
    });

    it("removerPrograma remove o programa mas mantem as fichas (apenas desvincula)", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const ficha = trainifyState.adicionarFicha(dadosFicha(), programa.id);

      const removido = trainifyState.removerPrograma(programa.id);

      expect(removido).toBe(true);
      expect(trainifyState.getProgramaPorId(programa.id)).toBeNull();
      // A ficha continua existindo, agora como orfã
      expect(trainifyState.getFichaPorId(ficha.id)).not.toBeNull();
      expect(trainifyState.getFichasOrfas().map((f) => f.id)).toContain(ficha.id);
    });
  });

  /* ══════════════════════════════════════════════════════
     FICHAS — criar / atualizar / remover
     ══════════════════════════════════════════════════════ */
  describe("fichas", () => {
    it("adicionarFicha gera um id e nao vincula a programa quando programaId e omitido", () => {
      const ficha = trainifyState.adicionarFicha(dadosFicha());

      expect(ficha.id).toBeTruthy();
      expect(trainifyState.getProgramasDaFicha(ficha.id)).toHaveLength(0);
      expect(trainifyState.getFichasOrfas().map((f) => f.id)).toContain(ficha.id);
    });

    it("adicionarFicha vincula automaticamente ao programa quando programaId e fornecido", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const ficha = trainifyState.adicionarFicha(dadosFicha(), programa.id);

      expect(trainifyState.getFichasDoPrograma(programa.id).map((f) => f.id)).toContain(
        ficha.id
      );
      expect(trainifyState.getProgramaPorId(programa.id)?.fichaIds).toContain(ficha.id);
    });

    it("atualizarFicha retorna null quando a ficha nao existe", () => {
      expect(trainifyState.atualizarFicha("inexistente", { nome: "X" })).toBeNull();
    });

    it("removerFicha retorna false quando a ficha nao existe", () => {
      expect(trainifyState.removerFicha("inexistente")).toBe(false);
    });

    it("removerFicha limpa as referencias da ficha em todos os programas", () => {
      const p1 = trainifyState.adicionarPrograma(dadosPrograma({ nome: "P1" }));
      const p2 = trainifyState.adicionarPrograma(dadosPrograma({ nome: "P2" }));
      const ficha = trainifyState.adicionarFicha(dadosFicha(), p1.id);
      trainifyState.vincularFichaAoPrograma(ficha.id, p2.id);

      trainifyState.removerFicha(ficha.id);

      expect(trainifyState.getFichaPorId(ficha.id)).toBeNull();
      expect(trainifyState.getProgramaPorId(p1.id)?.fichaIds).not.toContain(ficha.id);
      expect(trainifyState.getProgramaPorId(p2.id)?.fichaIds).not.toContain(ficha.id);
    });
  });

  /* ══════════════════════════════════════════════════════
     VINCULAR / DESVINCULAR ficha ↔ programa
     ══════════════════════════════════════════════════════ */
  describe("vincular e desvincular", () => {
    it("vincularFichaAoPrograma retorna false quando a ficha nao existe", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      expect(trainifyState.vincularFichaAoPrograma("inexistente", programa.id)).toBe(
        false
      );
    });

    it("vincularFichaAoPrograma retorna false quando o programa nao existe", () => {
      const ficha = trainifyState.adicionarFicha(dadosFicha());
      expect(trainifyState.vincularFichaAoPrograma(ficha.id, "inexistente")).toBe(false);
    });

    it("vincularFichaAoPrograma nao duplica um vinculo existente", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const ficha = trainifyState.adicionarFicha(dadosFicha());

      expect(trainifyState.vincularFichaAoPrograma(ficha.id, programa.id)).toBe(true);
      // Segunda tentativa deve falhar (já vinculada) e não duplicar o id
      expect(trainifyState.vincularFichaAoPrograma(ficha.id, programa.id)).toBe(false);

      const fichaIds = trainifyState.getProgramaPorId(programa.id)?.fichaIds ?? [];
      expect(fichaIds.filter((id) => id === ficha.id)).toHaveLength(1);
    });

    it("uma ficha pode estar vinculada a varios programas ao mesmo tempo", () => {
      const p1 = trainifyState.adicionarPrograma(dadosPrograma({ nome: "P1" }));
      const p2 = trainifyState.adicionarPrograma(dadosPrograma({ nome: "P2" }));
      const ficha = trainifyState.adicionarFicha(dadosFicha());

      trainifyState.vincularFichaAoPrograma(ficha.id, p1.id);
      trainifyState.vincularFichaAoPrograma(ficha.id, p2.id);

      expect(trainifyState.getProgramasDaFicha(ficha.id).map((p) => p.id)).toEqual(
        expect.arrayContaining([p1.id, p2.id])
      );
    });

    it("desvincularFichaDoPrograma retorna false quando o programa nao existe", () => {
      const ficha = trainifyState.adicionarFicha(dadosFicha());
      expect(trainifyState.desvincularFichaDoPrograma(ficha.id, "inexistente")).toBe(
        false
      );
    });

    it("desvincularFichaDoPrograma retorna false quando a ficha nao esta vinculada", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const ficha = trainifyState.adicionarFicha(dadosFicha());
      expect(trainifyState.desvincularFichaDoPrograma(ficha.id, programa.id)).toBe(false);
    });

    it("desvincularFichaDoPrograma remove o vinculo sem apagar a ficha", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const ficha = trainifyState.adicionarFicha(dadosFicha(), programa.id);

      expect(trainifyState.desvincularFichaDoPrograma(ficha.id, programa.id)).toBe(true);
      expect(trainifyState.getProgramaPorId(programa.id)?.fichaIds).not.toContain(
        ficha.id
      );
      expect(trainifyState.getFichaPorId(ficha.id)).not.toBeNull();
    });
  });

  /* ══════════════════════════════════════════════════════
     COPIAR FICHA — onde um bug corromperia dados
     ══════════════════════════════════════════════════════ */
  describe("copiarFicha", () => {
    it("retorna null quando a ficha original nao existe", () => {
      expect(trainifyState.copiarFicha("inexistente")).toBeNull();
    });

    it("cria uma copia com sufixo (copia) e id proprio", () => {
      const original = trainifyState.adicionarFicha(dadosFicha({ nome: "Peito" }));

      const copia = trainifyState.copiarFicha(original.id);

      expect(copia).not.toBeNull();
      expect(copia!.id).not.toBe(original.id);
      expect(copia!.nome).toBe("Peito (cópia)");
      expect(trainifyState.getFichas()).toHaveLength(2);
    });

    it("a copia NAO e vinculada a nenhum programa", () => {
      const programa = trainifyState.adicionarPrograma(dadosPrograma());
      const original = trainifyState.adicionarFicha(dadosFicha(), programa.id);

      const copia = trainifyState.copiarFicha(original.id)!;

      expect(trainifyState.getFichasDoPrograma(programa.id).map((f) => f.id)).not.toContain(
        copia.id
      );
      expect(trainifyState.getFichasOrfas().map((f) => f.id)).toContain(copia.id);
    });

    it("gera novos ids para as entradas de cardio (sem compartilhar referencia)", () => {
      const original = trainifyState.adicionarFicha(
        dadosFicha({ cardio: [novaEntradaCardio({ id: "cardio-orig" })] })
      );

      const copia = trainifyState.copiarFicha(original.id)!;

      expect(copia.cardio).toHaveLength(1);
      expect(copia.cardio[0].id).not.toBe("cardio-orig");
      // Conteúdo preservado, apenas o id muda
      expect(copia.cardio[0].tipo).toBe("Esteira");
    });

    it("copia os exercicios em um array novo (mutar a copia nao afeta o original)", () => {
      const original = trainifyState.adicionarFicha(
        dadosFicha({ exercicios: [novoExercicioFicha({ exercicioId: "ex-A" })] })
      );

      const copia = trainifyState.copiarFicha(original.id)!;

      // Editar a lista de exercícios da cópia
      trainifyState.atualizarFicha(copia.id, {
        exercicios: [novoExercicioFicha({ exercicioId: "ex-B" })],
      });

      const originalAtual = trainifyState.getFichaPorId(original.id)!;
      expect(originalAtual.exercicios.map((e) => e.exercicioId)).toEqual(["ex-A"]);
    });
  });

  /* ══════════════════════════════════════════════════════
     COPIAR PROGRAMA — cópia profunda das fichas vinculadas
     ══════════════════════════════════════════════════════ */
  describe("copiarPrograma", () => {
    it("retorna null quando o programa original nao existe", () => {
      expect(trainifyState.copiarPrograma("inexistente")).toBeNull();
    });

    it("cria uma copia inativa com sufixo (copia) e id proprio", () => {
      const original = trainifyState.adicionarPrograma(
        dadosPrograma({ nome: "Cutting", ativo: true })
      );

      const copia = trainifyState.copiarPrograma(original.id)!;

      expect(copia.id).not.toBe(original.id);
      expect(copia.nome).toBe("Cutting (cópia)");
      // A cópia nunca herda o status de ativo
      expect(copia.ativo).toBe(false);
      expect(trainifyState.getProgramaPorId(original.id)?.ativo).toBe(true);
    });

    it("duplica as fichas vinculadas gerando novos ids (cópia profunda)", () => {
      const original = trainifyState.adicionarPrograma(dadosPrograma());
      const fichaA = trainifyState.adicionarFicha(dadosFicha({ nome: "A" }), original.id);
      const fichaB = trainifyState.adicionarFicha(dadosFicha({ nome: "B" }), original.id);

      const copia = trainifyState.copiarPrograma(original.id)!;
      const fichasCopia = trainifyState.getFichasDoPrograma(copia.id);
      const idsOriginais = [fichaA.id, fichaB.id];

      expect(fichasCopia).toHaveLength(2);
      // As fichas da cópia são objetos novos, não as originais
      fichasCopia.forEach((f) => {
        expect(idsOriginais).not.toContain(f.id);
      });
      // As fichas originais continuam intactas e vinculadas ao programa original
      expect(trainifyState.getFichasDoPrograma(original.id).map((f) => f.id)).toEqual(
        idsOriginais
      );
    });

    it("editar uma ficha do programa copiado nao altera a ficha original", () => {
      const original = trainifyState.adicionarPrograma(dadosPrograma());
      const fichaOriginal = trainifyState.adicionarFicha(
        dadosFicha({ nome: "Original" }),
        original.id
      );

      const copia = trainifyState.copiarPrograma(original.id)!;
      const fichaCopiada = trainifyState.getFichasDoPrograma(copia.id)[0];

      trainifyState.atualizarFicha(fichaCopiada.id, { nome: "Modificada" });

      expect(trainifyState.getFichaPorId(fichaOriginal.id)?.nome).toBe("Original");
      expect(trainifyState.getFichaPorId(fichaCopiada.id)?.nome).toBe("Modificada");
    });

    it("copia um programa sem fichas sem erros", () => {
      const original = trainifyState.adicionarPrograma(dadosPrograma());

      const copia = trainifyState.copiarPrograma(original.id)!;

      expect(copia.fichaIds).toHaveLength(0);
      expect(trainifyState.getFichasDoPrograma(copia.id)).toHaveLength(0);
    });
  });

  /* ══════════════════════════════════════════════════════
     EXERCÍCIOS CUSTOMIZADOS
     ══════════════════════════════════════════════════════ */
  describe("exercicios customizados", () => {
    it("adicionarExercicioCustom gera id com prefixo custom-", () => {
      const exercicio = trainifyState.adicionarExercicioCustom({
        nome: "Crucifixo na polia",
        grupoMuscular: "Peito",
      });

      expect(exercicio.id.startsWith("custom-")).toBe(true);
      expect(trainifyState.getExerciciosCustom()).toHaveLength(1);
      // Fica acessível junto com os exercícios padrão
      expect(trainifyState.getExercicioPorId(exercicio.id)?.nome).toBe(
        "Crucifixo na polia"
      );
    });

    it("removerExercicioCustom retorna false quando o exercicio nao existe", () => {
      expect(trainifyState.removerExercicioCustom("custom-inexistente")).toBe(false);
    });

    it("removerExercicioCustom remove o exercicio existente", () => {
      const exercicio = trainifyState.adicionarExercicioCustom({
        nome: "Remada unilateral",
        grupoMuscular: "Costas",
      });

      expect(trainifyState.removerExercicioCustom(exercicio.id)).toBe(true);
      expect(trainifyState.getExerciciosCustom()).toHaveLength(0);
    });
  });

  /* ══════════════════════════════════════════════════════
     gerarNomeFicha — nomeação automática sequencial
     ══════════════════════════════════════════════════════ */
  describe("gerarNomeFicha", () => {
    it("retorna 'Treino A' quando nao ha fichas", () => {
      expect(trainifyState.gerarNomeFicha()).toBe("Treino A");
    });

    it("pula as letras ja usadas", () => {
      trainifyState.adicionarFicha(dadosFicha({ nome: "Treino A" }));
      trainifyState.adicionarFicha(dadosFicha({ nome: "Treino B" }));

      expect(trainifyState.gerarNomeFicha()).toBe("Treino C");
    });
  });
});
