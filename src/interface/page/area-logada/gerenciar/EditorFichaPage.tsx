/* ═══════════════════════════════════════════
   Editor de Ficha — Criar/Editar Fichas (Wizard 2 etapas)
   A ficha é uma sequência única e ordenada de itens:
   exercícios de força e atividades de cardio intercalados.
   ═══════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type {
  EntradaCardio,
  ChaveMetricaCardio,
  Exercicio,
  ExercicioFicha,
  Ficha,
  ItemFicha,
  Programa,
  TipoCardioDef,
  TipoCardio,
} from "@/domain/tipos";
import { META_METRICA_CARDIO, resolverTipoCardio } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { CampoNumeroOpcional } from "@/interface/widget/formulario/CampoNumeroOpcional";
import { CampoCheck } from "@/interface/widget/formulario/CampoCheck";
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

type EtapaWizard = "info" | "itens";

type PainelAdicionar = "exercicio" | "cardio" | null;

const ETAPAS = [
  { id: "info" as const, titulo: "Info básica", descricao: "Nome, ícone e programas" },
  { id: "itens" as const, titulo: "Itens", descricao: "Monte a sequência do treino" },
];

/** Id estável do item para o dnd-kit (exercícios não se repetem na ficha;
    entradas de cardio têm UUID próprio). */
