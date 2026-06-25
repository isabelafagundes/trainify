/* ═══════════════════════════════════════════
   Tela Principal de Gerenciamento — Trainify
   ═══════════════════════════════════════════ */

import { useEffect, useMemo, useState } from "react";
import type { Programa, Exercicio, Ficha } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { BigSwitcher } from "@/interface/widget/formulario/BigSwitcher";
import { ModalConfirmacao } from "@/interface/widget/modal/ModalConfirmacao";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { useToast } from "@/interface/widget/toast";

type VisualizacaoGerenciar = "programas" | "fichas" | "exercicios";
type TipoExclusaoGerenciar = "programa" | "exercicio" | "ficha";

interface ModalExclusaoGerenciar {
  aberto: boolean;
  tipo: TipoExclusaoGerenciar | null;
  id: string | null;
  nome: string;
}

type ItensExcluindoGerenciar = Record<TipoExclusaoGerenciar, Set<string>>;

interface PropriedadesGerenciarPage {
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

const OPCOES_VISUALIZACAO = [
  { id: "programas", label: "Programas", icone: "clipboard" },
  { id: "fichas", label: "Fichas", icone: "halter" },
  { id: "exercicios", label: "Exercícios", icone: "alvo" },
];

const MODAL_EXCLUSAO_FECHADO: ModalExclusaoGerenciar = {
  aberto: false,
  tipo: null,
  id: null,
  nome: "",
};

const CONFIG_EXCLUSAO_GERENCIAR: Record<
  TipoExclusaoGerenciar,
  {
    titulo: string;
    descricao: (nome: string) => string;
    remover: (id: string) => void;
  }
> = {
  programa: {
    titulo: "Excluir programa",
    descricao: (nome) => `Tem certeza que deseja excluir "${nome}"? As fichas serão desvinculadas mas não excluídas.`,
    remover: (id) => stateManagerRepository.removerPrograma(id),
  },
  exercicio: {
    titulo: "Excluir exercício",
    descricao: (nome) => `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
    remover: (id) => stateManagerRepository.removerExercicioCustom(id),
  },
  ficha: {
    titulo: "Excluir ficha",
    descricao: (nome) => `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
    remover: (id) => stateManagerRepository.removerFicha(id),
  },
};

function criarItensExcluindo(): ItensExcluindoGerenciar {
  return {
    programa: new Set(),
    exercicio: new Set(),
    ficha: new Set(),
  };
}

export function GerenciarPage({ aoNavegar }: PropriedadesGerenciarPage) {
  const { showSuccess } = useToast();
  const [visualizacao, setVisualizacao] = useState<VisualizacaoGerenciar>("programas");
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [fichas, _setFichas] = useState<Ficha[]>([]);
  const [exerciciosCustom, setExerciciosCustom] = useState<Exercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);

  // IDs de itens sendo excluídos (para animação de fade-out)
  const [itensExcluindo, setItensExcluindo] = useState<ItensExcluindoGerenciar>(criarItensExcluindo);

  // Estado do modal de confirmação
  const [modalExclusao, setModalExclusao] = useState<ModalExclusaoGerenciar>(MODAL_EXCLUSAO_FECHADO);

