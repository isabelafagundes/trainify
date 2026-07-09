/* ═══════════════════════════════════════════
   Tela Principal de Gerenciamento — Pezzo
   ═══════════════════════════════════════════ */

import { useEffect, useMemo, useState } from "react";
import type {
  ChaveMetricaCardio,
  Exercicio,
  Ficha,
  Programa,
  TipoCardioDef,
} from "@/domain/tipos";
import { META_METRICA_CARDIO } from "@/domain/tipos";
import { cardioDaFicha, exerciciosDaFicha } from "@/domain/ficha";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { BigSwitcher } from "@/interface/widget/formulario/BigSwitcher";
import { Input } from "@/interface/widget/formulario/Input";
import { ModalConfirmacao } from "@/interface/widget/modal/ModalConfirmacao";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { useToast } from "@/interface/widget/toast";

type VisualizacaoGerenciar = "programas" | "fichas" | "exercicios";
type TipoExclusaoGerenciar = "programa" | "exercicio" | "ficha" | "cardio";

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

const CHAVES_METRICAS_CARDIO: ChaveMetricaCardio[] = [
  "duracaoMinutos",
  "distanciaKm",
  "passos",
  "niveis",
  "pulos",
  "inclinacaoPct",
  "resistencia",
  "rpm",
  "ritmo500m",
  "spm",
];

interface FormTipoCardio {
  nome: string;
  emoji: string;
  metricas: ChaveMetricaCardio[];
}

const FORM_CARDIO_INICIAL: FormTipoCardio = {
  nome: "",
  emoji: "",
  metricas: ["duracaoMinutos"],
};

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
  cardio: {
    titulo: "Excluir cardio",
    descricao: (nome) => `Tem certeza que deseja excluir "${nome}"? O histórico antigo será mantido.`,
    remover: (id) => stateManagerRepository.removerCardioCustom(id),
  },
};

function criarItensExcluindo(): ItensExcluindoGerenciar {
  return {
    programa: new Set(),
    exercicio: new Set(),
    ficha: new Set(),
    cardio: new Set(),
  };
}