function idDoItem(item: ItemFicha): string {
  return item.tipo === "exercicio"
    ? `exercicio-${item.exercicio.exercicioId}`
    : `cardio-${item.cardio.id}`;
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
  const [itens, setItens] = useState<ItemFicha[]>([]);
  const [painelAdicionar, setPainelAdicionar] = useState<PainelAdicionar>(null);

  // Estado do wizard
  const [etapaAtual, setEtapaAtual] = useState<EtapaWizard>("info");

  // Sensores de drag-and-drop para reordenar itens.
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
  const indiceEtapaAtual = Math.max(0, ETAPAS.findIndex((etapa) => etapa.id === etapaAtual));

  const totalExercicios = itens.filter((item) => item.tipo === "exercicio").length;
  const totalCardio = itens.filter((item) => item.tipo === "cardio").length;

  // Carregar dados
  useEffect(() => {
    vinculosProgramasAlteradosRef.current = false;
    setEtapaAtual("info");

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
          setIcone(f.emoji || "💪");
          setItens(f.itens);

          // Carregar programas vinculados
          if (!vinculosProgramasAlteradosRef.current) {
            const programasVinc = stateManagerRepository.obterProgramasDaFicha(fichaId);
            setProgramasVinculados(programasVinc);
          }
        }
      } else {
        const nomeGerado = stateManagerRepository.gerarNomeFicha();
        setNome(nomeGerado);
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
  const podeAvancarInfo = () => nome.trim().length > 0;
  const podeAvancarItens = () => itens.length > 0;

  // Handlers de navegacao do wizard
  const handleProximoEtapa = () => {
    if (etapaAtual === "info" && !podeAvancarInfo()) {
      showError("Digite um nome para a ficha.");
      return;
    }
    if (etapaAtual === "itens" && !podeAvancarItens()) {
      showError("Adicione pelo menos um exercício ou cardio à ficha.");
      return;
    }

    const proximaEtapa = ETAPAS[indiceEtapaAtual + 1];
    if (proximaEtapa) {
      setEtapaAtual(proximaEtapa.id);
    } else {
      handleSalvar();
    }
  };

  const handleEtapaAnterior = () => {
    const etapaAnterior = ETAPAS[indiceEtapaAtual - 1];
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

    if (itens.length === 0) {
      showError("Adicione pelo menos um exercício ou cardio à ficha.");
      return;
    }

    const dadosFicha = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      icone: "halter" as const,
      emoji: icone || undefined,
      itens,
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
    setItens((itensAtuais) => [...itensAtuais, { tipo: "exercicio", exercicio: novoExercicio }]);
    setPainelAdicionar(null);
  };

  const handleAdicionarCardio = (tipo: TipoCardio) => {
    setItens((itensAtuais) => [
      ...itensAtuais,
      {
        tipo: "cardio",
        cardio: { id: crypto.randomUUID(), tipo, duracaoMinutos: 20, nota: "" },
      },
    ]);
    setPainelAdicionar(null);
  };

  const handleRemoverItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleAtualizarExercicio = (
    index: number,
    atualizacoes: Partial<ExercicioFicha>
  ) => {
    setItens((itensAtuais) =>
      itensAtuais.map((item, i) =>
        i === index && item.tipo === "exercicio"
          ? { tipo: "exercicio", exercicio: { ...item.exercicio, ...atualizacoes } }
          : item
      )
    );
  };

  const handleAtualizarCardio = (
    index: number,
    atualizacoes: Partial<EntradaCardio>
  ) => {
    setItens((itensAtuais) =>
      itensAtuais.map((item, i) =>
        i === index && item.tipo === "cardio"
          ? { tipo: "cardio", cardio: { ...item.cardio, ...atualizacoes } }
          : item
      )
    );
  };

  const handleReordenarItens = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    setItens((atuais) => {
      const de = atuais.findIndex((item) => idDoItem(item) === active.id);
      const para = atuais.findIndex((item) => idDoItem(item) === over.id);
      if (de === -1 || para === -1) return atuais;
      return arrayMove(atuais, de, para);
    });
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
    setItens(ficha.itens);

    setModalCopiarFichaAberto(false);
  };

  const getNomeExercicio = (exercicioId: string): string => {
    const exercicio = todosExercicios.find((e) => e.id === exercicioId);
    return exercicio?.nome || "Exercício não encontrado";
  };

  const rotuloDoItem = (item: ItemFicha): string => {
    if (item.tipo === "exercicio") {
      return getNomeExercicio(item.exercicio.exercicioId);
    }
    const tipo = resolverTipoCardio(item.cardio.tipo, tiposCardio);
    return tipo.nome;
  };

  const detalheDoItem = (item: ItemFicha): string => {
    return item.tipo === "exercicio"
      ? `${item.exercicio.series}x${item.exercicio.repeticoes}`
      : `${item.cardio.duracaoMinutos}min`;
  };

  const textoResumoFicha = () => {
    const partes: string[] = [];

    if (totalExercicios > 0) {
      partes.push(`${totalExercicios} ${totalExercicios === 1 ? "exercício" : "exercícios"}`);
    }

    if (totalCardio > 0) {
      partes.push(`${totalCardio} ${totalCardio === 1 ? "cardio" : "cardios"}`);
    }

    if (programasVinculados.length > 0) {
      partes.push(`${programasVinculados.length} ${programasVinculados.length === 1 ? "programa" : "programas"}`);
    }

    return partes.length > 0 ? partes.join(" · ") : "Ficha vazia";
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
          {ETAPAS.map((etapa, index) => {
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
                {index < ETAPAS.length - 1 && (
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

          {/* ETAPA 2: Itens do treino (exercícios e cardio numa lista única ordenada) */}
          {etapaAtual === "itens" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-texto-primario">
                  Itens do treino
                </h2>
                {painelAdicionar !== null && (
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="fechar" tamanho={16} />}
                    onClick={() => setPainelAdicionar(null)}
                  >
                    Cancelar
                  </Botao>
                )}
              </div>

              {painelAdicionar === "exercicio" ? (
                <PickerExercicios
                  exercicios={todosExercicios}
                  exercicioIdsSelecionados={itens
                    .filter((item) => item.tipo === "exercicio")
                    .map((item) => (item.tipo === "exercicio" ? item.exercicio.exercicioId : ""))}
                  aoAdicionar={handleAdicionarExercicio}
                  aoCriarExercicioCustom={() => setModalCriarExercicioAberto(true)}
                />
              ) : painelAdicionar === "cardio" ? (
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
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Ações de adicionar */}
                  <div className="grid grid-cols-2 gap-2">
                    <Botao
                      variante="secundario"
                      className="border-dashed"
                      icone={<Icone nome="mais" tamanho={14} />}
                      onClick={() => setPainelAdicionar("exercicio")}
                    >
                      Exercício
                    </Botao>
                    <Botao
                      variante="secundario"
                      className="border-dashed"
                      icone={<Icone nome="mais" tamanho={14} />}
                      onClick={() => setPainelAdicionar("cardio")}
                    >
                      Cardio
                    </Botao>
                  </div>

                  {itens.length === 0 ? (
                    <div className="px-4 py-6 bg-superficie rounded-xl border border-borda text-center">
                      <p className="text-sm text-texto-secundario">
                        Nenhum item adicionado. Monte a sequência do treino com
                        exercícios e cardio na ordem que quiser.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {itens.length > 1 && (
                        <p className="flex items-center gap-1.5 text-xs text-texto-sutil">
                          <IconeArrastar tamanho={14} className="text-texto-sutil" />
                          Arraste pela alça para reordenar
                        </p>
                      )}
                      <DndContext
                        sensors={sensoresDrag}
                        collisionDetection={closestCenter}
                        onDragEnd={handleReordenarItens}
                      >
                        <SortableContext
                          items={itens.map(idDoItem)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                            {itens.map((item, index) =>
                              item.tipo === "exercicio" ? (
                                <CardExercicioConfig
                                  key={idDoItem(item)}
                                  id={idDoItem(item)}
                                  numero={index + 1}
                                  nome={getNomeExercicio(item.exercicio.exercicioId)}
                                  config={item.exercicio}
                                  aoAtualizar={(atualizacoes) =>
                                    handleAtualizarExercicio(index, atualizacoes)
                                  }
                                  aoRemover={() => handleRemoverItem(index)}
                                  semBorda={index === itens.length - 1}
                                />
                              ) : (
                                <CardCardioConfig
                                  key={idDoItem(item)}
                                  id={idDoItem(item)}
                                  numero={index + 1}
                                  config={item.cardio}
                                  tiposCardio={tiposCardio}
                                  aoAtualizar={(atualizacoes) =>
                                    handleAtualizarCardio(index, atualizacoes)
                                  }
                                  aoRemover={() => handleRemoverItem(index)}
                                  semBorda={index === itens.length - 1}
                                />
                              )
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  {/* Resumo final */}
                  {(nome || icone) && (
                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-texto-primario mb-3">
                        Resumo da ficha
                      </h3>
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

                        {itens.length > 0 && (
                          <div className="border-t border-borda-suave">
                            {itens.slice(0, 4).map((item, index) => (
                              <div
                                key={`resumo-${idDoItem(item)}`}
                                className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-borda-suave last:border-b-0"
                              >
                                <span className="text-xs text-texto-secundario truncate">
                                  {index + 1}. {rotuloDoItem(item)}
                                </span>
                                <span className="text-xs font-medium text-texto-primario whitespace-nowrap">
                                  {detalheDoItem(item)}
                                </span>
                              </div>
                            ))}
                            {itens.length > 4 && (
                              <p className="px-4 py-2.5 text-xs text-texto-sutil">
                                +{itens.length - 4} {itens.length - 4 === 1 ? "item" : "itens"}
                              </p>
                            )}
                          </div>
                        )}

                        {programasVinculados.length > 0 && (
                          <div className="px-4 py-3 border-t border-borda-suave">
                            <p className="text-xs font-medium text-texto-primario mb-1">
                              Programas vinculados
                            </p>
                            <p className="text-xs text-texto-secundario">
                              {programasVinculados.map((programa) => programa.nome).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            {indiceEtapaAtual < ETAPAS.length - 1 ? "Próximo" : editando ? "Salvar" : "Criar Ficha"}
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
            variante="caixa"
            valor={config.series}
            minimo={1}
            maximo={20}
            aoAlterar={(series) => aoAtualizar({ series })}
            ariaLabel="Series"
          />
        </div>

        {/* Reps */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Reps
          </label>
          <CampoNumerico
            variante="caixa"
            valor={config.repeticoes}
            minimo={1}
            maximo={100}
            aoAlterar={(repeticoes) => aoAtualizar({ repeticoes })}
            ariaLabel="Repeticoes"
          />
        </div>

        {/* Carga */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Usa carga
          </label>
          <div className="flex h-10 items-center">
            <CampoCheck
              marcado={config.usaCarga}
              aoAlterar={(usaCarga) => aoAtualizar({ usaCarga })}
              ariaLabel="Usa carga"
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
              variante="caixa"
              valor={config.descansoSegundos}
              minimo={10}
              maximo={600}
              passo={10}
              aoAlterar={(descansoSegundos) => aoAtualizar({ descansoSegundos })}
              ariaLabel="Descanso em segundos"
            />
            <span className="text-xs text-texto-sutil">s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardCardioConfigProps {
  id: string;
  numero: number;
  config: EntradaCardio;
  tiposCardio: TipoCardioDef[];
  aoAtualizar: (atualizacoes: Partial<EntradaCardio>) => void;
  aoRemover: () => void;
  semBorda?: boolean;
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
      <CampoNumeroOpcional
        valor={valor}
        decimal={ehDecimal}
        passo={meta.passo}
        aoAlterar={aoAlterar}
      />
    </label>
  );
}

function CardCardioConfig({
  id,
  numero,
  config,
  tiposCardio,
  aoAtualizar,
  aoRemover,
  semBorda,
}: CardCardioConfigProps) {
  const tipo = resolverTipoCardio(config.tipo, tiposCardio);
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
            aria-label={`Reordenar ${tipo.nome}`}
            className="-ml-1.5 shrink-0 touch-none cursor-grab rounded-md p-1 text-texto-sutil hover:text-texto-secundario active:cursor-grabbing"
          >
            <IconeArrastar tamanho={18} />
          </button>
          <h4 className="truncate text-sm font-medium text-texto-primario">
            {numero}. {tipo.emoji ? `${tipo.emoji} ` : ""}{tipo.nome}
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
  );
}
