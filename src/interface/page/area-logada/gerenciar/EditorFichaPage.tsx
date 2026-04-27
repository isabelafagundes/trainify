/* ═══════════════════════════════════════════
   Editor de Ficha — Criar/Editar Fichas
   ═══════════════════════════════════════════ */

import { useEffect, useState } from "react";
import type { Ficha, Exercicio, ExercicioFicha, TipoCardio } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { SeletorIcone } from "@/interface/widget/formulario/SeletorIcone";
import { PickerExercicios } from "@/interface/widget/formulario/PickerExercicios";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { Chip } from "@/interface/widget/chip/Chip";
import { ModalCriarExercicio } from "@/interface/widget/modal/ModalCriarExercicio";
import { ModalCopiarFicha } from "@/interface/widget/modal/ModalCopiarFicha";

interface PropriedadesEditorFichaPage {
  fichaId?: string;
  programaId: string; // OBRIGATÓRIO: fichas só existem dentro de programas
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

export function EditorFichaPage({ fichaId, aoVoltar, programaId }: PropriedadesEditorFichaPage) {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);

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

  // Estados dos modais
  const [modalCriarExercicioAberto, setModalCriarExercicioAberto] = useState(false);
  const [modalCopiarFichaAberto, setModalCopiarFichaAberto] = useState(false);

  const editando = Boolean(fichaId);
  const titulo = editando ? "Editar Ficha" : "Nova Ficha";

  // Carregar dados
  useEffect(() => {
    const carregarDados = () => {
      const exercicios = stateManagerRepository.listarTodosExercicios();
      setTodosExercicios(exercicios);

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
        }
      } else {
        // Nova ficha - gerar nome automaticamente
        const nomeGerado = stateManagerRepository.gerarNomeFicha();
        setNome(nomeGerado);
        setIcone("💪");
      }
    };

    carregarDados();

