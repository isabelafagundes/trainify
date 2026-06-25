/* ═══════════════════════════════════════════
   Editor de Ficha — Criar/Editar Fichas (Wizard 3 etapas)
   ═══════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type { Ficha, Exercicio, ExercicioFicha, TipoCardio, Programa } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { SeletorIcone } from "@/interface/widget/formulario/SeletorIcone";
import { PickerExercicios } from "@/interface/widget/formulario/PickerExercicios";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { ModalCopiarFicha } from "@/interface/widget/modal/ModalCopiarFicha";
import { useToast } from "@/interface/widget/toast";

interface PropriedadesEditorFichaPage {
  fichaId?: string;
  programaId?: string; // Opcional - ficha pode existir sem programa
  aoVoltar: () => void;
}

const TIPOS_CARDIO: TipoCardio[] = [
  "Esteira",
  "Bike",
  "Elíptico",
  "Remo",
  "Escada",
  "Pular Corda",
];

const EMOJI_CARDIO: Record<TipoCardio, string> = {
  Esteira: "🏃",
  Bike: "🚴",
  Elíptico: "🌀",
  Remo: "🚣",
  Escada: "🪜",
  "Pular Corda": "🤸",
};

type EtapaWizard = 0 | 1 | 2; // 0: Info básica, 1: Exercícios, 2: Cardio

const ETAPAS = [
  { numero: 1, titulo: "Info básica", descricao: "Nome, descrição e emoji" },
  { numero: 2, titulo: "Exercícios", descricao: "Adicione os exercícios" },
  { numero: 3, titulo: "Cardio", descricao: "Opcional" },
] as const;

export function EditorFichaPage({ fichaId, aoVoltar, programaId }: PropriedadesEditorFichaPage) {
  const { showError } = useToast();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [programasVinculados, setProgramasVinculados] = useState<Programa[]>([]);
  const vinculosProgramasAlteradosRef = useRef(false);

  // Estado do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState<string | null>(null);
  const [exercicios, setExercicios] = useState<ExercicioFicha[]>([]);
  const [cardio, setCardio] = useState<
    { id: string; tipo: TipoCardio; duracaoMinutos: number; nota: string }[]
  >([]);
  const [mostraCardio, setMostraCardio] = useState(false);
  const [mostraPicker, setMostraPicker] = useState(false);

  // Estado do wizard
  const [etapaAtual, setEtapaAtual] = useState<EtapaWizard>(0);

  // Estados dos modais
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);
  const [modalCopiarFichaAberto, setModalCopiarFichaAberto] = useState(false);
  const [modalVincularProgramaAberto, setModalVincularProgramaAberto] = useState(false);

  const editando = Boolean(fichaId);
  const titulo = editando ? "Editar Ficha" : "Nova Ficha";

  // Carregar dados
  useEffect(() => {
    vinculosProgramasAlteradosRef.current = false;

    const carregarDados = () => {
      const exercicios = stateManagerRepository.listarTodosExercicios();
      const programas = stateManagerRepository.listarProgramas();
      setTodosExercicios(exercicios);
      setProgramas(programas);

      if (fichaId) {
        const f = stateManagerRepository.obterFichaPorId(fichaId);
        if (f) {
          setFicha(f);
          setNome(f.nome);
          setDescricao(f.descricao);
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

  // Validações por etapa
  const podeAvancarEtapa0 = () => nome.trim().length > 0;
  const podeAvancarEtapa1 = () => exercicios.length > 0;

  // Handlers de navegação do wizard
  const handleProximoEtapa = () => {
    if (etapaAtual === 0 && !podeAvancarEtapa0()) {
      showError("Digite um nome para a ficha.");
      return;
    }
    if (etapaAtual === 1 && !podeAvancarEtapa1()) {
      showError("Adicione pelo menos um exercício à ficha.");
      return;
    }
    if (etapaAtual < 2) {
      setEtapaAtual((etapaAtual + 1) as EtapaWizard);
    } else {
      handleSalvar();
    }
  };

  const handleEtapaAnterior = () => {
    if (etapaAtual > 0) {
      setEtapaAtual((etapaAtual - 1) as EtapaWizard);
    }
  };

  // Handlers
  const handleSalvar = () => {
    if (!nome.trim()) {
      showError("Digite um nome para a ficha.");
      return;
    }

    if (exercicios.length === 0) {
      showError("Adicione pelo menos um exercício à ficha.");
      return;
    }

    const dadosFicha = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      icone: "halter" as const,
      emoji: icone || undefined,
      exercicios,
      cardio: mostraCardio ? cardio : [],
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
    setExercicios(ficha.exercicios);
    setCardio(ficha.cardio);
    setMostraCardio(ficha.cardio.length > 0);

    setModalCopiarFichaAberto(false);
  };

  const getNomeExercicio = (exercicioId: string): string => {
    const exercicio = todosExercicios.find((e) => e.id === exercicioId);
    return exercicio?.nome || "Exercício não encontrado";
  };

  const textoResumoFicha = () => {
    const partes = [
      `${exercicios.length} ${exercicios.length === 1 ? "exercício" : "exercícios"}`,
    ];

    if (mostraCardio && cardio.length > 0) {
      partes.push(`${cardio.length} ${cardio.length === 1 ? "cardio" : "cardios"}`);
    }

    if (programasVinculados.length > 0) {
      partes.push(`${programasVinculados.length} ${programasVinculados.length === 1 ? "programa" : "programas"}`);
    }

    return partes.join(" · ");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-superficie">
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
            const passoNumero = etapa.numero;
            const atual = passoNumero - 1 === etapaAtual;
            const completo = passoNumero - 1 < etapaAtual;

            return (
              <div key={index} className="flex items-center">
                {/* Bolinha */}
                <button
                  type="button"
                  onClick={() => {
                    // Só permite navegar para etapas anteriores ou a próxima
                    if (passoNumero - 1 <= etapaAtual) {
                      setEtapaAtual((passoNumero - 1) as EtapaWizard);
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
                  disabled={passoNumero - 1 > etapaAtual}
                >
                  {completo ? "✓" : passoNumero}
                </button>

                {/* Conector */}
                {index < ETAPAS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 transition-colors duration-200 ${
                    passoNumero - 1 < etapaAtual ? "bg-texto-primario/30" : "bg-borda-suave"
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
          {/* ETAPA 0: Info básica */}
          {etapaAtual === 0 && (
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
            </div>
          )}

          {/* ETAPA 1: Exercícios */}
          {etapaAtual === 1 && (
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
                    <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                      {exercicios.map((exercicio, index) => {
                        const nomeExercicio = getNomeExercicio(exercicio.exercicioId);
                        return (
                          <CardExercicioConfig
                            key={`${exercicio.exercicioId}-${index}`}
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

          {/* ETAPA 2: Cardio */}
          {etapaAtual === 2 && (
            <div className="space-y-4">
              {/* Programas vinculados */}
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

              {/* Cardio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-texto-primario">
                    Cardio (opcional)
                  </h2>
                  {mostraCardio && (
                    <button
                      type="button"
                      onClick={() => setMostraCardio(false)}
                      className="text-xs text-texto-secundario hover:text-perigo transition-colors"
                    >
                      Remover seção
                    </button>
                  )}
                </div>

                {!mostraCardio ? (
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
                      {TIPOS_CARDIO.map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => handleAdicionarCardio(tipo)}
                          className="
                            group flex items-center gap-2.5 px-3 py-2.5 min-h-[52px]
                            rounded-xl border border-borda bg-superficie text-left
                            hover:border-acento hover:bg-acento/5
                            active:scale-[0.98] transition-all duration-150
                          "
                        >
                          <span className="text-xl leading-none shrink-0">
                            {EMOJI_CARDIO[tipo]}
                          </span>
                          <span className="flex-1 min-w-0 text-[13px] font-medium leading-tight text-texto-primario">
                            {tipo}
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

                      {mostraCardio && cardio.length > 0 && (
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
          {etapaAtual > 0 && (
            <Botao
              variante="secundario"
              onClick={handleEtapaAnterior}
              className="flex-1"
            >
              Anterior
            </Botao>
          )}

          {editando && etapaAtual === 0 && (
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
            {etapaAtual === 0 && "Próximo"}
            {etapaAtual === 1 && "Próximo"}
            {etapaAtual === 2 && (editando ? "Salvar" : "Criar Ficha")}
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
  );
}

/* ── Componentes Internos ── */

interface CardExercicioConfigProps {
  numero: number;
  nome: string;
  config: ExercicioFicha;
  aoAtualizar: (atualizacoes: Partial<ExercicioFicha>) => void;
  aoRemover: () => void;
  semBorda?: boolean;
}

function CardExercicioConfig({
  numero,
  nome,
  config,
  aoAtualizar,
  aoRemover,
  semBorda,
}: CardExercicioConfigProps) {
  return (
    <div
      className={`px-4 py-3 ${semBorda ? "" : "border-b border-borda-suave"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-texto-primario">
          {numero}. {nome}
        </h4>
        <button
          type="button"
          onClick={aoRemover}
          className="text-xs text-texto-secundario hover:text-perigo"
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
  config: { id: string; tipo: TipoCardio; duracaoMinutos: number; nota: string };
  aoAtualizar: (atualizacoes: Partial<CardCardioConfigProps["config"]>) => void;
  aoRemover: () => void;
}

function CardCardioConfig({ config, aoAtualizar, aoRemover }: CardCardioConfigProps) {
  return (
    <div className="px-4 py-3 bg-superficie-suave rounded-xl border border-borda-suave">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg leading-none shrink-0">
            {EMOJI_CARDIO[config.tipo]}
          </span>
          <span className="text-sm font-medium text-texto-primario">
            {config.tipo}
          </span>
          <button
            type="button"
            onClick={aoRemover}
            className="text-xs text-texto-secundario hover:text-perigo ml-auto transition-colors"
          >
            Remover
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-texto-secundario mb-1 block">
              Duração (min)
            </label>
            <CampoNumerico
              valor={config.duracaoMinutos}
              minimo={1}
              maximo={180}
              aoAlterar={(duracaoMinutos) => aoAtualizar({ duracaoMinutos })}
              ariaLabel="Duracao em minutos"
              className="
                w-full px-2 py-2
                bg-superficie border border-borda
                rounded-lg text-sm
                focus:border-acento focus:outline-none
              "
            />
          </div>
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
