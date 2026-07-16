import { useEffect, useMemo, useRef, useState } from "react";
import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Icone } from "@/interface/widget/svg/Icone";
import { Botao } from "@/interface/widget/botao/Botao";
import { appModule } from "@/interface/configuration/module/app.module";
import { HeaderExecucao } from "./HeaderExecucao";
import { ChipsItens } from "./ChipsItens";
import { RailItens } from "./RailItens";
import { CardSeries } from "./CardSeries";
import { CardRegistroCardio } from "./CardRegistroCardio";
import { HistoricoCardio } from "./HistoricoCardio";
import { NotaExercicio } from "./NotaExercicio";
import { AccordionProgressao } from "./AccordionProgressao";
import { TimerDescansoInline } from "./TimerDescansoInline";
import { ToastDesfazer } from "./ToastDesfazer";
import { OverlayConfirmarFinalizar } from "./OverlayConfirmarFinalizar";
import { OverlayFinalizado } from "./OverlayFinalizado";
import { OverlayConfirmarCancelar } from "./OverlayConfirmarCancelar";
import { OverlayHistoricoSerie } from "./OverlayHistoricoSerie";
import { OverlayGraficoProgressao } from "./OverlayGraficoProgressao";
import { useSessaoTreino } from "./hooks/useSessaoTreino";
import { useTimerDescanso } from "./hooks/useTimerDescanso";
import { useInterceptarVoltar } from "./hooks/useInterceptarVoltar";
import { nomeDoItem } from "./nomeItem";

interface ExecucaoTreinoPageProps {
  ficha: Ficha;
  historico: RegistroTreino[];
  aoVoltar: () => void;
}

/** Execução de treino paginada por item da ficha (exercício ou cardio, na
    ordem definida na criação). Mobile navega por chips + footer; no md+ os
    chips viram rail lateral; no lg+ entra o painel de contexto à direita. */
