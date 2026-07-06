/* ═══════════════════════════════════════════
   Editor de Ficha — Criar/Editar Fichas (Wizard 4 etapas)
   ═══════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type {
  EntradaCardio,
  ChaveMetricaCardio,
  Exercicio,
  ExercicioFicha,
  Ficha,
  ModalidadeTreino,
  Programa,
  TipoCardioDef,
  TipoCardio,
} from "@/domain/tipos";
import { META_METRICA_CARDIO, resolverTipoCardio } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { SeletorIcone } from "@/interface/widget/formulario/SeletorIcone";
import { PickerExercicios } from "@/interface/widget/formulario/PickerExercicios";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone, IconeArrastar } from "@/interface/widget/svg/Icone";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { ModalCopiarFicha } from "@/interface/widget/modal/ModalCopiarFicha";
import { useToast } from "@/interface/widget/toast";

interface PropriedadesEditorFichaPage {
  fichaId?: string;
  programaId?: string; // Opcional - ficha pode existir sem programa
  aoVoltar: () => void;
}

type EtapaWizard = "modalidade" | "info" | "exercicios" | "cardio";

// Cards explicativos da primeira etapa: cada modalidade descreve o que o usuário monta a seguir.
const CARDS_MODALIDADE: {
  id: ModalidadeTreino;
  label: string;
  icone: string;
  descricao: string;
}[] = [
  {
    id: "musculacao",
    label: "Musculação",
    icone: "halter",
    descricao: "Treino de força com exercícios, séries, repetições e cargas.",
  },
  {
    id: "cardio",
    label: "Cardio",
    icone: "corrida",
    descricao: "Atividades aeróbicas como corrida, bike e natação, com duração e métricas.",
  },
  {
    id: "ambos",
    label: "Ambos",
    icone: "alvo",
    descricao: "Combine musculação e cardio na mesma ficha — força e condicionamento juntos.",
  },
];

function etapasDaModalidade(modalidade: ModalidadeTreino) {
  return [
    { id: "modalidade" as const, titulo: "Modalidade", descricao: "Escolha o tipo de treino" },
    { id: "info" as const, titulo: "Info básica", descricao: "Nome, ícone e programas" },
    ...(modalidade !== "cardio"
      ? [{ id: "exercicios" as const, titulo: "Exercícios", descricao: "Adicione os exercícios" }]
      : []),
    ...(modalidade !== "musculacao"
      ? [{ id: "cardio" as const, titulo: "Cardio", descricao: modalidade === "cardio" ? "Obrigatório" : "Opcional" }]
      : []),
  ];
}

export function EditorFichaPage({ fichaId, aoVoltar, programaId }: PropriedadesEditorFichaPage) {
  const { showError } = useToast();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
  const [tiposCardio, setTiposCardio] = useState<TipoCardioDef[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [programasVinculados, setProgramasVinculados] = useState<Programa[]>([]);
  const vinculosProgramasAlteradosRef = useRef(false);

  // Estado do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState<ModalidadeTreino>("ambos");
  const [exercicios, setExercicios] = useState<ExercicioFicha[]>([]);
  const [cardio, setCardio] = useState<EntradaCardio[]>([]);
  const [mostraCardio, setMostraCardio] = useState(false);
  const [mostraPicker, setMostraPicker] = useState(false);

  // Estado do wizard
  const [etapaAtual, setEtapaAtual] = useState<EtapaWizard>("modalidade");

  // Sensores de drag-and-drop para reordenar exercícios.
  // PointerSensor cobre mouse e toque; o pequeno limiar evita disparar ao tocar nos campos.
  const sensoresDrag = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Estados dos modais
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);
  const [modalCopiarFichaAberto, setModalCopiarFichaAberto] = useState(false);
  const [modalVincularProgramaAberto, setModalVincularProgramaAberto] = useState(false);

  const editando = Boolean(fichaId);
  const titulo = editando ? "Editar Ficha" : "Nova Ficha";
  const incluiMusculacao = modalidade !== "cardio";
  const incluiCardio = modalidade !== "musculacao";
  const cardioObrigatorio = modalidade === "cardio";
  const cardioVisivel = incluiCardio && (cardioObrigatorio || mostraCardio);
  const etapas = etapasDaModalidade(modalidade);
  const indiceEtapaAtual = Math.max(0, etapas.findIndex((etapa) => etapa.id === etapaAtual));

  // Carregar dados
  useEffect(() => {
    vinculosProgramasAlteradosRef.current = false;
    // Etapa inicial: na criação começamos pela escolha de modalidade;
    // ao editar, a modalidade já existe, então pulamos direto para a info.
    setEtapaAtual(fichaId ? "info" : "modalidade");

    const carregarDados = () => {
      const exercicios = stateManagerRepository.listarTodosExercicios();
      const tiposCardio = stateManagerRepository.listarTiposCardio();
      const programas = stateManagerRepository.listarProgramas();
      setTodosExercicios(exercicios);
      setTiposCardio(tiposCardio);
      setProgramas(programas);

      if (fichaId) {
        const f = stateManagerRepository.obterFichaPorId(fichaId);
        if (f) {
          setFicha(f);
          setNome(f.nome);
          setDescricao(f.descricao);
          setModalidade(f.modalidade);
          setIcone(f.emoji || "💪");
          setExercicios(f.exercicios);
          setCardio(f.cardio);
          setMostraCardio(f.cardio.length > 0);

          // Carregar programas vinculados
          if (!vinculosProgramasAlteradosRef.current) {
            const programasVinc = stateManagerRepository.obterProgramasDaFicha(fichaId);
            setProgramasVinculados(programasVinc);
          }
        }
      } else {
        const nomeGerado = stateManagerRepository.gerarNomeFicha();
        setNome(nomeGerado);
        setModalidade("ambos");
        setIcone("💪");

        // Se foi fornecido um programaId, vincular automaticamente
        if (programaId) {
          const programa = programas.find((p) => p.id === programaId);
          if (programa) {
            setProgramasVinculados([programa]);
            vinculosProgramasAlteradosRef.current = true;
          }
        }
      }
    };

    carregarDados();

    const cancelarInscricao = stateManagerRepository.inscrever(carregarDados);
    return cancelarInscricao;
  }, [fichaId, programaId]);

  // Validacoes por etapa
  const podeAvancarEtapa0 = () => nome.trim().length > 0;
  const podeAvancarEtapa1 = () => exercicios.length > 0;
  const podeAvancarEtapaCardio = () => !cardioObrigatorio || cardio.length > 0;

  // Handlers de navegacao do wizard
  const handleProximoEtapa = () => {
    if (etapaAtual === "info" && !podeAvancarEtapa0()) {
      showError("Digite um nome para a ficha.");
      return;
    }
    if (etapaAtual === "exercicios" && !podeAvancarEtapa1()) {
      showError("Adicione pelo menos um exercício à ficha.");
      return;
    }
    if (etapaAtual === "cardio" && !podeAvancarEtapaCardio()) {
      showError("Adicione pelo menos uma atividade de cardio.");
      return;
    }

    const proximaEtapa = etapas[indiceEtapaAtual + 1];
    if (proximaEtapa) {
      setEtapaAtual(proximaEtapa.id);
    } else {
      handleSalvar();
    }
  };

  const handleEtapaAnterior = () => {
    const etapaAnterior = etapas[indiceEtapaAtual - 1];
    if (etapaAnterior) {
      setEtapaAtual(etapaAnterior.id);
    }
  };

  // Handlers
  const handleSalvar = () => {
    if (!nome.trim()) {
      showError("Digite um nome para a ficha.");
      return;
    }

    if (incluiMusculacao && exercicios.length === 0) {
      showError("Adicione pelo menos um exercício à ficha.");
      return;
    }

    if (cardioObrigatorio && cardio.length === 0) {
      showError("Adicione pelo menos uma atividade de cardio.");
      return;
    }

    const dadosFicha = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      icone: "halter" as const,
      emoji: icone || undefined,
      modalidade,
      exercicios,
      cardio,
    };

    if (editando && ficha) {
      const programasAntesDeSalvar = stateManagerRepository.obterProgramasDaFicha(ficha.id);
      const deveAtualizarVinculos = vinculosProgramasAlteradosRef.current;

      stateManagerRepository.atualizarFicha(ficha.id, dadosFicha);

      // Atualizar vínculos de programas
      if (deveAtualizarVinculos) {
        const programasAntigosIds = new Set(programasAntesDeSalvar.map((p) => p.id));
        const programasNovosIds = new Set(programasVinculados.map((p) => p.id));

        // Desvincular programas removidos
        programasAntesDeSalvar.forEach((p) => {
          if (!programasNovosIds.has(p.id)) {
            stateManagerRepository.desvincularFichaDoPrograma(ficha.id, p.id);
          }
        });

        // Vincular novos programas
        programasVinculados.forEach((p) => {
          if (!programasAntigosIds.has(p.id)) {
            stateManagerRepository.vincularFichaAoPrograma(ficha.id, p.id);
          }
        });
      }
    } else {
      // Criar nova ficha
      const novaFicha = stateManagerRepository.adicionarFicha(dadosFicha);

      // Vincular aos programas selecionados
      programasVinculados.forEach((p) => {
        stateManagerRepository.vincularFichaAoPrograma(novaFicha.id, p.id);
      });
    }

    aoVoltar();
  };

  const handleAdicionarExercicio = (exercicioId: string) => {
    const novoExercicio: ExercicioFicha = {
      exercicioId,
      series: 3,
      repeticoes: 12,
      usaCarga: true,
      descansoSegundos: 60,
    };
    setExercicios((exerciciosAtuais) => [...exerciciosAtuais, novoExercicio]);
    setMostraPicker(false);
  };

  const handleRemoverExercicio = (index: number) => {
    setExercicios(exercicios.filter((_, i) => i !== index));
  };

  const handleAtualizarExercicio = (
    index: number,
    atualizacoes: Partial<ExercicioFicha>
  ) => {
    const novosExercicios = [...exercicios];
    novosExercicios[index] = { ...novosExercicios[index], ...atualizacoes };
    setExercicios(novosExercicios);
  };

  const handleReordenarExercicios = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    setExercicios((itens) => {
      const de = itens.findIndex((e) => e.exercicioId === active.id);
      const para = itens.findIndex((e) => e.exercicioId === over.id);
      if (de === -1 || para === -1) return itens;
      return arrayMove(itens, de, para);
    });
  };

  const handleAdicionarCardio = (tipo: TipoCardio) => {
    setCardio([
      ...cardio,
      { id: crypto.randomUUID(), tipo, duracaoMinutos: 20, nota: "" },
    ]);
  };

  const handleRemoverCardio = (index: number) => {
    const novosCardio = cardio.filter((_, i) => i !== index);
    setCardio(novosCardio);
    if (novosCardio.length === 0) {
      setMostraCardio(false);
    }
  };

  const handleAtualizarCardio = (
    index: number,
    atualizacoes: Partial<(typeof cardio)[0]>
  ) => {
    const novosCardio = [...cardio];
    novosCardio[index] = { ...novosCardio[index], ...atualizacoes };
    setCardio(novosCardio);
  };

  const handleCopiar = () => {
    if (!editando) return;

    if (confirm("Deseja criar uma cópia desta ficha?")) {
      const copia = stateManagerRepository.copiarFicha(fichaId!);
      if (copia) {
        aoVoltar();
      }
    }
  };

  const handleCriarExercicioCustom = (exercicio: Omit<Exercicio, "id">) => {
    const novoExercicio = stateManagerRepository.adicionarExercicioCustom(exercicio);
    setTodosExercicios((exerciciosAtuais) => [...exerciciosAtuais, novoExercicio]);
    handleAdicionarExercicio(novoExercicio.id);
    setModalCriarExercicioAberto(false);
  };

  const handleCopiarFichaExistente = (fichaId: string) => {
    const ficha = stateManagerRepository.obterFichaPorId(fichaId);
    if (!ficha) return;

    setNome(ficha.nome.replace(/\s*\(cópia\)$/, ""));
    setDescricao(ficha.descricao);
    setIcone(ficha.emoji || "💪");
    setModalidade(ficha.modalidade);
    setExercicios(ficha.exercicios);
    setCardio(ficha.cardio);
    setMostraCardio(ficha.cardio.length > 0);

    setModalCopiarFichaAberto(false);
  };

  // Etapa 1: escolher a modalidade nos cards seleciona e avança direto para a info.
  const handleSelecionarModalidade = (novaModalidade: ModalidadeTreino) => {
    setModalidade(novaModalidade);
    setEtapaAtual("info");
  };

  const getNomeExercicio = (exercicioId: string): string => {
    const exercicio = todosExercicios.find((e) => e.id === exercicioId);
    return exercicio?.nome || "Exercício não encontrado";
  };

  const textoResumoFicha = () => {
    const partes = [
      `${exercicios.length} ${exercicios.length === 1 ? "exercício" : "exercícios"}`,
    ];

    if (incluiCardio && cardio.length > 0) {
      partes.push(`${cardio.length} ${cardio.length === 1 ? "cardio" : "cardios"}`);
    }

    if (programasVinculados.length > 0) {
      partes.push(`${programasVinculados.length} ${programasVinculados.length === 1 ? "programa" : "programas"}`);
    }

    return partes.join(" · ");
  };

  return (
    <>
      {/* Backdrop do drawer — apenas tablet/desktop (md+); fecha ao clicar fora. */}
      <div
        className="hidden md:block fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={aoVoltar}
        aria-hidden="true"
      />
      {/* Tela cheia no mobile; drawer lateral à direita no md+. */}
      <div className="fixed inset-0 z-[60] flex flex-col bg-superficie md:left-auto md:right-0 md:w-full md:max-w-[560px] md:border-l md:border-borda md:shadow-2xl md-drawer-enter">
      {/* Header fixo */}
      <div className="px-5 pt-[max(var(--safe-top),16px)] pb-4 border-b border-borda shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-display tracking-tight text-texto-primario">
            {titulo}
          </h1>
          <button
            type="button"
            onClick={aoVoltar}
            className="flex items-center gap-1.5 px-2 -mr-2 text-texto-secundario hover:text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
          >
            <span className="text-sm">Fechar</span>
            <Icone nome="fechar" tamanho={20} />
          </button>
        </div>

        {/* Indicador de etapas - minimalista */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {etapas.map((etapa, index) => {
            const passoNumero = index + 1;
            const atual = etapa.id === etapaAtual;
            const completo = index < indiceEtapaAtual;

            return (
              <div key={index} className="flex items-center">
                {/* Bolinha */}
                <button
                  type="button"
                  onClick={() => {
                    if (index <= indiceEtapaAtual) {
                      setEtapaAtual(etapa.id);
                    }
                  }}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    text-xs font-medium transition-all duration-200
                    ${atual
                      ? "bg-acento text-texto-invertido scale-110 shadow-sm"
                      : completo
                      ? "bg-texto-primario text-superficie hover:bg-texto-primario/90"
                      : "bg-borda-suave text-texto-sutil"
                    }
                  `}
                  disabled={index > indiceEtapaAtual}
                >
                  {completo ? "✓" : passoNumero}
                </button>

                {/* Conector */}
                {index < etapas.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 transition-colors duration-200 ${
                    index < indiceEtapaAtual ? "bg-texto-primario/30" : "bg-borda-suave"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-5 py-4 pb-6">
          {/* ETAPA 0: Modalidade */}
          {etapaAtual === "modalidade" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold font-display text-texto-primario">
                  Qual o tipo de treino?
                </h2>
                <p className="text-sm text-texto-secundario mt-1">
                  Escolha a modalidade desta ficha. Isso define os próximos passos — você pode alterar depois.
                </p>
              </div>

              <div className="space-y-3">
                {CARDS_MODALIDADE.map((card) => {
                  const selecionado = modalidade === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelecionarModalidade(card.id)}
                      aria-pressed={selecionado}
                      className={`
                        group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left
                        transition-all duration-150 active:scale-[0.99]
                        ${selecionado
                          ? "border-acento bg-acento/5 ring-1 ring-acento shadow-sm"
                          : "border-borda bg-superficie hover:border-acento/50 hover:bg-superficie-hover"
                        }
                      `}
                    >
                      <span
                        className={`
                          flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                          transition-colors duration-150
                          ${selecionado
                            ? "bg-acento text-texto-invertido"
                            : "bg-superficie-suave text-texto-secundario group-hover:text-texto-primario"
                          }
                        `}
                      >
                        <Icone nome={card.icone} tamanho={24} />
                      </span>

                      <span className="min-w-0 flex-1 pr-6">
                        <span className="block text-sm font-semibold text-texto-primario">
                          {card.label}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-texto-secundario">
                          {card.descricao}
                        </span>
                      </span>

                      <span
                        className={`
                          absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border
                          transition-all duration-150
                          ${selecionado
                            ? "border-acento bg-acento text-texto-invertido"
                            : "border-borda text-transparent"
                          }
                        `}
                        aria-hidden="true"
                      >
                        <Icone nome="check" tamanho={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ETAPA 1: Info básica */}
          {etapaAtual === "info" && (
            <div className="space-y-6">
              {/* Copiar de existente */}
              <Botao
                variante="secundario"
                tamanho="compacto"
                className="w-full"
                icone={<Icone nome="copiar" tamanho={14} />}
                onClick={() => setModalCopiarFichaAberto(true)}
              >
                Copiar de existente
              </Botao>

              <Input
                label="Nome da ficha"
                tipo="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Treino A"
              />

              <Input
                label="Descrição (opcional)"
                tipo="textarea"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Foco em peito e tríceps"
                linhas={2}
              />

              <SeletorIcone valor={icone} aoAlterar={setIcone} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-texto-primario">
                    Programas
                  </h2>
                  {programas.length > programasVinculados.length && (
                    <Botao
                      variante="fantasma"
                      tamanho="compacto"
                      icone={<Icone nome="mais" tamanho={14} />}
                      onClick={() => setModalVincularProgramaAberto(true)}
                    >
                      Vincular
                    </Botao>
                  )}
                </div>

                {programasVinculados.length === 0 ? (
                  <div className="px-4 py-4 bg-superficie-suave rounded-xl border border-borda-suave text-center">
                    <p className="text-sm text-texto-secundario">
                      {programas.length === 0
                        ? "Crie um programa primeiro para vincular a esta ficha."
                        : "Esta ficha não está vinculada a nenhum programa."}
                    </p>
                    {programas.length > 0 && (
                      <Botao
                        variante="secundario"
                        tamanho="compacto"
                        className="mt-2"
                        icone={<Icone nome="mais" tamanho={14} />}
                        onClick={() => setModalVincularProgramaAberto(true)}
                      >
                        Vincular ao programa
                      </Botao>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {programasVinculados.map((programa) => (
                      <div
                        key={programa.id}
                        className="flex items-center gap-2 px-3 py-2 bg-superficie-suave rounded-lg border border-borda-suave"
                      >
                        <span className="text-sm font-medium text-texto-primario">
                          {programa.nome}
                        </span>
                        {programa.ativo && (
                          <span className="w-2 h-2 rounded-full bg-acento" title="Ativo" />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            vinculosProgramasAlteradosRef.current = true;
                            setProgramasVinculados(programasVinculados.filter((p) => p.id !== programa.id));
                          }}
                          className="text-texto-secundario hover:text-perigo transition-colors"
                        >
                          <Icone nome="fechar" tamanho={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 2: Exercícios */}
          {etapaAtual === "exercicios" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-texto-primario">
                  Exercícios
                </h2>
                {mostraPicker ? (
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="fechar" tamanho={16} />}
                    onClick={() => setMostraPicker(false)}
                  >
                    Cancelar
                  </Botao>
                ) : (
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="mais" tamanho={16} />}
                    onClick={() => setMostraPicker(true)}
                  >
                    Adicionar
                  </Botao>
                )}
              </div>

              {mostraPicker ? (
                <PickerExercicios
                  exercicios={todosExercicios}
                  exercicioIdsSelecionados={exercicios.map((e) => e.exercicioId)}
                  aoAdicionar={handleAdicionarExercicio}
                  aoCriarExercicioCustom={() => setModalCriarExercicioAberto(true)}
                />
              ) : (
                <div className="space-y-3">
                  {exercicios.length === 0 ? (
                    <div className="px-4 py-6 bg-superficie rounded-xl border border-borda text-center">
                      <p className="text-sm text-texto-secundario">
                        Nenhum exercício adicionado.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {exercicios.length > 1 && (
                        <p className="flex items-center gap-1.5 text-xs text-texto-sutil">
                          <IconeArrastar tamanho={14} className="text-texto-sutil" />
                          Arraste pela alça para reordenar
                        </p>
                      )}
                      <DndContext
                        sensors={sensoresDrag}
                        collisionDetection={closestCenter}
                        onDragEnd={handleReordenarExercicios}
                      >
                        <SortableContext
                          items={exercicios.map((e) => e.exercicioId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                            {exercicios.map((exercicio, index) => {
                              const nomeExercicio = getNomeExercicio(exercicio.exercicioId);
                              return (
                                <CardExercicioConfig
                                  key={exercicio.exercicioId}
                                  id={exercicio.exercicioId}
                                  numero={index + 1}
                                  nome={nomeExercicio}
                                  config={exercicio}
                                  aoAtualizar={(atualizacoes) =>
                                    handleAtualizarExercicio(index, atualizacoes)
                                  }
                                  aoRemover={() => handleRemoverExercicio(index)}
                                  semBorda={index === exercicios.length - 1}
                                />
                              );
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-texto-primario mb-3">
                      Prévia da ficha
                    </h3>
                    <div className="bg-superficie-suave rounded-xl border border-borda-suave overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-2xl shrink-0">{icone || "💪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-texto-primario truncate">
                            {nome || "Nome da ficha"}
                          </p>
                          <p className="text-xs text-texto-secundario">
                            {exercicios.length === 0
                              ? "Adicione exercícios para montar a ficha"
                              : `${exercicios.length} ${exercicios.length === 1 ? "exercício configurado" : "exercícios configurados"}`}
                          </p>
                        </div>
                      </div>

                      {exercicios.length > 0 && (
                        <div className="border-t border-borda-suave">
                          {exercicios.slice(0, 3).map((exercicio, index) => (
                            <div
                              key={`preview-${exercicio.exercicioId}-${index}`}
                              className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-borda-suave last:border-b-0"
                            >
                              <span className="text-xs text-texto-secundario truncate">
                                {index + 1}. {getNomeExercicio(exercicio.exercicioId)}
                              </span>
                              <span className="text-xs font-medium text-texto-primario whitespace-nowrap">
                                {exercicio.series}x{exercicio.repeticoes}
                              </span>
                            </div>
                          ))}
                          {exercicios.length > 3 && (
                            <p className="px-4 py-2.5 text-xs text-texto-sutil">
                              +{exercicios.length - 3} {exercicios.length - 3 === 1 ? "exercício" : "exercícios"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: Cardio */}
          {etapaAtual === "cardio" && (
            <div className="space-y-4">
              {/* Cardio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-texto-primario">
                    {cardioObrigatorio ? "Cardio" : "Cardio (opcional)"}
                  </h2>
                  {!cardioObrigatorio && mostraCardio && (
                    <button
                      type="button"
                      onClick={() => {
                        setMostraCardio(false);
                        setCardio([]);
                      }}
                      className="text-xs text-texto-secundario hover:text-perigo transition-colors"
                    >
                      Remover seção
                    </button>
                  )}
                </div>

                {!cardioVisivel ? (
                  <Botao
                    variante="secundario"
                    onClick={() => setMostraCardio(true)}
                    className="w-full border-dashed"
                  >
                    + Adicionar seção de cardio
                  </Botao>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-texto-sutil">
                      Toque para adicionar uma atividade
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {tiposCardio.map((tipo) => (
                        <button
                          key={tipo.id}
                          type="button"
                          onClick={() => handleAdicionarCardio(tipo.id)}
                          className="
                            group flex items-center gap-2.5 px-3 py-2.5 min-h-[52px]
                            rounded-xl border border-borda bg-superficie text-left
                            hover:border-acento hover:bg-acento/5
                            active:scale-[0.98] transition-all duration-150
                          "
                        >
                          <span className="text-xl leading-none shrink-0">
                            {tipo.emoji}
                          </span>
                          <span className="flex-1 min-w-0 text-[13px] font-medium leading-tight text-texto-primario">
                            {tipo.nome}
                          </span>
                          <span
                            className="
                              flex h-6 w-6 shrink-0 items-center justify-center
                              rounded-full bg-superficie-suave text-texto-sutil
                              transition-colors duration-150
                              group-hover:bg-acento group-hover:text-texto-invertido
                            "
                            aria-hidden="true"
                          >
                            <Icone nome="mais" tamanho={14} />
                          </span>
                        </button>
                      ))}
                    </div>

                    {cardio.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {cardio.map((entrada, index) => (
                          <CardCardioConfig
                            key={entrada.id}
                            config={entrada}
                            tiposCardio={tiposCardio}
                            aoAtualizar={(atualizacoes) =>
                              handleAtualizarCardio(index, atualizacoes)
                            }
                            aoRemover={() => handleRemoverCardio(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resumo final */}
              {(nome || icone) && (
                <div className="pt-4 border-t border-borda-suave">
                  <h3 className="text-sm font-medium text-texto-primario mb-3">Resumo final</h3>
                  <div className="bg-superficie-suave rounded-xl border border-borda-suave overflow-hidden">
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="text-3xl shrink-0">{icone || "💪"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-texto-primario truncate">
                          {nome || "Nome da ficha"}
                        </p>
                        {descricao && (
                          <p className="text-xs text-texto-secundario line-clamp-2">
                            {descricao}
                          </p>
                        )}
                        <p className="text-xs text-texto-sutil mt-1">
                          {textoResumoFicha()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-borda-suave divide-y divide-borda-suave">
                      {incluiMusculacao && (
                      <div className="px-4 py-3">
                        <p className="text-xs font-medium text-texto-primario mb-2">
                          Exercícios
                        </p>
                        <div className="space-y-1.5">
                          {exercicios.slice(0, 4).map((exercicio, index) => (
                            <div
                              key={`resumo-${exercicio.exercicioId}-${index}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-xs text-texto-secundario truncate">
                                {index + 1}. {getNomeExercicio(exercicio.exercicioId)}
                              </span>
                              <span className="text-xs font-medium text-texto-primario whitespace-nowrap">
                                {exercicio.series}x{exercicio.repeticoes}
                              </span>
                            </div>
                          ))}
                          {exercicios.length > 4 && (
                            <p className="text-xs text-texto-sutil">
                              +{exercicios.length - 4} {exercicios.length - 4 === 1 ? "exercício" : "exercícios"}
                            </p>
                          )}
                        </div>
                      </div>
                      )}

                      {incluiCardio && cardio.length > 0 && (
                        <div className="px-4 py-3">
                          <p className="text-xs font-medium text-texto-primario mb-2">
                            Cardio
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cardio.map((entrada) => (
                              <span
                                key={entrada.id}
                                className="px-2 py-1 rounded-md bg-superficie border border-borda-suave text-xs text-texto-secundario"
                              >
                                {entrada.tipo} · {entrada.duracaoMinutos}min
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {programasVinculados.length > 0 && (
                        <div className="px-4 py-3">
                          <p className="text-xs font-medium text-texto-primario mb-2">
                            Programas vinculados
                          </p>
                          <p className="text-xs text-texto-secundario">
                            {programasVinculados.map((programa) => programa.nome).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer fixo com botões */}
      <div className="shrink-0 px-5 pt-4 pb-[max(var(--safe-bottom),16px)] border-t border-borda bg-superficie/95 backdrop-blur-sm">
        <div className="max-w-[480px] mx-auto flex gap-3">
          {indiceEtapaAtual > 0 && (
            <Botao
              variante="secundario"
              onClick={handleEtapaAnterior}
              className="flex-1"
            >
              Anterior
            </Botao>
          )}

          {editando && etapaAtual === "info" && (
            <Botao
              variante="secundario"
              onClick={handleCopiar}
              className="flex-1"
            >
              Copiar
            </Botao>
          )}

          <Botao
            variante="primario"
            onClick={handleProximoEtapa}
            className="flex-1"
          >
            {indiceEtapaAtual < etapas.length - 1 ? "Próximo" : editando ? "Salvar" : "Criar Ficha"}
          </Botao>
        </div>
      </div>

      {/* Modais */}
      <ModalCriarExercicio
        aberto={modalCriarExercicioAberto}
        aoCriar={handleCriarExercicioCustom}
        aoCancelar={() => setModalCriarExercicioAberto(false)}
      />

      <ModalCopiarFicha
        aberto={modalCopiarFichaAberto}
        aoCopiar={handleCopiarFichaExistente}
        aoCancelar={() => setModalCopiarFichaAberto(false)}
        fichaIdAtual={fichaId}
      />

      {/* Modal de vincular programas */}
      {modalVincularProgramaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-superficie rounded-2xl w-full max-w-sm mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-borda">
              <h3 className="text-lg font-semibold">Vincular a programas</h3>
            </div>
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {programas
                  .filter((p) => !programasVinculados.some((v) => v.id === p.id))
                  .map((programa) => (
                    <button
                      key={programa.id}
                      type="button"
                      onClick={() => {
                        vinculosProgramasAlteradosRef.current = true;
                        setProgramasVinculados([...programasVinculados, programa]);
                        setModalVincularProgramaAberto(false);
                      }}
                      className="w-full px-4 py-3 bg-superficie-suave hover:bg-superficie-hover rounded-lg border border-borda-suave text-left transition-colors"
                    >
                      <p className="text-sm font-medium text-texto-primario">{programa.nome}</p>
                      {programa.descricao && (
                        <p className="text-xs text-texto-secundario truncate">{programa.descricao}</p>
                      )}
                    </button>
                  ))}
                {programas.filter((p) => !programasVinculados.some((v) => v.id === p.id)).length === 0 && (
                  <p className="text-sm text-texto-sutil text-center py-4">
                    Todos os programas já estão vinculados
                  </p>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-borda flex justify-end">
              <Botao
                variante="fantasma"
                onClick={() => setModalVincularProgramaAberto(false)}
              >
                Cancelar
              </Botao>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

/* ── Componentes Internos ── */

interface CardExercicioConfigProps {
  id: string;
  numero: number;
  nome: string;
  config: ExercicioFicha;
  aoAtualizar: (atualizacoes: Partial<ExercicioFicha>) => void;
  aoRemover: () => void;
  semBorda?: boolean;
}

function CardExercicioConfig({
  id,
  numero,
  nome,
  config,
  aoAtualizar,
  aoRemover,
  semBorda,
}: CardExercicioConfigProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-superficie px-4 py-3 ${
        semBorda ? "" : "border-b border-borda-suave"
      } ${isDragging ? "z-10 opacity-90 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reordenar ${nome}`}
            className="-ml-1.5 shrink-0 touch-none cursor-grab rounded-md p-1 text-texto-sutil hover:text-texto-secundario active:cursor-grabbing"
          >
            <IconeArrastar tamanho={18} />
          </button>
          <h4 className="truncate text-sm font-medium text-texto-primario">
            {numero}. {nome}
          </h4>
        </div>
        <button
          type="button"
          onClick={aoRemover}
          className="shrink-0 text-xs text-texto-secundario hover:text-perigo"
        >
          Remover
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* Séries */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Séries
          </label>
          <CampoNumerico
            valor={config.series}
            minimo={1}
            maximo={20}
            aoAlterar={(series) => aoAtualizar({ series })}
            ariaLabel="Series"
            className="
              w-full px-2 py-2
              bg-superficie-suave border border-borda
              rounded-lg text-sm text-center
              focus:border-acento focus:outline-none
            "
          />
        </div>

        {/* Reps */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Reps
          </label>
          <CampoNumerico
            valor={config.repeticoes}
            minimo={1}
            maximo={100}
            aoAlterar={(repeticoes) => aoAtualizar({ repeticoes })}
            ariaLabel="Repeticoes"
            className="
              w-full px-2 py-2
              bg-superficie-suave border border-borda
              rounded-lg text-sm text-center
              focus:border-acento focus:outline-none
            "
          />
        </div>

        {/* Carga */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Usa carga
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.usaCarga}
              onChange={(e) => aoAtualizar({ usaCarga: e.target.checked })}
              className="
                w-5 h-5 rounded-md border-2 border-borda
                checked:bg-acento checked:border-acento
                focus:ring-2 focus:ring-acento/20
              "
            />
          </div>
        </div>

        {/* Descanso */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Descanso
          </label>
          <div className="flex items-center gap-1">
            <CampoNumerico
              valor={config.descansoSegundos}
              minimo={10}
              maximo={600}
              passo={10}
              aoAlterar={(descansoSegundos) => aoAtualizar({ descansoSegundos })}
              ariaLabel="Descanso em segundos"
              className="
                w-full px-2 py-2
                bg-superficie-suave border border-borda
                rounded-lg text-sm text-center
                focus:border-acento focus:outline-none
              "
            />
            <span className="text-xs text-texto-sutil">s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardCardioConfigProps {
  config: EntradaCardio;
  tiposCardio: TipoCardioDef[];
  aoAtualizar: (atualizacoes: Partial<CardCardioConfigProps["config"]>) => void;
  aoRemover: () => void;
}

function CampoMetricaCardioConfig({
  metrica,
  valor,
  aoAlterar,
}: {
  metrica: ChaveMetricaCardio;
  valor: number | undefined;
  aoAlterar: (valor: number | undefined) => void;
}) {
  const meta = META_METRICA_CARDIO[metrica];
  const ehDecimal = meta.passo < 1;

  return (
    <label className="block">
      <span className="text-xs text-texto-secundario mb-1 block">
        {meta.rotulo}{meta.unidade ? ` (${meta.unidade})` : ""}
      </span>
      <input
        type="number"
        value={valor ?? ""}
        min={0}
        step={meta.passo}
        inputMode={ehDecimal ? "decimal" : "numeric"}
        onChange={(e) => {
          const texto = e.target.value.replace(",", ".");
          aoAlterar(texto === "" ? undefined : Number(texto));
        }}
        className="
          w-full px-2 py-2
          bg-superficie border border-borda
          rounded-lg text-sm
          focus:border-acento focus:outline-none
        "
      />
    </label>
  );
}

function CardCardioConfig({ config, tiposCardio, aoAtualizar, aoRemover }: CardCardioConfigProps) {
  const tipo = resolverTipoCardio(config.tipo, tiposCardio);

  return (
    <div className="px-4 py-3 bg-superficie-suave rounded-xl border border-borda-suave">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg leading-none shrink-0">
            {tipo.emoji}
          </span>
          <span className="text-sm font-medium text-texto-primario">
            {tipo.nome}
          </span>
          <button
            type="button"
            onClick={aoRemover}
            className="text-xs text-texto-secundario hover:text-perigo ml-auto transition-colors"
          >
            Remover
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tipo.metricas.map((metrica) => (
            <CampoMetricaCardioConfig
              key={metrica}
              metrica={metrica}
              valor={config[metrica]}
              aoAlterar={(valor) =>
                aoAtualizar({ [metrica]: metrica === "duracaoMinutos" ? valor ?? 0 : valor })
              }
            />
          ))}
        </div>

        <div className="mt-2">
          <Input
            tipo="text"
            value={config.nota}
            onChange={(e) => aoAtualizar({ nota: e.target.value })}
            placeholder="Nota opcional (ex: zona 2)"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