    const cancelarInscricao = stateManagerRepository.inscrever(carregarDados);
    return cancelarInscricao;
  }, [fichaId]);

  // Handlers
  const handleSalvar = () => {
    if (!nome.trim()) {
      alert("Digite um nome para a ficha.");
      return;
    }

    if (exercicios.length === 0) {
      alert("Adicione pelo menos um exercício à ficha.");
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
      stateManagerRepository.atualizarFicha(ficha.id, dadosFicha);
    } else {
      // Nova ficha: sempre requer programaId
      stateManagerRepository.adicionarFicha(dadosFicha, programaId);
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
    setExercicios([...exercicios, novoExercicio]);
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
    stateManagerRepository.adicionarExercicioCustom(exercicio);
    setModalCriarExercicioAberto(false);
  };

  const handleCopiarFichaExistente = (fichaId: string) => {
    const ficha = stateManagerRepository.obterFichaPorId(fichaId);
    if (!ficha) return;

    // Preencher formulário com dados da ficha selecionada
    setNome(ficha.nome.replace(/\s*\(cópia\)$/, "")); // Remove "(cópia)" se existir
    setDescricao(ficha.descricao);
    setIcone(ficha.emoji || "💪");
    setExercicios(ficha.exercicios);
    setCardio(ficha.cardio);
    setMostraCardio(ficha.cardio.length > 0);

    setModalCopiarFichaAberto(false);
  };

  // Obter nome do exercício
  const getNomeExercicio = (exercicioId: string): string => {
    const exercicio = todosExercicios.find((e) => e.id === exercicioId);
    return exercicio?.nome || "Exercício não encontrado";
  };

  return (
    <div className="px-5 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-display tracking-tight text-texto-primario">
            {titulo}
          </h1>
          <Botao
            variante="fantasma"
            tamanho="compacto"
            className="mt-1"
            icone={<Icone nome="copiar" tamanho={14} />}
            onClick={() => setModalCopiarFichaAberto(true)}
          >
            Copiar de existente
          </Botao>
        </div>
        <button
          type="button"
          onClick={aoVoltar}
          className="p-2 -mr-2 text-texto-secundario hover:text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors shrink-0"
        >
          <Icone nome="fechar" tamanho={24} />
        </button>
      </div>

      {/* Preview da ficha */}
      <div className="flex items-center gap-3 px-4 py-3 bg-superficie-suave rounded-xl border border-borda-suave">
        <span className="text-3xl">{icone || "💪"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-texto-primario truncate">
            {nome || "Nome da ficha"}
          </p>
          {descricao && (
            <p className="text-xs text-texto-secundario truncate">
              {descricao}
            </p>
          )}
          {exercicios.length > 0 && (
            <p className="text-xs text-texto-sutil">
              {exercicios.length} {exercicios.length === 1 ? "exercício" : "exercícios"}
              {cardio.length > 0 && " · cardio"}
            </p>
          )}
        </div>
      </div>

      {/* Formulário */}
      <div className="space-y-6">
        {/* Nome */}
        <Input
          label="Nome da ficha"
          tipo="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Treino A"
        />

        {/* Descrição */}
        <Input
          label="Descrição (opcional)"
          tipo="textarea"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Foco em peito e tríceps"
          linhas={2}
        />

        {/* Ícone/Emoji */}
        <SeletorIcone valor={icone} aoAlterar={setIcone} />

        {/* Exercícios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-texto-primario">
              Exercícios
            </label>
            {!mostraPicker && (
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
            </div>
          )}
        </div>

        {/* Cardio */}
        <div>
          {!mostraCardio ? (
            <button
              type="button"
              onClick={() => setMostraCardio(true)}
              className="
                w-full px-4 py-3
                bg-superficie border border-borda border-dashed
                rounded-xl
                text-sm text-texto-secundario
                hover:border-acento hover:text-acento
                transition-colors duration-150
              "
            >
              + Adicionar seção de cardio
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-texto-primario">
                  Cardio
                </label>
                <button
                  type="button"
                  onClick={() => setMostraCardio(false)}
                  className="text-xs text-texto-secundario hover:text-error"
                >
                  Remover seção
                </button>
              </div>

              {/* Botões de tipo */}
              <div className="flex flex-wrap gap-2">
                {TIPOS_CARDIO.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleAdicionarCardio(tipo)}
                    className="px-3 py-2 bg-superficie-suave hover:bg-superficie-hover rounded-lg text-sm text-texto-primario transition-colors"
                  >
                    +{tipo}
                  </button>
                ))}
              </div>

              {/* Lista de cardio */}
              {cardio.length === 0 ? (
                <p className="text-xs text-texto-sutil text-center py-4">
                  Selecione um tipo de cardio acima
                </p>
              ) : (
                <div className="space-y-2">
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
      </div>

      {/* Ações - fixado na base */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-superficie/95 backdrop-blur-xl border-t border-borda">
        <div className="max-w-[480px] mx-auto flex gap-3">
          {editando && (
            <Botao variante="secundario" onClick={handleCopiar}>
              Copiar
            </Botao>
          )}

          <Botao variante="secundario" onClick={aoVoltar} className="flex-1">
            Cancelar
          </Botao>

          <Botao variante="primario" onClick={handleSalvar} className="flex-1">
            {editando ? "Salvar" : "Criar Ficha"}
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
    </div>
  );
}

/* ── Componentes Internos ── */

interface CardExercicioConfigProps {
  nome: string;
  config: ExercicioFicha;
  aoAtualizar: (atualizacoes: Partial<ExercicioFicha>) => void;
  aoRemover: () => void;
  semBorda?: boolean;
}

function CardExercicioConfig({
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
        <h4 className="text-sm font-medium text-texto-primario">{nome}</h4>
        <button
          type="button"
          onClick={aoRemover}
          className="text-xs text-texto-secundario hover:text-error"
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
          <input
            type="number"
            min={1}
            max={20}
            value={config.series}
            onChange={(e) =>
              aoAtualizar({ series: parseInt(e.target.value) || 1 })
            }
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
          <input
            type="number"
            min={1}
            max={100}
            value={config.repeticoes}
            onChange={(e) =>
              aoAtualizar({ repeticoes: parseInt(e.target.value) || 1 })
            }
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
            Carga
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
            <span className="text-xs text-texto-sutil">Usa</span>
          </div>
        </div>

        {/* Descanso */}
        <div>
          <label className="text-xs text-texto-secundario mb-1 block">
            Descanso
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={600}
              step={10}
              value={config.descansoSegundos}
              onChange={(e) =>
                aoAtualizar({
                  descansoSegundos: parseInt(e.target.value) || 60,
                })
              }
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
    <div className="flex items-center gap-3 px-4 py-3 bg-superficie-suave rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Chip rotulo={config.tipo} tamanho="pequeno" />
          <button
            type="button"
            onClick={aoRemover}
            className="text-xs text-texto-secundario hover:text-error ml-auto"
          >
            Remover
          </button>
        </div>

        <div className="flex gap-3">
          {/* Duração */}
          <div className="flex-1">
            <label className="text-xs text-texto-secundario mb-1 block">
              Duração (min)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={config.duracaoMinutos}
              onChange={(e) =>
                aoAtualizar({ duracaoMinutos: parseInt(e.target.value) || 1 })
              }
              className="
                w-full px-2 py-2
                bg-superficie border border-borda
                rounded-lg text-sm
                focus:border-acento focus:outline-none
              "
            />
          </div>
        </div>

        {/* Nota */}
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
