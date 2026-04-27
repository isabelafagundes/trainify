/* ═══════════════════════════════════════════
   Tela Principal de Gerenciamento — Trainify
   ═══════════════════════════════════════════ */

import { useEffect, useState } from "react";
import type { Programa, Exercicio } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { BigSwitcher } from "@/interface/widget/formulario/BigSwitcher";
import { ModalConfirmacao } from "@/interface/widget/modal/ModalConfirmacao";

type VisualizacaoGerenciar = "programas" | "exercicios";

interface PropriedadesGerenciarPage {
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

const OPCOES_VISUALIZACAO = [
  { id: "programas", label: "Programas", icone: "clipboard" },
  { id: "exercicios", label: "Exercícios", icone: "alvo" },
] as const;

export function GerenciarPage({ aoNavegar }: PropriedadesGerenciarPage) {
  const [visualizacao, setVisualizacao] = useState<VisualizacaoGerenciar>("programas");
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [exerciciosCustom, setExerciciosCustom] = useState<Exercicio[]>([]);
  const [carregando, setCarregando] = useState(true);

  // IDs de itens sendo excluídos (para animação de fade-out)
  const [programasExcluindo, setProgramasExcluindo] = useState<Set<string>>(new Set());
  const [exerciciosExcluindo, setExerciciosExcluindo] = useState<Set<string>>(new Set());

  // Estado dos modais de confirmação
  const [modalExcluirPrograma, setModalExcluirPrograma] = useState<{ aberto: boolean; id: string | null; nome: string }>({
    aberto: false,
    id: null,
    nome: "",
  });
  const [modalExcluirExercicio, setModalExcluirExercicio] = useState<{ aberto: boolean; id: string | null; nome: string }>({
    aberto: false,
    id: null,
    nome: "",
  });

  // Carregar dados e inscrever para mudanças
  useEffect(() => {
    const carregarDados = () => {
      setProgramas(stateManagerRepository.listarProgramas());
      setExerciciosCustom(stateManagerRepository.listarExerciciosCustom());
      setCarregando(false);
    };

    // Simular loading inicial suave
    const timer = setTimeout(carregarDados, 300);

    const cancelarInscricao = stateManagerRepository.inscrever(carregarDados);
    return () => {
      clearTimeout(timer);
      cancelarInscricao();
    };
  }, []);

  // Texto do contador de exercícios com plural correto
  const textoContadorExercicios = (() => {
    const count = exerciciosCustom.length;
    if (count === 0) return ""; // Vazio quando não há exercícios
    if (count === 1) return "1 exercício customizado";
    return `${count} exercícios customizados`;
  })();

  return (
    <div className="px-5 py-4 space-y-6">
      {/* ── Switcher de Visualização ── */}
      <BigSwitcher
        opcoes={OPCOES_VISUALIZACAO}
        valorSelecionado={visualizacao}
        aoAlterar={(valor) => setVisualizacao(valor as VisualizacaoGerenciar)}
      />

      {/* ── Visualização: Programas ── */}
      <div
        className={`
          transition-opacity duration-200 ease-out
          ${visualizacao === "programas" ? "opacity-100" : "opacity-0 hidden"}
        `}
      >
        <section className="space-y-4">
          {/* Loading Skeleton */}
          {carregando ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                  <div className="px-5 py-4 bg-superficie-suave animate-pulse">
                    <div className="h-5 bg-borda-suave rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-borda-suave rounded w-1/2"></div>
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between">
                    <div className="h-4 bg-borda-suave rounded w-16"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-borda-suave rounded w-16"></div>
                      <div className="h-8 bg-borda-suave rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Header com ação - só mostra quando há programas */}
              {programas.length > 0 && (
                <div className="flex items-center justify-between">
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="mais" tamanho={16} />}
                    onClick={() => aoNavegar("criarPrograma")}
                  >
                    Novo Programa
                  </Botao>
                </div>
              )}

              {programas.length === 0 ? (
                <EstadoVazio
                  icone="clipboard"
                  titulo="Nenhum programa criado"
                  descricao="Crie seu primeiro programa para organizar suas fichas de treino."
                  acao={
                    <Botao
                      variante="secundario"
                      icone={<Icone nome="mais" tamanho={16} />}
                      onClick={() => aoNavegar("criarPrograma")}
                    >
                      Criar Programa
                    </Botao>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {programas.map((programa) => (
                    <CartaoPrograma
                      key={programa.id}
                      programa={programa}
                      estaSendoExcluido={programasExcluindo.has(programa.id)}
                      aoEditar={() => aoNavegar("editarPrograma", { id: programa.id })}
                      aoExcluir={() => abrirModalExcluirPrograma(programa.id, programa.nome)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Visualização: Exercícios ── */}
      <div
        className={`
          transition-opacity duration-200 ease-out
          ${visualizacao === "exercicios" ? "opacity-100" : "opacity-0 hidden"}
        `}
      >
        <section className="space-y-4">
          {/* Loading Skeleton */}
          {carregando ? (
            <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse border-b border-borda-suave last:border-b-0">
                  <div className="flex-1">
                    <div className="h-5 bg-borda-suave rounded w-32 mb-2"></div>
                    <div className="h-4 bg-borda-suave rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-borda-suave rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-texto-sutil">
                  {textoContadorExercicios}
                </span>
                {exerciciosCustom.length > 0 && (
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="mais" tamanho={16} />}
                    onClick={() => alert("Funcionalidade em desenvolvimento: criar exercício customizado")}
                  >
                    Novo
                  </Botao>
                )}
              </div>

              {exerciciosCustom.length === 0 ? (
                <EstadoVazio
                  icone="alvo"
                  titulo="Nenhum exercício customizado"
                  descricao="Crie seus próprios exercícios para usar nas fichas."
                  acao={
                    <Botao
                      variante="secundario"
                      icone={<Icone nome="mais" tamanho={16} />}
                      onClick={() => alert("Funcionalidade em desenvolvimento: criar exercício customizado")}
                    >
                      Criar Exercício
                    </Botao>
                  }
                />
              ) : (
                <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                  {exerciciosCustom.map((exercicio, index) => (
                    <LinhaExercicioCustom
                      key={exercicio.id}
                      exercicio={exercicio}
                      estaSendoExcluido={exerciciosExcluindo.has(exercicio.id)}
                      aoExcluir={() => abrirModalExcluirExercicio(exercicio.id, exercicio.nome)}
                      semBorda={index === exerciciosCustom.length - 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Modais de Confirmação ── */}
      <ModalConfirmacao
        aberto={modalExcluirPrograma.aberto}
        titulo="Excluir programa"
        descricao={`Tem certeza que deseja excluir "${modalExcluirPrograma.nome}"? Todas as fichas deste programa também serão excluídas permanentemente.`}
        textoConfirmar="Excluir"
        textoCancelar="Manter"
        variant="perigo"
        aoConfirmar={handleConfirmarExcluirPrograma}
        aoCancelar={() => setModalExcluirPrograma({ aberto: false, id: null, nome: "" })}
      />

      <ModalConfirmacao
        aberto={modalExcluirExercicio.aberto}
        titulo="Excluir exercício"
        descricao={`Tem certeza que deseja excluir "${modalExcluirExercicio.nome}"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        textoCancelar="Manter"
        variant="perigo"
        aoConfirmar={handleConfirmarExcluirExercicio}
        aoCancelar={() => setModalExcluirExercicio({ aberto: false, id: null, nome: "" })}
      />
    </div>
  );

  // Handlers para abrir modais
  function abrirModalExcluirPrograma(id: string, nome: string) {
    setModalExcluirPrograma({ aberto: true, id, nome });
  }

  function abrirModalExcluirExercicio(id: string, nome: string) {
    setModalExcluirExercicio({ aberto: true, id, nome });
  }

  // Handlers para confirmar exclusão (com fade-out)
  function handleConfirmarExcluirPrograma() {
    if (!modalExcluirPrograma.id) return;

    // Adicionar ao conjunto de itens sendo excluídos
    setProgramasExcluindo((prev) => new Set(prev).add(modalExcluirPrograma.id!));
    setModalExcluirPrograma({ aberto: false, id: null, nome: "" });

    // Aguardar animação de fade-out (200ms)
    setTimeout(() => {
      stateManagerRepository.removerPrograma(modalExcluirPrograma.id!);
      // Remover do conjunto após exclusão
      setProgramasExcluindo((prev) => {
        const novo = new Set(prev);
        novo.delete(modalExcluirPrograma.id!);
        return novo;
      });
    }, 200);
  }

  function handleConfirmarExcluirExercicio() {
    if (!modalExcluirExercicio.id) return;

    // Adicionar ao conjunto de itens sendo excluídos
    setExerciciosExcluindo((prev) => new Set(prev).add(modalExcluirExercicio.id!));
    setModalExcluirExercicio({ aberto: false, id: null, nome: "" });

    // Aguardar animação de fade-out (200ms)
    setTimeout(() => {
      stateManagerRepository.removerExercicioCustom(modalExcluirExercicio.id!);
      // Remover do conjunto após exclusão
      setExerciciosExcluindo((prev) => {
        const novo = new Set(prev);
        novo.delete(modalExcluirExercicio.id!);
        return novo;
      });
    }, 200);
  }
}

/* ── Componentes Internos ── */

interface CartaoProgramaProps {
  programa: Programa;
  estaSendoExcluido?: boolean;
  aoEditar: () => void;
  aoExcluir: () => void;
}

function CartaoPrograma({ programa, estaSendoExcluido = false, aoEditar, aoExcluir }: CartaoProgramaProps) {
  const fichasDoPrograma = stateManagerRepository.obterFichasDoPrograma(programa.id);

  // Cor do banner
  const corBanner = programa.corBanner;
  const classesBanner = corBanner
    ? {
        azul: "bg-[oklch(0.95_0.025_250)] text-[oklch(0.52_0.10_250)]",
        verde: "bg-[oklch(0.95_0.025_155)] text-[oklch(0.52_0.10_155)]",
        roxo: "bg-[oklch(0.95_0.025_300)] text-[oklch(0.50_0.10_300)]",
        laranja: "bg-[oklch(0.95_0.030_55)] text-[oklch(0.55_0.12_55)]",
        rosa: "bg-[oklch(0.95_0.025_350)] text-[oklch(0.52_0.10_350)]",
        vermelho: "bg-[oklch(0.95_0.025_25)] text-[oklch(0.50_0.11_25)]",
        amarelo: "bg-[oklch(0.95_0.030_85)] text-[oklch(0.55_0.11_85)]",
        ciano: "bg-[oklch(0.95_0.020_210)] text-[oklch(0.52_0.08_210)]",
        indigo: "bg-[oklch(0.95_0.025_280)] text-[oklch(0.50_0.11_280)]",
      }[corBanner]
    : "bg-superficie-suave text-texto-secundario";

  return (
    <div
      className={`
        bg-superficie rounded-2xl border border-borda overflow-hidden
        hover:bg-superficie-suave transition-all duration-200
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Banner */}
      <div className={`px-5 py-4 ${classesBanner}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold font-display">{programa.nome}</h3>
              {programa.ativo && (
                <span className="px-2 py-0.5 bg-acento/20 text-acento text-xs font-semibold rounded-full shrink-0">
                  ATIVO
                </span>
              )}
            </div>
            {programa.descricao && (
              <p className="text-sm leading-snug opacity-80">{programa.descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info e ações */}
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-texto-secundario font-medium">
          {fichasDoPrograma.length} {fichasDoPrograma.length === 1 ? "ficha" : "fichas"}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={aoEditar}
            className="px-4 py-2 text-sm font-medium text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={aoExcluir}
            className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

interface LinhaExercicioCustomProps {
  exercicio: Exercicio;
  estaSendoExcluido?: boolean;
  aoExcluir: () => void;
  semBorda?: boolean;
}

function LinhaExercicioCustom({
  exercicio,
  estaSendoExcluido = false,
  aoExcluir,
  semBorda,
}: LinhaExercicioCustomProps) {
  return (
    <div
      className={`
        flex items-center gap-4 px-5 py-4 hover:bg-superficie-suave
        transition-all duration-200
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        ${semBorda ? "" : "border-b border-borda-suave"}
      `}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-texto-primario truncate">
          {exercicio.nome}
        </p>
        <p className="text-sm text-texto-secundario mt-0.5">{exercicio.grupoMuscular}</p>
      </div>

      {/* Ação */}
      <button
        type="button"
        onClick={aoExcluir}
        className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
      >
        Excluir
      </button>
    </div>
  );
}
