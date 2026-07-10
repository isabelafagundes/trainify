/* ═══════════════════════════════════════════
   Tela Principal de Gerenciamento — Pezzo
   ───────────────────────────────────────────
   Programas é a "casa" da seção (launchpad): herói do programa ativo +
   "trocar para" + bibliotecas (Fichas / Exercícios). Fichas e Exercícios
   são telas próprias (rotas /gerenciar/fichas e /gerenciar/exercicios),
   alcançadas pelo rodapé Bibliotecas (mobile/tablet) ou pela sidebar (desktop).
   Sem BigSwitcher — qual visualização vem por rota (prop `visualizacao`).
   ═══════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
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
import { Input } from "@/interface/widget/formulario/Input";
import { ModalConfirmacao } from "@/interface/widget/modal/ModalConfirmacao";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { useToast } from "@/interface/widget/toast";

type VisualizacaoGerenciar = "programas" | "fichas" | "exercicios";
type TipoExclusaoGerenciar = "programa" | "exercicio" | "ficha" | "cardio";
/** Sub-abas da biblioteca de Exercícios: força vs. cardio. */
type AbaExercicios = "musculacao" | "cardio";

interface ModalExclusaoGerenciar {
  aberto: boolean;
  tipo: TipoExclusaoGerenciar | null;
  id: string | null;
  nome: string;
}

type ItensExcluindoGerenciar = Record<TipoExclusaoGerenciar, Set<string>>;

interface PropriedadesGerenciarPage {
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
  /** Qual CRUD exibir. Definido pela rota; default "programas" (a casa). */
  visualizacao?: VisualizacaoGerenciar;
}

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