export function ExecucaoTreinoPage({ ficha, historico, aoVoltar }: ExecucaoTreinoPageProps) {
  const sessao = useSessaoTreino(ficha, historico);
  const segundosDescanso = sessao.configuracaoAtual?.descansoSegundos ?? 0;
  const timer = useTimerDescanso(segundosDescanso);
  const { resetar: resetarTimer, rodando: timerRodando, segundosRestantes: timerSegundosRestantes } = timer;

  const [confirmarFinalizarAberto, setConfirmarFinalizarAberto] = useState(false);
  const [confirmarCancelarAberto, setConfirmarCancelarAberto] = useState(false);
  const [serieHistoricoAlvo, setSerieHistoricoAlvo] = useState<number | null>(null);
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [desfazerAlvo, setDesfazerAlvo] = useState<{ indiceSerie: number; texto: string } | null>(null);
  const [finalizadoAberto, setFinalizadoAberto] = useState(false);
  const rodandoAnterior = useRef(false);

  // "Voltar" (back do navegador ou físico do Android) não pode sair direto pra
  // home: primeiro fecha algum overlay aberto; senão, pede confirmação de
  // abandono — a mesma do kebab. Inativo quando o treino já foi finalizado
  // (aí o "Concluir" do overlay de fim é quem leva embora).
  useInterceptarVoltar(!finalizadoAberto, () => {
    if (confirmarFinalizarAberto) return setConfirmarFinalizarAberto(false);
    if (serieHistoricoAlvo !== null) return setSerieHistoricoAlvo(null);
    if (graficoAberto) return setGraficoAberto(false);
    if (confirmarCancelarAberto) return setConfirmarCancelarAberto(false);
    setConfirmarCancelarAberto(true);
  });

  // Descanso terminou: feedback tátil e volta ao tempo programado (o card
  // inline some sozinho — só aparece com descanso em andamento).
  useEffect(() => {
    if (rodandoAnterior.current && !timerRodando && timerSegundosRestantes === 0) {
      void appModule.feedbackTatil.sucesso();
      resetarTimer();
    }
    rodandoAnterior.current = timerRodando;
  }, [resetarTimer, timerRodando, timerSegundosRestantes]);

  const catalogo = stateManagerRepository.listarTodosExercicios();
  const tiposCardio = stateManagerRepository.listarTiposCardio();

  const historicoDaFicha = useMemo(
    () => historico.filter((registro) => registro.fichaId === ficha.id),
    [ficha.id, historico]
  );

  const itemAtual = sessao.itemAtual;
  const exercicioAtual = itemAtual?.tipo === "exercicio" ? itemAtual.exercicio : undefined;
  const cardioAtual = itemAtual?.tipo === "cardio" ? itemAtual : undefined;

  const statusAtual = sessao.statusItens[sessao.indiceAtual];
  const nomeAtual = statusAtual ? nomeDoItem(statusAtual, catalogo, tiposCardio).nome : "";
  const grupoMuscular = catalogo.find(
    (exercicio) => exercicio.id === exercicioAtual?.exercicioId
  )?.grupoMuscular;

  const statusAnterior = sessao.indiceAtual > 0 ? sessao.statusItens[sessao.indiceAtual - 1] : undefined;
  const statusProximo = sessao.ultimoItem ? undefined : sessao.statusItens[sessao.indiceAtual + 1];
  const nomeAnterior = statusAnterior && nomeDoItem(statusAnterior, catalogo, tiposCardio).nome;
  const nomeProximo = statusProximo && nomeDoItem(statusProximo, catalogo, tiposCardio).nome;

  // Séries da última sessão deste exercício — rótulos da coluna "anterior".
  const seriesAnteriores = useMemo(() => {
    const id = exercicioAtual?.exercicioId;
    if (!id) return [];
    const registro = [...historicoDaFicha]
      .sort((a, b) => new Date(b.finalizadoEm).getTime() - new Date(a.finalizadoEm).getTime())
      .find((item) =>
        item.exercicios.some((exercicio) => exercicio.exercicioId === id && exercicio.series.length > 0)
      );
    return registro?.exercicios.find((exercicio) => exercicio.exercicioId === id)?.series ?? [];
  }, [historicoDaFicha, exercicioAtual?.exercicioId]);

  const cardioPrePreenchido = useMemo(
    () =>
      cardioAtual !== undefined &&
      historicoDaFicha.some((registro) =>
        registro.cardio.some((item) => item.tipo === cardioAtual.registro.tipo)
      ),
    [cardioAtual, historicoDaFicha]
  );

  // Timer inline visível só com descanso em andamento (rodando ou pausado no meio).
  const timerVisivel =
    exercicioAtual !== undefined &&
    segundosDescanso > 0 &&
    (timer.rodando || (timer.segundosRestantes > 0 && timer.segundosRestantes < segundosDescanso));

  const persistirFinalizacao = () => {
    const registro = sessao.finalizar();
    stateManagerRepository.adicionarTreino({
      fichaId: registro.fichaId,
      data: registro.data,
      iniciadoEm: registro.iniciadoEm,
      finalizadoEm: registro.finalizadoEm,
      exercicios: registro.exercicios,
      cardio: registro.cardio,
    });
    void sessao.encerrar();
    setConfirmarFinalizarAberto(false);
    setFinalizadoAberto(true);
    void appModule.feedbackTatil.sucesso();
  };

  const descartarTreino = () => {
    void sessao.encerrar();
    aoVoltar();
  };

  const solicitarFinalizacao = () => {
    if (sessao.resumoFinalizacao().completo) {
      persistirFinalizacao();
      return;
    }
    setConfirmarFinalizarAberto(true);
  };

  const concluirSerie = (indiceSerie: number) => {
    const jaConcluida = exercicioAtual?.concluidas.has(indiceSerie);
    sessao.marcarConcluida(sessao.indiceAtual, indiceSerie);
    if (!jaConcluida) {
      void appModule.feedbackTatil.impactoMedio();
      if (segundosDescanso > 0) timer.reiniciar();
      setDesfazerAlvo({ indiceSerie, texto: `Série ${indiceSerie + 1} concluída` });
    }
  };

  const concluirCardio = (id: string) => {
    if (cardioAtual && !cardioAtual.concluido) {
      void appModule.feedbackTatil.impactoMedio();
    }
    sessao.marcarCardioConcluido(id);
  };

  if (sessao.itens.length === 0) {
    return (
      <div className="min-h-[100dvh] px-4 py-8 text-center text-sm text-texto-secundario">
        Esta ficha ainda não tem exercícios ou cardio.
      </div>
    );
  }

  const botaoProximo = (
    <Botao
      variante="secundario"
      ocuparLarguraTotal
      onClick={sessao.ultimoItem ? solicitarFinalizacao : sessao.proximo}
    >
      <span className="min-w-0 truncate">
        {sessao.ultimoItem ? "Finalizar treino" : `Próximo: ${nomeProximo}`}
      </span>
      <Icone nome="setaDireita" tamanho={15} className="shrink-0" />
    </Botao>
  );

  return (
    // Sem bg opaco: deixa o degradê quente do #root (index.css) aparecer.
    <div className="flex h-[100dvh] flex-col overflow-hidden text-texto-primario">
      <HeaderExecucao
        nomeFicha={ficha.nome}
        iconeFicha={ficha.icone}
        emojiFicha={ficha.emoji}
        iniciadoEm={sessao.iniciadoEm}
        progresso={sessao.progresso}
        aoFinalizar={solicitarFinalizacao}
        aoAbandonar={() => setConfirmarCancelarAberto(true)}
      />

      <div className="flex min-h-0 flex-1">
        <RailItens
          itens={sessao.statusItens}
          catalogo={catalogo}
          tiposCardio={tiposCardio}
          aoIrPara={sessao.irPara}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <ChipsItens
            itens={sessao.statusItens}
            catalogo={catalogo}
            tiposCardio={tiposCardio}
            aoIrPara={sessao.irPara}
          />

          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-2 md:px-6 md:pt-4">
              <div className="mx-auto w-full max-w-[640px]">
                <h1 className="break-words font-display text-[clamp(24px,6.5vw,28px)] font-semibold leading-[1.1] text-texto-primario">
                  {nomeAtual}
                </h1>
                <p className="mt-1.5 text-[13px] text-texto-secundario">
                  {exercicioAtual && sessao.configuracaoAtual
                    ? `${grupoMuscular ?? "Grupo"} · ${sessao.configuracaoAtual.series}x${sessao.configuracaoAtual.repeticoes} · ${sessao.configuracaoAtual.descansoSegundos}s descanso`
                    : cardioPrePreenchido
                      ? "Cardio · valores da última sessão pré-preenchidos"
                      : "Cardio"}
                </p>

                {timerVisivel ? (
                  <div className="mt-3">
                    <TimerDescansoInline
                      tempoFormatado={timer.tempoFormatado}
                      segundosRestantes={timer.segundosRestantes}
                      segundosIniciais={segundosDescanso}
                      rodando={timer.rodando}
                      aoAlternar={timer.alternar}
                      aoPular={timer.resetar}
                    />
                  </div>
                ) : null}

                <div className="mt-3.5">
                  {exercicioAtual && sessao.configuracaoAtual ? (
                    <CardSeries
                      exercicio={exercicioAtual}
                      usaCarga={sessao.configuracaoAtual.usaCarga}
                      seriesAnteriores={seriesAnteriores}
                      aoAtualizarSerie={(indiceSerie, atualizacao) =>
                        sessao.atualizarSerie(sessao.indiceAtual, indiceSerie, atualizacao)
                      }
                      aoAdicionarSerie={() => sessao.adicionarSerie(sessao.indiceAtual)}
                      aoRemoverSerie={(indiceSerie) =>
                        sessao.removerSerie(sessao.indiceAtual, indiceSerie)
                      }
                      aoMarcarConcluida={concluirSerie}
                      aoAbrirHistorico={setSerieHistoricoAlvo}
                    />
                  ) : cardioAtual ? (
                    <CardRegistroCardio
                      registro={cardioAtual.registro}
                      tiposCardio={tiposCardio}
                      concluido={cardioAtual.concluido}
                      aoAtualizar={(atualizacao) =>
                        sessao.atualizarCardio(cardioAtual.registro.cardioId, atualizacao)
                      }
                      aoConcluir={() => concluirCardio(cardioAtual.registro.cardioId)}
                    />
                  ) : null}
                </div>

                {/* Nota/progressão colapsadas — no lg+ vivem abertas no painel */}
                <div className="mt-3 space-y-3 lg:hidden">
                  {exercicioAtual ? (
                    <>
                      <NotaExercicio
                        nota={exercicioAtual.nota}
                        aoAtualizar={(nota) => sessao.atualizarNota(sessao.indiceAtual, nota)}
                      />
                      <AccordionProgressao
                        exercicioId={exercicioAtual.exercicioId}
                        historico={historicoDaFicha}
                        aoAbrirGrafico={() => setGraficoAberto(true)}
                      />
                    </>
                  ) : cardioAtual ? (
                    <NotaExercicio
                      nota={cardioAtual.registro.nota}
                      aoAtualizar={(nota) =>
                        sessao.atualizarCardio(cardioAtual.registro.cardioId, { nota })
                      }
                      rotulo="nota desta atividade"
                    />
                  ) : null}
                </div>

                {/* Próximo inline (md+): o rail cobre o "Anterior" */}
                <div className="mt-4 hidden md:block">{botaoProximo}</div>
              </div>
            </main>

            {/* Painel de contexto (lg+): o que no mobile é accordion, aberto */}
            <aside className="hidden w-[320px] shrink-0 space-y-3 overflow-y-auto py-4 pl-1 pr-5 lg:block">
              {exercicioAtual ? (
                <>
                  <AccordionProgressao
                    exercicioId={exercicioAtual.exercicioId}
                    historico={historicoDaFicha}
                    aoAbrirGrafico={() => setGraficoAberto(true)}
                    variante="aberta"
                  />
                  <NotaExercicio
                    nota={exercicioAtual.nota}
                    aoAtualizar={(nota) => sessao.atualizarNota(sessao.indiceAtual, nota)}
                    variante="aberta"
                  />
                </>
              ) : cardioAtual ? (
                <>
                  <HistoricoCardio historico={historicoDaFicha} tiposCardio={tiposCardio} />
                  <NotaExercicio
                    nota={cardioAtual.registro.nota}
                    aoAtualizar={(nota) =>
                      sessao.atualizarCardio(cardioAtual.registro.cardioId, { nota })
                    }
                    rotulo="nota desta atividade"
                    variante="aberta"
                  />
                </>
              ) : null}
            </aside>
          </div>
        </div>
      </div>

      {/* Footer mobile: navegação entre itens. Abandonar saiu daqui (zona do
          dedão) e virou item do kebab no header. */}
      <footer className="border-t border-borda-suave bg-fundo/95 px-4 pb-[calc(var(--safe-bottom)+18px)] pt-2.5 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <Botao
            variante="secundario"
            ocuparLarguraTotal
            disabled={sessao.indiceAtual === 0}
            onClick={sessao.anterior}
            icone={<Icone nome="setaEsquerda" tamanho={15} className="shrink-0" />}
          >
            <span className="min-w-0 truncate">{nomeAnterior ?? "Anterior"}</span>
          </Botao>
          {botaoProximo}
        </div>
      </footer>

      <OverlayConfirmarFinalizar
        aberto={confirmarFinalizarAberto}
        resumo={sessao.resumoFinalizacao()}
        aoContinuar={() => setConfirmarFinalizarAberto(false)}
        aoFinalizar={persistirFinalizacao}
      />
      <OverlayConfirmarCancelar
        aberto={confirmarCancelarAberto}
        aoContinuar={() => setConfirmarCancelarAberto(false)}
        aoDescartar={descartarTreino}
      />
      {exercicioAtual && (
        <OverlayHistoricoSerie
          aberto={serieHistoricoAlvo !== null}
          exercicioId={exercicioAtual.exercicioId}
          historico={historicoDaFicha}
          aoFechar={() => setSerieHistoricoAlvo(null)}
          aoSelecionar={(serie) => {
            if (serieHistoricoAlvo !== null) sessao.preencherDoHistorico(serieHistoricoAlvo, serie);
            setSerieHistoricoAlvo(null);
          }}
        />
      )}
      {exercicioAtual && (
        <OverlayGraficoProgressao
          aberto={graficoAberto}
          aoFechar={() => setGraficoAberto(false)}
          exercicioId={exercicioAtual.exercicioId}
          exercicios={catalogo}
          historico={historicoDaFicha}
        />
      )}
      <OverlayFinalizado aberto={finalizadoAberto} aoConcluir={aoVoltar} />
      <ToastDesfazer
        mensagem={desfazerAlvo?.texto ?? null}
        aoDesfazer={() => {
          if (desfazerAlvo) {
            sessao.marcarConcluida(sessao.indiceAtual, desfazerAlvo.indiceSerie);
            timer.resetar();
          }
        }}
        aoFechar={() => setDesfazerAlvo(null)}
      />
    </div>
  );
}