export function GerenciarPage({ aoNavegar }: PropriedadesGerenciarPage) {
  const { showSuccess } = useToast();
  const [visualizacao, setVisualizacao] = useState<VisualizacaoGerenciar>("programas");
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [fichas, _setFichas] = useState<Ficha[]>([]);
  const [exerciciosCustom, setExerciciosCustom] = useState<Exercicio[]>([]);
  const [tiposCardio, setTiposCardio] = useState<TipoCardioDef[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);
  const [formCardioAberto, setFormCardioAberto] = useState(false);
  const [tipoCardioEditando, setTipoCardioEditando] = useState<TipoCardioDef | null>(null);
  const [formCardio, setFormCardio] = useState<FormTipoCardio>(FORM_CARDIO_INICIAL);

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
      setTiposCardio(stateManagerRepository.listarTiposCardio());
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

  function abrirFormularioCardio(tipo?: TipoCardioDef) {
    setTipoCardioEditando(tipo ?? null);
    setFormCardio(
      tipo
        ? {
            nome: tipo.nome,
            emoji: tipo.emoji ?? "",
            metricas: tipo.metricas.length > 0 ? tipo.metricas : ["duracaoMinutos"],
          }
        : FORM_CARDIO_INICIAL
    );
    setFormCardioAberto(true);
  }

  function fecharFormularioCardio() {
    setTipoCardioEditando(null);
    setFormCardio(FORM_CARDIO_INICIAL);
    setFormCardioAberto(false);
  }

  function alternarMetricaCardio(chave: ChaveMetricaCardio) {
    setFormCardio((atual) => {
      const jaSelecionada = atual.metricas.includes(chave);
      const metricas = jaSelecionada
        ? atual.metricas.filter((item) => item !== chave)
        : [...atual.metricas, chave];

      return {
        ...atual,
        metricas: metricas.length > 0 ? metricas : ["duracaoMinutos"],
      };
    });
  }

  function salvarTipoCardio() {
    const nome = formCardio.nome.trim();
    if (!nome) return;

    const dados = {
      nome,
      emoji: formCardio.emoji.trim() || undefined,
      metricas: formCardio.metricas,
      builtin: tipoCardioEditando?.builtin ?? false,
    };

    if (tipoCardioEditando) {
      stateManagerRepository.atualizarCardioCustom(tipoCardioEditando.id, dados);
      showSuccess(`"${nome}" atualizado.`);
    } else {
      stateManagerRepository.adicionarCardioCustom(dados);
      showSuccess(`"${nome}" adicionado aos cardios.`);
    }

    fecharFormularioCardio();
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-start">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
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
        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-texto-primario font-display">
                Cardio
              </h2>
              <p className="mt-0.5 text-xs text-texto-sutil">
                Tipos e métricas usados nas fichas.
              </p>
            </div>
            <Botao
              variante="fantasma"
              tamanho="compacto"
              icone={<Icone nome="mais" tamanho={16} />}
              onClick={() => abrirFormularioCardio()}
            >
              Novo Cardio
            </Botao>
          </div>

          {formCardioAberto && (
            <div className="rounded-2xl border border-borda bg-superficie p-4 space-y-3">
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <Input
                  label="Emoji"
                  tipo="text"
                  value={formCardio.emoji}
                  onChange={(e) => setFormCardio((atual) => ({ ...atual, emoji: e.target.value }))}
                  placeholder="🏃"
                />
                <Input
                  label="Nome"
                  tipo="text"
                  value={formCardio.nome}
                  onChange={(e) => setFormCardio((atual) => ({ ...atual, nome: e.target.value }))}
                  placeholder="Ex: Caminhada"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-texto-secundario">
                  Métricas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CHAVES_METRICAS_CARDIO.map((chave) => {
                    const meta = META_METRICA_CARDIO[chave];
                    const selecionada = formCardio.metricas.includes(chave);
                    return (
                      <button
                        key={chave}
                        type="button"
                        role="checkbox"
                        aria-checked={selecionada}
                        onClick={() => alternarMetricaCardio(chave)}
                        className={`flex min-h-[44px] w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          selecionada
                            ? "border-acento bg-acento/10 text-texto-primario"
                            : "border-borda-suave bg-fundo text-texto-secundario hover:border-acento"
                        }`}
                      >
                        <span className="min-w-0 truncate">
                          {meta.rotulo}
                          {meta.unidade ? ` (${meta.unidade})` : ""}
                        </span>
                        {selecionada && (
                          <Icone nome="check" tamanho={15} className="ml-auto shrink-0 text-acento" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Botao variante="fantasma" tamanho="compacto" onClick={fecharFormularioCardio}>
                  Cancelar
                </Botao>
                <Botao variante="primario" tamanho="compacto" onClick={salvarTipoCardio}>
                  {tipoCardioEditando ? "Salvar" : "Criar"}
                </Botao>
              </div>
            </div>
          )}

          <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
            {tiposCardio.map((tipo, index) => (
              <LinhaTipoCardio
                key={tipo.id}
                tipo={tipo}
                estaSendoExcluido={itensExcluindo.cardio.has(tipo.id)}
                aoEditar={() => abrirFormularioCardio(tipo)}
                aoExcluir={() => abrirModalExclusao("cardio", tipo.id, tipo.nome)}
                semBorda={index === tiposCardio.length - 1}
              />
            ))}
          </div>
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-start">
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

// Exercícios customizados não exibem editar: hoje só possuem nome e grupo.
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

interface LinhaTipoCardioProps {
  tipo: TipoCardioDef;
  estaSendoExcluido?: boolean;
  aoEditar: () => void;
  aoExcluir: () => void;
  semBorda?: boolean;
}

function LinhaTipoCardio({
  tipo,
  estaSendoExcluido = false,
  aoEditar,
  aoExcluir,
  semBorda,
}: LinhaTipoCardioProps) {
  const textoMetricas = tipo.metricas
    .map((metrica) => META_METRICA_CARDIO[metrica].rotulo)
    .join(", ");

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4 hover:bg-superficie-suave
        transition-all duration-200
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        ${semBorda ? "" : "border-b border-borda-suave"}
      `}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-acento-suave text-xl">
        {tipo.emoji || "🏃"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-texto-primario">
            {tipo.nome}
          </p>
          {tipo.builtin && (
            <span className="rounded-full bg-superficie-suave px-2 py-0.5 text-[10px] font-medium text-texto-sutil">
              padrão
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-texto-sutil">
          {textoMetricas}
        </p>
      </div>
      <button
        type="button"
        onClick={aoEditar}
        className="px-3 py-2 text-sm font-medium text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
      >
        {tipo.builtin ? "Customizar" : "Editar"}
      </button>
      {!tipo.builtin && <BotaoExcluirItem nome={tipo.nome} aoExcluir={aoExcluir} />}
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
            {exerciciosDaFicha(ficha).length} {exerciciosDaFicha(ficha).length === 1 ? "exercício" : "exercícios"}
            {cardioDaFicha(ficha).length > 0 && ` · ${cardioDaFicha(ficha).length} ${cardioDaFicha(ficha).length === 1 ? "cardio" : "cardios"}`}
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