  // Carregar dados e inscrever para mudanças
  useEffect(() => {
    const carregarDados = () => {
      setProgramas(stateManagerRepository.listarProgramas());
      _setFichas(stateManagerRepository.listarFichas());
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

  // Exercícios agrupados por grupo muscular, ordenados alfabeticamente
  const gruposDeExercicios = useMemo(() => {
    const mapa = new Map<string, Exercicio[]>();
    for (const exercicio of exerciciosCustom) {
      const lista = mapa.get(exercicio.grupoMuscular) ?? [];
      lista.push(exercicio);
      mapa.set(exercicio.grupoMuscular, lista);
    }
    return [...mapa.entries()]
      .map(([grupo, lista]) => ({
        grupo,
        lista: [...lista].sort((a, b) => a.nome.localeCompare(b.nome)),
      }))
      .sort((a, b) => a.grupo.localeCompare(b.grupo));
  }, [exerciciosCustom]);

  function handleCriarExercicioCustom(dados: Omit<Exercicio, "id">) {
    stateManagerRepository.adicionarExercicioCustom(dados);
    setModalCriarExercicioAberto(false);
    showSuccess(`"${dados.nome}" adicionado aos seus exercícios.`);
  }

  const configModalExclusao = modalExclusao.tipo ? CONFIG_EXCLUSAO_GERENCIAR[modalExclusao.tipo] : null;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* ── Switcher de Visualização ── */}
      <div className="reveal-up">
        <BigSwitcher
          opcoes={OPCOES_VISUALIZACAO}
          valorSelecionado={visualizacao}
          aoAlterar={(valor) => setVisualizacao(valor as VisualizacaoGerenciar)}
        />
      </div>

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
                  <span className="text-sm text-texto-sutil">
                    {programas.length} {programas.length === 1 ? "programa" : "programas"}
                  </span>
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
                  {programas.map((programa, i) => (
                    <div
                      key={programa.id}
                      className="reveal-up"
                      style={{ animationDelay: `${60 + i * 60}ms` }}
                    >
                      <CartaoPrograma
                        programa={programa}
                        estaSendoExcluido={itensExcluindo.programa.has(programa.id)}
                        aoEditar={() => aoNavegar("editarPrograma", { id: programa.id })}
                        aoExcluir={() => abrirModalExclusao("programa", programa.id, programa.nome)}
                      />
                    </div>
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
                    onClick={() => setModalCriarExercicioAberto(true)}
                  >
                    Novo Exercício
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
                      onClick={() => setModalCriarExercicioAberto(true)}
                    >
                      Criar Exercício
                    </Botao>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {gruposDeExercicios.map(({ grupo, lista }, i) => (
                    <section
                      key={grupo}
                      className="space-y-2 reveal-up"
                      style={{ animationDelay: `${60 + i * 70}ms` }}
                    >
                      <div className="flex items-baseline justify-between px-1">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
                          {grupo}
                        </h3>
                        <span className="text-xs tabular-nums text-texto-sutil/60">
                          {lista.length}
                        </span>
                      </div>
                      <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                        {lista.map((exercicio, index) => (
                          <LinhaExercicioCustom
                            key={exercicio.id}
                            exercicio={exercicio}
                            estaSendoExcluido={itensExcluindo.exercicio.has(exercicio.id)}
                            aoExcluir={() => abrirModalExclusao("exercicio", exercicio.id, exercicio.nome)}
                            semBorda={index === lista.length - 1}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Visualização: Fichas ── */}
      <div
        className={`
          transition-opacity duration-200 ease-out
          ${visualizacao === "fichas" ? "opacity-100" : "opacity-0 hidden"}
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
              {/* Header com ação */}
              {fichas.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-texto-sutil">
                    {fichas.length} {fichas.length === 1 ? "ficha" : "fichas"}
                  </span>
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="mais" tamanho={16} />}
                    onClick={() => aoNavegar("criarFicha")}
                  >
                    Nova Ficha
                  </Botao>
                </div>
              )}

              {fichas.length === 0 ? (
                <EstadoVazio
                  icone="halter"
                  titulo="Nenhuma ficha criada"
                  descricao="Crie sua primeira ficha de treino para começar."
                  acao={
                    <Botao
                      variante="secundario"
                      icone={<Icone nome="mais" tamanho={16} />}
                      onClick={() => aoNavegar("criarFicha")}
                    >
                      Criar Ficha
                    </Botao>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {fichas.map((ficha, i) => (
                    <div
                      key={ficha.id}
                      className="reveal-up"
                      style={{ animationDelay: `${60 + i * 60}ms` }}
                    >
                      <CartaoFicha
                        ficha={ficha}
                        programasDaFicha={stateManagerRepository.obterProgramasDaFicha(ficha.id)}
                        estaSendoExcluida={itensExcluindo.ficha.has(ficha.id)}
                        aoEditar={() => aoNavegar("editarFicha", { id: ficha.id })}
                        aoExcluir={() => abrirModalExclusao("ficha", ficha.id, ficha.nome)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Modal de Criação de Exercício ── */}
      <ModalCriarExercicio
        aberto={modalCriarExercicioAberto}
        aoCriar={handleCriarExercicioCustom}
        aoCancelar={() => setModalCriarExercicioAberto(false)}
      />

      {/* ── Modal de Confirmação ── */}
      <ModalConfirmacao
        aberto={modalExclusao.aberto}
        titulo={configModalExclusao?.titulo ?? ""}
        descricao={configModalExclusao?.descricao(modalExclusao.nome) ?? ""}
        textoConfirmar="Excluir"
        textoCancelar="Manter"
        variant="perigo"
        aoConfirmar={handleConfirmarExclusao}
        aoCancelar={fecharModalExclusao}
      />
    </div>
  );

  function abrirModalExclusao(tipo: TipoExclusaoGerenciar, id: string, nome: string) {
    setModalExclusao({ aberto: true, tipo, id, nome });
  }

  function fecharModalExclusao() {
    setModalExclusao(MODAL_EXCLUSAO_FECHADO);
  }

  function marcarItemExcluindo(tipo: TipoExclusaoGerenciar, id: string, excluindo: boolean) {
    setItensExcluindo((prev) => {
      const itensDoTipo = new Set(prev[tipo]);

      if (excluindo) {
        itensDoTipo.add(id);
      } else {
        itensDoTipo.delete(id);
      }

      return { ...prev, [tipo]: itensDoTipo };
    });
  }

  function handleConfirmarExclusao() {
    const { tipo, id } = modalExclusao;
    if (!tipo || !id) return;

    const { remover } = CONFIG_EXCLUSAO_GERENCIAR[tipo];
    marcarItemExcluindo(tipo, id, true);
    fecharModalExclusao();

    setTimeout(() => {
      remover(id);
      marcarItemExcluindo(tipo, id, false);
    }, 200);
  }
}

/* ── Componentes Internos ── */

interface BotaoExcluirItemProps {
  nome: string;
  aoExcluir: () => void;
}

function BotaoExcluirItem({ nome, aoExcluir }: BotaoExcluirItemProps) {
  return (
    <button
      type="button"
      onClick={aoExcluir}
      aria-label={`Excluir ${nome}`}
      className="p-2 text-texto-sutil hover:text-perigo hover:bg-perigo/10 rounded-lg transition-colors shrink-0"
    >
      <Icone nome="lixeira" tamanho={18} />
    </button>
  );
}

interface CartaoProgramaProps {
  programa: Programa;
  estaSendoExcluido?: boolean;
  aoEditar: () => void;
  aoExcluir: () => void;
}

function CartaoPrograma({ programa, estaSendoExcluido = false, aoEditar, aoExcluir }: CartaoProgramaProps) {
  const fichasDoPrograma = stateManagerRepository.obterFichasDoPrograma(programa.id);

  const handleToggleAtivo = () => {
    stateManagerRepository.atualizarPrograma(programa.id, { ativo: !programa.ativo });
  };

  return (
    <div
      className={`
        bg-superficie rounded-2xl border border-borda overflow-hidden
        hover:bg-superficie-suave transition-all duration-200
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Banner */}
      <div className="px-5 py-4 bg-superficie-suave text-texto-secundario">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-semibold font-display">{programa.nome}</h3>
            </div>
            {programa.descricao && (
              <p className="text-sm leading-snug text-texto-secundario">{programa.descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info e ações */}
      <div className="px-5 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-texto-secundario font-medium shrink-0 whitespace-nowrap">
          {fichasDoPrograma.length} {fichasDoPrograma.length === 1 ? "ficha" : "fichas"}
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {programa.ativo && (
              <span className="px-2 py-0.5 bg-acento text-texto-invertido text-xs font-semibold rounded-full shrink-0">
                ATIVO
              </span>
            )}

            {/* Toggle ativo */}
            <button
              type="button"
              onClick={handleToggleAtivo}
              className="flex items-center justify-center p-1 rounded-lg transition-colors hover:bg-superficie-suave"
              title={programa.ativo ? "Desativar programa" : "Ativar programa"}
              aria-label={programa.ativo ? "Programa ativo" : "Ativar programa"}
            >
              <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${programa.ativo ? "bg-acento" : "bg-borda"}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-superficie transition-transform duration-200 ${programa.ativo ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={aoEditar}
              className="px-3 py-2 text-sm font-medium text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
            >
              Editar
            </button>
            <BotaoExcluirItem nome={programa.nome} aoExcluir={aoExcluir} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Exercicios customizados nao exibem editar: hoje so possuem nome e grupo.
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
      </div>

      {/* Ação */}
      <BotaoExcluirItem nome={exercicio.nome} aoExcluir={aoExcluir} />
    </div>
  );
}

interface CartaoFichaProps {
  ficha: Ficha;
  programasDaFicha?: Programa[];
  estaSendoExcluida?: boolean;
  aoEditar: () => void;
  aoExcluir: () => void;
}

function CartaoFicha({ ficha, programasDaFicha = [], estaSendoExcluida = false, aoEditar, aoExcluir }: CartaoFichaProps) {
  return (
    <div
      className={`
        bg-superficie rounded-2xl border border-borda overflow-hidden
        hover:bg-superficie-suave transition-all duration-200
        ${estaSendoExcluida ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Conteúdo */}
      <div className="px-5 pt-4 pb-3 flex items-start gap-4">
        {/* Emoji */}
        <span className="text-3xl shrink-0 leading-none mt-0.5">
          {ficha.emoji || "💪"}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold font-display text-texto-primario leading-snug">
            {ficha.nome}
          </h3>
          <p className="text-sm text-texto-secundario mt-0.5">
            {ficha.exercicios.length} {ficha.exercicios.length === 1 ? "exercício" : "exercícios"}
            {ficha.cardio.length > 0 && ` · ${ficha.cardio.length} ${ficha.cardio.length === 1 ? "cardio" : "cardios"}`}
          </p>
          {programasDaFicha.length > 0 && (
            <p className="text-xs text-texto-sutil mt-1 truncate">
              {programasDaFicha.map((p) => p.nome).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-1 px-3 py-1.5 border-t border-borda-suave">
        <button
          type="button"
          onClick={aoEditar}
          className="px-3.5 py-2 text-sm font-medium text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
        >
          Editar
        </button>
        <BotaoExcluirItem nome={ficha.nome} aoExcluir={aoExcluir} />
      </div>
    </div>
  );
}
