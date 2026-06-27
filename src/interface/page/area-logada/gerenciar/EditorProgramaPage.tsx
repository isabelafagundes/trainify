/* ═══════════════════════════════════════════
   Editor de Programa — Criar/Editar Programas
   ═══════════════════════════════════════════ */

import { useEffect, useState } from "react";
import type { Programa } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { useToast } from "@/interface/widget/toast";
import { ModalCopiarPrograma } from "@/interface/widget/modal/ModalCopiarPrograma";
import type { OpcoesNavegacao } from "@/interface/rota/useNavegar";

interface PropriedadesEditorProgramaPage {
  programaId?: string;
  aoVoltar: () => void;
  aoNavegar: (
    destino: string,
    params?: Record<string, string>,
    opcoes?: OpcoesNavegacao
  ) => void;
}

export function EditorProgramaPage({
  programaId,
  aoVoltar,
  aoNavegar,
}: PropriedadesEditorProgramaPage) {
  const { showError } = useToast();
  const [, setPrograma] = useState<Programa | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(false);
  const [programaTempId, setProgramaTempId] = useState<string | null>(null);
  const [modalCopiarProgramaAberto, setModalCopiarProgramaAberto] = useState(false);
  const [modalNovaFicha, setModalNovaFicha] = useState(false);
  const [modalSelecionarFicha, setModalSelecionarFicha] = useState(false);

  const editando = Boolean(programaId);
  const titulo = editando ? "Editar Programa" : "Novo Programa";
  const idParaUsar = programaId || programaTempId;
  const programaPersistido = Boolean(idParaUsar);

  // Carregar dados
  useEffect(() => {
    const carregarDados = () => {
      if (programaId) {
        const prog = stateManagerRepository.obterProgramaPorId(programaId);
        if (prog) {
          setPrograma(prog);
          setNome(prog.nome);
          setDescricao(prog.descricao);
          setAtivo(prog.ativo);
        }
      } else {
        // Novo programa - começar como ativo se não houver outros
        const programaAtivo = stateManagerRepository.obterProgramaAtivo();
        setAtivo(!programaAtivo);
      }
    };

    carregarDados();

    const cancelarInscricao = stateManagerRepository.inscrever(carregarDados);
    return cancelarInscricao;
  }, [programaId]);

  // Handlers
  const handleSalvar = () => {
    if (!nome.trim()) {
      showError("Digite um nome para o programa.");
      return;
    }

    if (idParaUsar) {
      // Ao editar, atualizamos apenas os campos editáveis, preservando fichaIds
      stateManagerRepository.atualizarPrograma(idParaUsar, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativo,
      });
    } else {
      // Ao criar, passamos todos os campos incluindo fichaIds vazio
      stateManagerRepository.adicionarPrograma({
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativo,
        fichaIds: [],
      });
    }

    aoVoltar();
  };

  const handleCopiarProgramaExistente = (programaId: string) => {
    const programa = stateManagerRepository.obterProgramaPorId(programaId);
    if (!programa) return;

    setNome(programa.nome);
    setDescricao(programa.descricao);
    setAtivo(false); // Começa inativo ao copiar

    setModalCopiarProgramaAberto(false);
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
        <div className="flex items-center justify-between">
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
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-5 py-4 pb-6 space-y-6">
          {/* Copiar de existente */}
          <Botao
            variante="secundario"
            tamanho="compacto"
            className="w-full"
            icone={<Icone nome="copiar" tamanho={14} />}
            onClick={() => setModalCopiarProgramaAberto(true)}
          >
            Copiar de existente
          </Botao>

          {/* Nome */}
          <Input
            label="Nome"
            tipo="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Rotina Janeiro"
            ajuda="Nome para identificar o programa"
          />

          {/* Descrição */}
          <Input
            label="Descrição (opcional)"
            tipo="textarea"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Rotina de volume, 4x por semana"
            linhas={2}
            ajuda="Descreva o objetivo ou características do programa"
          />

          {/* Programa ativo */}
          <button
            type="button"
            onClick={() => setAtivo(!ativo)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full
              ${ativo
                ? "bg-acento/20 text-acento"
                : "bg-superficie-suave text-texto-secundario"
              }
            `}
          >
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">
                Programa ativo
              </p>
              <p className="text-xs opacity-80">
                Apenas um programa pode estar ativo por vez
              </p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${ativo ? "bg-acento" : "bg-borda"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-superficie transition-transform duration-200 ${ativo ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          {/* Info sobre fichas */}
          <div className="px-4 py-3 bg-superficie-suave rounded-xl border border-borda-suave">
            {programaPersistido && idParaUsar ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-texto-primario">
                    Fichas do programa
                  </p>
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    icone={<Icone nome="mais" tamanho={14} />}
                    onClick={() => setModalNovaFicha(true)}
                  >
                    Nova ficha
                  </Botao>
                </div>

                {(() => {
                  const fichasDoPrograma = stateManagerRepository.obterFichasDoPrograma(idParaUsar);
                  if (fichasDoPrograma.length === 0) {
                    return (
                      <p className="text-sm text-texto-sutil py-2">
                        Nenhuma ficha criada ainda
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {fichasDoPrograma.map((ficha) => (
                        <div
                          key={ficha.id}
                          className="flex items-center gap-3 px-3 py-2 bg-superficie rounded-lg border border-borda-suave"
                        >
                          <span className="text-xl shrink-0">
                            {ficha.emoji || "💪"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-texto-primario truncate">
                              {ficha.nome}
                            </p>
                            <p className="text-xs text-texto-secundario">
                              {ficha.exercicios.length} {ficha.exercicios.length === 1 ? "exercício" : "exercícios"}
                            </p>
                          </div>
                          <Botao
                            variante="fantasma"
                            tamanho="compacto"
                            onClick={() => aoNavegar("editarFicha", { id: ficha.id })}
                          >
                            Editar
                          </Botao>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            ) : (
              <>
                <p className="text-sm text-texto-secundario">
                  Salve o programa para criar fichas.
                </p>
                <Botao
                  variante="fantasma"
                  tamanho="compacto"
                  className="mt-3"
                  icone={<Icone nome="mais" tamanho={14} />}
                  onClick={() => {
                    if (!nome.trim()) {
                      showError("Digite um nome para o programa antes de criar fichas.");
                      return;
                    }
                    setModalNovaFicha(true);
                  }}
                >
                  Criar nova ficha
                </Botao>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer fixo com botões */}
      <div className="shrink-0 px-5 pt-4 pb-[max(var(--safe-bottom),16px)] border-t border-borda bg-superficie/95 backdrop-blur-sm">
        <div className="max-w-[480px] mx-auto">
          <Botao
            variante="primario"
            onClick={handleSalvar}
            className="w-full"
          >
            {programaPersistido ? "Salvar" : "Criar Programa"}
          </Botao>
        </div>
      </div>

      {/* Modal de copiar programa */}
      <ModalCopiarPrograma
        aberto={modalCopiarProgramaAberto}
        aoCopiar={handleCopiarProgramaExistente}
        aoCancelar={() => setModalCopiarProgramaAberto(false)}
      />

      {/* Modal Nova Ficha - Opções */}
      {modalNovaFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setModalNovaFicha(false)}
          />

          {/* Modal Content */}
          <div className="relative w-[350px] bg-superficie rounded-3xl shadow-xl border border-borda animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-borda-suave">
              <h3 className="text-lg font-semibold font-display text-texto-primario">Nova Ficha</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  // Salvar o programa se ainda não foi salvo
                  if (!idParaUsar && !nome.trim()) {
                    showError("Digite um nome para o programa primeiro.");
                    return;
                  }

                  let programaIdFinal = idParaUsar;
                  if (!programaIdFinal) {
                    const novoPrograma = stateManagerRepository.adicionarPrograma({
                      nome: nome.trim(),
                      descricao: descricao.trim(),
                      ativo,
                      fichaIds: [],
                    });
                    setProgramaTempId(novoPrograma.id);
                    programaIdFinal = novoPrograma.id;
                    aoNavegar("editarPrograma", { id: programaIdFinal }, { substituir: true });
                  }

                  setModalNovaFicha(false);
                  aoNavegar("criarFicha", { programaId: programaIdFinal });
                }}
                className="w-full px-4 py-3 bg-superficie-suave hover:bg-superficie-hover rounded-xl border border-borda-suave text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icone nome="mais" tamanho={20} />
                  <div>
                    <p className="font-medium text-sm">Criar nova ficha</p>
                    <p className="text-xs text-texto-secundario">Crie uma ficha do zero</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  // Salvar o programa se ainda não foi salvo
                  if (!idParaUsar && !nome.trim()) {
                    showError("Digite um nome para o programa primeiro.");
                    return;
                  }

                  let programaIdFinal = idParaUsar;
                  if (!programaIdFinal) {
                    const novoPrograma = stateManagerRepository.adicionarPrograma({
                      nome: nome.trim(),
                      descricao: descricao.trim(),
                      ativo,
                      fichaIds: [],
                    });
                    setProgramaTempId(novoPrograma.id);
                    programaIdFinal = novoPrograma.id;
                  }

                  setModalNovaFicha(false);
                  setModalSelecionarFicha(true);
                }}
                className="w-full px-4 py-3 bg-superficie-suave hover:bg-superficie-hover rounded-xl border border-borda-suave text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icone nome="halter" tamanho={20} />
                  <div>
                    <p className="font-medium text-sm">Adicionar ficha existente</p>
                    <p className="text-xs text-texto-secundario">Selecione uma ficha criada anteriormente</p>
                  </div>
                </div>
              </button>
            </div>
            <div className="px-5 py-4 border-t border-borda-suave flex justify-end">
              <Botao
                variante="fantasma"
                onClick={() => setModalNovaFicha(false)}
              >
                Cancelar
              </Botao>
            </div>
          </div>
        </div>
      )}

      {/* Modal Selecionar Ficha Existente */}
      {modalSelecionarFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setModalSelecionarFicha(false)}
          />

          {/* Modal Content */}
          <div className="relative w-[350px] max-h-[80vh] bg-superficie rounded-3xl shadow-xl border border-borda animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-5 py-4 border-b border-borda-suave shrink-0">
              <h3 className="text-lg font-semibold font-display text-texto-primario">Adicionar ficha existente</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {stateManagerRepository.listarFichas().map((ficha) => {
                  const programasDaFicha = stateManagerRepository.obterProgramasDaFicha(ficha.id);
                  const jaVinculada = programasDaFicha.some((p) => p.id === idParaUsar);
                  return (
                    <button
                      key={ficha.id}
                      type="button"
                      disabled={jaVinculada}
                      onClick={() => {
                        if (idParaUsar) {
                          stateManagerRepository.vincularFichaAoPrograma(ficha.id, idParaUsar);
                          setModalSelecionarFicha(false);
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        jaVinculada
                          ? "bg-superficie-suave border-borda-suave opacity-50 cursor-not-allowed"
                          : "bg-superficie-suave hover:bg-superficie-hover border-borda-suave"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{ficha.emoji || "💪"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-texto-primario truncate">{ficha.nome}</p>
                          <p className="text-xs text-texto-secundario">
                            {ficha.exercicios.length} {ficha.exercicios.length === 1 ? "exercício" : "exercícios"}
                          </p>
                        </div>
                        {jaVinculada && (
                          <span className="text-xs text-texto-sutil shrink-0">Já adicionada</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {stateManagerRepository.listarFichas().length === 0 && (
                  <p className="text-sm text-texto-sutil text-center py-8">
                    Nenhuma ficha criada ainda
                  </p>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-borda-suave flex justify-end shrink-0">
              <Botao
                variante="fantasma"
                onClick={() => setModalSelecionarFicha(false)}
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