export function GerenciarPage({ aoNavegar, visualizacao = "programas" }: PropriedadesGerenciarPage) {
  const { showSuccess } = useToast();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [fichas, _setFichas] = useState<Ficha[]>([]);
  const [exerciciosCustom, setExerciciosCustom] = useState<Exercicio[]>([]);
  const [tiposCardio, setTiposCardio] = useState<TipoCardioDef[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);
  const [abaExercicios, setAbaExercicios] = useState<AbaExercicios>("musculacao");
  const [buscaExercicios, setBuscaExercicios] = useState("");
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

  // Termo de busca normalizado (aplicado à aba ativa)
  const buscaNormalizada = buscaExercicios.trim().toLowerCase();

  // Exercícios após a busca (por nome ou grupo muscular)
  const exerciciosFiltrados = useMemo(() => {
    if (!buscaNormalizada) return exerciciosCustom;
    return exerciciosCustom.filter(
      (e) =>
        e.nome.toLowerCase().includes(buscaNormalizada) ||
        e.grupoMuscular.toLowerCase().includes(buscaNormalizada)
    );
  }, [exerciciosCustom, buscaNormalizada]);

  // Exercícios agrupados por grupo muscular, ordenados alfabeticamente
  const gruposDeExercicios = useMemo(() => {
    const mapa = new Map<string, Exercicio[]>();
    for (const exercicio of exerciciosFiltrados) {
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
  }, [exerciciosFiltrados]);

  // Tipos de cardio após a busca (por nome)
  const tiposCardioFiltrados = useMemo(() => {
    if (!buscaNormalizada) return tiposCardio;
    return tiposCardio.filter((t) => t.nome.toLowerCase().includes(buscaNormalizada));
  }, [tiposCardio, buscaNormalizada]);

  // Troca de aba limpa a busca (evita um termo de uma aba filtrar a outra)
  function trocarAbaExercicios(aba: AbaExercicios) {
    setAbaExercicios(aba);
    setBuscaExercicios("");
  }

  const programaAtivo = programas.find((p) => p.ativo) ?? null;
  const programasInativos = programas.filter((p) => !p.ativo);

  function handleCriarExercicioCustom(dados: Omit<Exercicio, "id">) {
    stateManagerRepository.adicionarExercicioCustom(dados);
    setModalCriarExercicioAberto(false);
    showSuccess(`"${dados.nome}" adicionado aos seus exercícios.`);
  }

  function handleAtivarPrograma(programa: Programa) {
    stateManagerRepository.atualizarPrograma(programa.id, { ativo: true });
    showSuccess(`"${programa.nome}" está guiando seus treinos.`);
  }

  function handleDesativarPrograma(programa: Programa) {
    stateManagerRepository.atualizarPrograma(programa.id, { ativo: false });
  }

  function handleDuplicarPrograma(programa: Programa) {
    const copia = stateManagerRepository.copiarPrograma(programa.id);
    if (copia) showSuccess(`"${programa.nome}" duplicado.`);
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
      {/* ══ Visualização: Programas (a casa) ══ */}
      {visualizacao === "programas" && (
        <section className="space-y-4">
          {carregando ? (
            <SkeletonProgramas />
          ) : programas.length === 0 ? (
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
            <>
              {/* Header: contagem + Novo Programa */}
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

              {/* Herói do programa ativo */}
              {programaAtivo ? (
                <div className="reveal-up space-y-2">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-acento" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-sutil">
                      Programa ativo
                    </span>
                  </div>
                  <HeroProgramaAtivo
                    programa={programaAtivo}
                    quantidadeFichas={stateManagerRepository.obterFichasDoPrograma(programaAtivo.id).length}
                    estaSendoExcluido={itensExcluindo.programa.has(programaAtivo.id)}
                    aoEditar={() => aoNavegar("editarPrograma", { id: programaAtivo.id })}
                    aoDuplicar={() => handleDuplicarPrograma(programaAtivo)}
                    aoDesativar={() => handleDesativarPrograma(programaAtivo)}
                    aoExcluir={() => abrirModalExclusao("programa", programaAtivo.id, programaAtivo.nome)}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-borda bg-superficie-suave/60 px-4 py-3">
                  <p className="text-sm text-texto-secundario">
                    Nenhum programa ativo. Ative um abaixo para guiar seus treinos.
                  </p>
                </div>
              )}

              {/* Trocar para / Seus programas */}
              {(programaAtivo ? programasInativos : programas).length > 0 && (
                <section className="space-y-2.5 pt-1">
                  <span className="block px-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-sutil">
                    {programaAtivo ? "Trocar para" : "Seus programas"}
                  </span>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-start">
                    {(programaAtivo ? programasInativos : programas).map((programa, i) => (
                      <div key={programa.id} className="reveal-up" style={{ animationDelay: `${60 + i * 50}ms` }}>
                        <LinhaProgramaTrocar
                          programa={programa}
                          quantidadeFichas={stateManagerRepository.obterFichasDoPrograma(programa.id).length}
                          estaSendoExcluido={itensExcluindo.programa.has(programa.id)}
                          aoAtivar={() => handleAtivarPrograma(programa)}
                          aoEditar={() => aoNavegar("editarPrograma", { id: programa.id })}
                          aoDuplicar={() => handleDuplicarPrograma(programa)}
                          aoExcluir={() => abrirModalExclusao("programa", programa.id, programa.nome)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Bibliotecas — só mobile/tablet (no desktop moram na sidebar) */}
              <NavBibliotecas
                quantidadeFichas={fichas.length}
                quantidadeExercicios={exerciciosCustom.length}
                aoAbrirFichas={() => aoNavegar("gerenciarFichas")}
                aoAbrirExercicios={() => aoNavegar("gerenciarExercicios")}
              />
            </>
          )}
        </section>
      )}

      {/* ══ Visualização: Fichas ══ */}
      {visualizacao === "fichas" && (
        <section className="space-y-4">
          {carregando ? (
            <SkeletonCards />
          ) : (
            <>
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
                    <div key={ficha.id} className="reveal-up" style={{ animationDelay: `${60 + i * 60}ms` }}>
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
      )}

      {/* ══ Visualização: Exercícios (abas Musculação / Cardio) ══ */}
      {visualizacao === "exercicios" && (
        <section className="space-y-4">
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
              <AbasExercicios
                aba={abaExercicios}
                aoAlterar={trocarAbaExercicios}
                contagemMusculacao={exerciciosCustom.length}
                contagemCardio={tiposCardio.length}
              />

              {/* Busca — some só na biblioteca de força vazia (nada a filtrar) */}
              {!(abaExercicios === "musculacao" && exerciciosCustom.length === 0) && (
                <CampoBusca
                  valor={buscaExercicios}
                  aoAlterar={setBuscaExercicios}
                  placeholder={abaExercicios === "musculacao" ? "Buscar exercício..." : "Buscar cardio..."}
                />
              )}

              {abaExercicios === "musculacao" ? (
                exerciciosCustom.length === 0 ? (
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
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-texto-sutil">
                        {textoContadorExercicios}
                      </span>
                      <Botao
                        variante="fantasma"
                        tamanho="compacto"
                        icone={<Icone nome="mais" tamanho={16} />}
                        onClick={() => setModalCriarExercicioAberto(true)}
                      >
                        Novo Exercício
                      </Botao>
                    </div>

                    {gruposDeExercicios.length === 0 ? (
                      <SemResultadoBusca termo={buscaExercicios} />
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
                )
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-texto-sutil">
                      Tipos e métricas usados nas fichas.
                    </span>
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

                  {tiposCardioFiltrados.length === 0 ? (
                    <SemResultadoBusca termo={buscaExercicios} />
                  ) : (
                    <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                      {tiposCardioFiltrados.map((tipo, index) => (
                        <LinhaTipoCardio
                          key={tipo.id}
                          tipo={tipo}
                          estaSendoExcluido={itensExcluindo.cardio.has(tipo.id)}
                          aoEditar={() => abrirFormularioCardio(tipo)}
                          aoExcluir={() => abrirModalExclusao("cardio", tipo.id, tipo.nome)}
                          semBorda={index === tiposCardioFiltrados.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      )}

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

/* ── Componentes internos ── */

function SkeletonProgramas() {
  return (
    <div className="space-y-4">
      <div className="h-28 rounded-2xl border border-borda bg-superficie-suave animate-pulse" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl border border-borda bg-superficie-suave animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="bg-superficie rounded-2xl border border-borda overflow-hidden">
          <div className="px-5 py-4 bg-superficie-suave animate-pulse">
            <div className="h-5 bg-borda-suave rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-borda-suave rounded w-1/2"></div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="h-4 bg-borda-suave rounded w-16"></div>
            <div className="h-8 bg-borda-suave rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

const OPCOES_ABAS_EXERCICIOS: { id: AbaExercicios; rotulo: string }[] = [
  { id: "musculacao", rotulo: "Musculação" },
  { id: "cardio", rotulo: "Cardio" },
];

interface AbasExerciciosProps {
  aba: AbaExercicios;
  aoAlterar: (aba: AbaExercicios) => void;
  contagemMusculacao: number;
  contagemCardio: number;
}

/** Abas sublinhadas Musculação / Cardio (padrão Hevy/Strong). Tablist acessível
    com roving tabindex e navegação por setas/Home/End — espelha o BigSwitcher. */
function AbasExercicios({ aba, aoAlterar, contagemMusculacao, contagemCardio }: AbasExerciciosProps) {
  const contagens: Record<AbaExercicios, number> = {
    musculacao: contagemMusculacao,
    cardio: contagemCardio,
  };

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, indiceAtual: number) {
    const ultima = OPCOES_ABAS_EXERCICIOS.length - 1;
    let proximo: number | null = null;

    if (event.key === "ArrowRight") proximo = indiceAtual === ultima ? 0 : indiceAtual + 1;
    if (event.key === "ArrowLeft") proximo = indiceAtual === 0 ? ultima : indiceAtual - 1;
    if (event.key === "Home") proximo = 0;
    if (event.key === "End") proximo = ultima;

    if (proximo === null) return;

    event.preventDefault();
    aoAlterar(OPCOES_ABAS_EXERCICIOS[proximo].id);

    const abas = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    requestAnimationFrame(() => abas?.[proximo]?.focus());
  }

  return (
    <div role="tablist" aria-label="Tipo de exercício" className="flex gap-6 border-b border-borda">
      {OPCOES_ABAS_EXERCICIOS.map((opcao, indice) => {
        const selecionado = aba === opcao.id;
        return (
          <button
            key={opcao.id}
            type="button"
            role="tab"
            aria-selected={selecionado}
            tabIndex={selecionado ? 0 : -1}
            onClick={() => aoAlterar(opcao.id)}
            onKeyDown={(event) => handleKeyDown(event, indice)}
            className={`
              relative -mb-px flex min-h-[44px] items-center gap-2 pb-2.5 pt-2
              font-display text-[15px] transition-colors
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
              ${
                selecionado
                  ? "font-bold text-texto-primario"
                  : "font-medium text-texto-sutil hover:text-texto-secundario"
              }
            `}
          >
            <span>{opcao.rotulo}</span>
            <span
              className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                selecionado
                  ? "bg-acento text-texto-invertido"
                  : "border border-borda bg-superficie text-texto-secundario"
              }`}
            >
              {contagens[opcao.id]}
            </span>
            {selecionado && (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-acento" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface CampoBuscaProps {
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder: string;
}

/** Campo de busca com lupa à esquerda e botão de limpar. Espelha o padrão do
    PickerExercicios (mesmas classes/afinação de foco). */
function CampoBusca({ valor, aoAlterar, placeholder }: CampoBuscaProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full px-4 py-3 pl-10 pr-10
          bg-superficie border border-borda rounded-[10px]
          text-sm text-texto-primario placeholder:text-texto-sutil
          focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20
          transition-all duration-200
        "
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto-sutil"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {valor && (
        <button
          type="button"
          onClick={() => aoAlterar("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-texto-sutil transition-colors hover:bg-superficie-suave hover:text-texto-primario"
        >
          <Icone nome="fechar" tamanho={16} />
        </button>
      )}
    </div>
  );
}

/** Estado vazio de busca (nenhum resultado para o termo). */
function SemResultadoBusca({ termo }: { termo: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-texto-secundario">
        Nenhum resultado para “{termo.trim()}”.
      </p>
    </div>
  );
}

/** Três pontos verticais (kebab) — inline por serem círculos preenchidos. */
function IconeMaisOpcoes({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

interface AcaoMenu {
  label: string;
  icone: string;
  onClick: () => void;
  perigo?: boolean;
}

/** Menu de ações (kebab) — fecha em clique fora, Esc, scroll ou seleção.
    O menu é renderizado em portal (fixed) porque os cartões da lista usam
    `.reveal-up`, cujo transform residual cria um stacking context por item e
    prenderia o z-index de um dropdown ancorado. */
const LARGURA_MENU = 176;

function MenuAcoesPrograma({ rotulo, itens }: { rotulo: string; itens: AcaoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function abrir() {
    const r = botaoRef.current?.getBoundingClientRect();
    if (r) setPosicao({ top: r.bottom + 4, left: Math.max(8, r.right - LARGURA_MENU) });
    setAberto(true);
  }

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (botaoRef.current?.contains(alvo) || menuRef.current?.contains(alvo)) return;
      setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    const fechar = () => setAberto(false);
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [aberto]);

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        aria-label={rotulo}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-texto-sutil transition-colors hover:bg-superficie-suave hover:text-texto-primario"
      >
        <IconeMaisOpcoes tamanho={18} />
      </button>
      {aberto &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: posicao.top, left: posicao.left, width: LARGURA_MENU }}
            className="z-50 overflow-hidden rounded-xl border border-borda bg-superficie shadow-lg shadow-black/10"
          >
            {itens.map((it, i) => (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAberto(false);
                  it.onClick();
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors ${
                  i > 0 ? "border-t border-borda-suave" : ""
                } ${it.perigo ? "text-perigo hover:bg-perigo/10" : "text-texto-primario hover:bg-superficie-suave"}`}
              >
                <Icone nome={it.icone} tamanho={16} />
                {it.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

interface HeroProgramaAtivoProps {
  programa: Programa;
  quantidadeFichas: number;
  estaSendoExcluido?: boolean;
  aoEditar: () => void;
  aoDuplicar: () => void;
  aoDesativar: () => void;
  aoExcluir: () => void;
}

function HeroProgramaAtivo({
  programa,
  quantidadeFichas,
  estaSendoExcluido = false,
  aoEditar,
  aoDuplicar,
  aoDesativar,
  aoExcluir,
}: HeroProgramaAtivoProps) {
  return (
    <div
      className={`
        rounded-2xl border-[1.5px] border-acento bg-superficie
        shadow-lg shadow-acento/10 transition-all duration-200
        flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4 md:px-5
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-acento px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] text-texto-invertido">
            ATIVO
          </span>
          <span className="text-xs text-texto-sutil">
            {quantidadeFichas} {quantidadeFichas === 1 ? "ficha" : "fichas"}
          </span>
        </div>
        <h3 className="font-display text-xl font-bold leading-tight text-texto-primario">
          {programa.nome}
        </h3>
        {programa.descricao && (
          <p className="mt-0.5 text-sm text-texto-secundario">{programa.descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-2 md:shrink-0">
        <Botao
          variante="primario"
          icone={<Icone nome="editar" tamanho={16} />}
          onClick={aoEditar}
          className="flex-1 md:flex-none"
        >
          Editar programa
        </Botao>
        <MenuAcoesPrograma
          rotulo={`Ações de ${programa.nome}`}
          itens={[
            { label: "Duplicar", icone: "copiar", onClick: aoDuplicar },
            { label: "Desativar", icone: "fechar", onClick: aoDesativar },
            { label: "Excluir", icone: "lixeira", onClick: aoExcluir, perigo: true },
          ]}
        />
      </div>
    </div>
  );
}

interface LinhaProgramaTrocarProps {
  programa: Programa;
  quantidadeFichas: number;
  estaSendoExcluido?: boolean;
  aoAtivar: () => void;
  aoEditar: () => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
}

function LinhaProgramaTrocar({
  programa,
  quantidadeFichas,
  estaSendoExcluido = false,
  aoAtivar,
  aoEditar,
  aoDuplicar,
  aoExcluir,
}: LinhaProgramaTrocarProps) {
  const meta = `${quantidadeFichas} ${quantidadeFichas === 1 ? "ficha" : "fichas"}${
    programa.descricao ? ` · ${programa.descricao}` : ""
  }`;
  return (
    <div
      className={`
        flex items-center gap-2 rounded-2xl border border-borda bg-superficie px-4 py-3
        transition-all duration-200 hover:bg-superficie-suave
        ${estaSendoExcluido ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[15px] font-semibold text-texto-primario">
          {programa.nome}
        </p>
        <p className="truncate text-xs text-texto-sutil">{meta}</p>
      </div>
      <button
        type="button"
        onClick={aoAtivar}
        className="shrink-0 rounded-full border border-borda-forte px-3.5 py-1.5 text-sm font-semibold text-texto-primario transition-colors hover:bg-superficie-hover"
      >
        Ativar
      </button>
      <MenuAcoesPrograma
        rotulo={`Ações de ${programa.nome}`}
        itens={[
          { label: "Editar", icone: "editar", onClick: aoEditar },
          { label: "Duplicar", icone: "copiar", onClick: aoDuplicar },
          { label: "Excluir", icone: "lixeira", onClick: aoExcluir, perigo: true },
        ]}
      />
    </div>
  );
}

interface NavBibliotecasProps {
  quantidadeFichas: number;
  quantidadeExercicios: number;
  aoAbrirFichas: () => void;
  aoAbrirExercicios: () => void;
}

/** Atalhos para as bibliotecas (Fichas / Exercícios). Só mobile/tablet —
    no desktop essas entradas moram na barra lateral. */
function NavBibliotecas({
  quantidadeFichas,
  quantidadeExercicios,
  aoAbrirFichas,
  aoAbrirExercicios,
}: NavBibliotecasProps) {
  const itens = [
    {
      icone: "halter",
      nome: "Fichas",
      meta: `${quantidadeFichas} ${quantidadeFichas === 1 ? "ficha" : "fichas"}`,
      onClick: aoAbrirFichas,
    },
    {
      icone: "alvo",
      nome: "Exercícios & cardio",
      meta:
        quantidadeExercicios > 0
          ? `${quantidadeExercicios} ${quantidadeExercicios === 1 ? "personalizado" : "personalizados"}`
          : "Sua biblioteca de movimentos",
      onClick: aoAbrirExercicios,
    },
  ];
  return (
    <section className="space-y-2.5 pt-4 lg:hidden">
      <span className="block px-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-sutil">
        Bibliotecas
      </span>
      <div className="overflow-hidden rounded-2xl border border-borda bg-superficie">
        {itens.map((it, i) => (
          <button
            key={it.nome}
            type="button"
            onClick={it.onClick}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-superficie-suave ${
              i > 0 ? "border-t border-borda-suave" : ""
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-acento-suave text-texto-primario">
              <Icone nome={it.icone} tamanho={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-semibold text-texto-primario">{it.nome}</p>
              <p className="truncate text-xs text-texto-sutil">{it.meta}</p>
            </div>
            <Icone nome="setaDireita" tamanho={18} className="shrink-0 text-texto-sutil" />
          </button>
        ))}
      </div>
    </section>
  );
}

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
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-texto-primario truncate">
          {exercicio.nome}
        </p>
      </div>
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
      <div className="px-5 pt-4 pb-3 flex items-start gap-4">
        <span className="text-3xl shrink-0 leading-none mt-0.5">
          {ficha.emoji || "💪"}
        </span>

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
