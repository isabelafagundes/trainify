import { useEffect, useMemo, useRef, useState } from "react";
import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { HeaderExecucao } from "./HeaderExecucao";
import { BarraProgressoExercicios } from "./BarraProgressoExercicios";
import { CardSeries } from "./CardSeries";
import { NotaExercicio } from "./NotaExercicio";
import { AccordionProgressao } from "./AccordionProgressao";
import { TimerDescanso, BotaoTimerDescanso } from "./TimerDescanso";
import { ToastDesfazer } from "./ToastDesfazer";
import { NavegacaoExercicios } from "./NavegacaoExercicios";
import { PainelCardio } from "./PainelCardio";
import { OverlayConfirmarFinalizar } from "./OverlayConfirmarFinalizar";
import { OverlayFinalizado } from "./OverlayFinalizado";
import { OverlayConfirmarCancelar } from "./OverlayConfirmarCancelar";
import { OverlayHistoricoSerie } from "./OverlayHistoricoSerie";
import { OverlayGraficoProgressao } from "./OverlayGraficoProgressao";
import { useSessaoTreino } from "./hooks/useSessaoTreino";
import { useTimerDescanso } from "./hooks/useTimerDescanso";
import { appModule } from "@/interface/configuration/module/app.module";

interface ExecucaoTreinoPageProps {
  ficha: Ficha;
  historico: RegistroTreino[];
  aoVoltar: () => void;
}

export function ExecucaoTreinoPage({
  ficha,
  historico,
  aoVoltar,
}: ExecucaoTreinoPageProps) {
  const sessao = useSessaoTreino(ficha);
  const segundosDescanso = sessao.configuracaoAtual?.descansoSegundos ?? 0;
  const timer = useTimerDescanso(segundosDescanso);
  const [confirmarFinalizarAberto, setConfirmarFinalizarAberto] = useState(false);
  const [confirmarCancelarAberto, setConfirmarCancelarAberto] = useState(false);
  const [serieHistoricoAlvo, setSerieHistoricoAlvo] = useState<number | null>(null);
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [timerAberto, setTimerAberto] = useState(false);
  const [desfazerAlvo, setDesfazerAlvo] = useState<{ indiceSerie: number; texto: string } | null>(null);
  const [finalizadoAberto, setFinalizadoAberto] = useState(false);
  const rodandoAnterior = useRef(false);

  useEffect(() => {
    if (rodandoAnterior.current && !timer.rodando && timer.segundosRestantes === 0) {
      const id = window.setTimeout(() => setTimerAberto(false), 0);
      void appModule.feedbackTatil.sucesso();
      rodandoAnterior.current = timer.rodando;
      return () => window.clearTimeout(id);
    }
    rodandoAnterior.current = timer.rodando;
  }, [timer.rodando, timer.segundosRestantes]);

  const catalogo = stateManagerRepository.listarTodosExercicios();
  const exercicioCatalogo = catalogo.find(
    (exercicio) => exercicio.id === sessao.exercicioAtual?.exercicioId
  );

  const historicoDaFicha = useMemo(
    () => historico.filter((registro) => registro.fichaId === ficha.id),
    [ficha.id, historico]
  );

  const concluidos = sessao.exercicios.map(
    (exercicio) => exercicio.concluidas.size === exercicio.series.length
  );

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
    setConfirmarFinalizarAberto(false);
    setFinalizadoAberto(true);
    void appModule.feedbackTatil.sucesso();
  };

  const solicitarFinalizacao = () => {
    const resumo = sessao.resumoFinalizacao();
    if (resumo.completo) {
      persistirFinalizacao();
      return;
    }
    setConfirmarFinalizarAberto(true);
  };

  if (!sessao.exercicioAtual || !sessao.configuracaoAtual) {
    return (
      <div className="min-h-[100dvh] bg-fundo px-4 py-8 text-center text-sm text-texto-secundario">
        Esta ficha ainda não tem exercícios.
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-fundo text-texto-primario">
      <HeaderExecucao
        nomeFicha={ficha.nome}
        iconeFicha={ficha.icone}
        emojiFicha={ficha.emoji}
        modo={sessao.modo}
        temCardio={sessao.temCardio}
        aoAlternarModo={sessao.alternarModo}
        aoCancelar={() => setConfirmarCancelarAberto(true)}
      />

      {sessao.modo === "cardio" ? (
        <PainelCardio
          cardio={sessao.cardio}
          cardioConcluido={sessao.cardioConcluido}
          aoAtualizarCardio={sessao.atualizarCardio}
          aoConcluirCardio={(id) => {
            if (!sessao.cardioConcluido.has(id)) {
              void appModule.feedbackTatil.impactoMedio();
            }
            sessao.marcarCardioConcluido(id);
          }}
          aoVoltarMusculacao={sessao.alternarModo}
          aoFinalizar={solicitarFinalizacao}
        />
      ) : (
        <>
          <BarraProgressoExercicios
            total={sessao.exercicios.length}
            indiceAtual={sessao.indiceAtual}
            concluidos={concluidos}
            aoIrPara={sessao.irPara}
          />

          <main className="px-4 pb-32 pt-7">
            <section className="mb-8 transition-transform duration-300">
              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 font-display text-[clamp(22px,6.5vw,32px)] font-semibold leading-[1.1] text-texto-primario break-words">
                  {exercicioCatalogo?.nome ?? "Exercício"}
                </h1>
                <div className="flex-shrink-0">
                  <BotaoTimerDescanso
                    tempo={timer.tempoFormatado}
                    rodando={timer.rodando}
                    aoAbrir={() => setTimerAberto(true)}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-texto-secundario">
                {exercicioCatalogo?.grupoMuscular ?? "Grupo"} · {sessao.configuracaoAtual.series}x
                {sessao.configuracaoAtual.repeticoes} · {sessao.configuracaoAtual.descansoSegundos}s descanso
              </p>
            </section>

            <div className="space-y-5">
              <CardSeries
                exercicio={sessao.exercicioAtual}
                usaCarga={sessao.configuracaoAtual.usaCarga}
                aoAtualizarSerie={(indiceSerie, atualizacao) =>
                  sessao.atualizarSerie(sessao.indiceAtual, indiceSerie, atualizacao)
                }
                aoAdicionarSerie={() => sessao.adicionarSerie(sessao.indiceAtual)}
                aoRemoverSerie={(indiceSerie) => sessao.removerSerie(sessao.indiceAtual, indiceSerie)}
                aoMarcarConcluida={(indiceSerie) => {
                  const jaConcluida = sessao.exercicioAtual?.concluidas.has(indiceSerie);
                  sessao.marcarConcluida(sessao.indiceAtual, indiceSerie);
                  if (!jaConcluida) {
                    void appModule.feedbackTatil.impactoMedio();
                    timer.reiniciar();
                    setTimerAberto(true);
                    setDesfazerAlvo({
                      indiceSerie,
                      texto: `Série ${indiceSerie + 1} concluída`,
                    });
                  }
                }}
                aoAbrirHistorico={setSerieHistoricoAlvo}
              />

              <NotaExercicio
                nota={sessao.exercicioAtual.nota}
                aoAtualizar={(nota) => sessao.atualizarNota(sessao.indiceAtual, nota)}
              />

              <AccordionProgressao
                exercicioId={sessao.exercicioAtual.exercicioId}
                historico={historicoDaFicha}
                aoAbrirGrafico={() => setGraficoAberto(true)}
              />
            </div>
          </main>

          <TimerDescanso
            aberto={timerAberto}
            tempo={timer.tempoFormatado}
            segundosRestantes={timer.segundosRestantes}
            segundosIniciais={segundosDescanso}
            rodando={timer.rodando}
            aoAlternar={timer.alternar}
            aoResetar={timer.resetar}
            aoFechar={() => setTimerAberto(false)}
          />
          <NavegacaoExercicios
            indiceAtual={sessao.indiceAtual}
            total={sessao.exercicios.length}
            ultimoExercicio={sessao.ultimoExercicio}
            aoAnterior={sessao.anterior}
            aoProximo={sessao.proximo}
            aoFinalizar={solicitarFinalizacao}
          />
        </>
      )}

      <OverlayConfirmarFinalizar
        aberto={confirmarFinalizarAberto}
        resumo={sessao.resumoFinalizacao()}
        aoContinuar={() => setConfirmarFinalizarAberto(false)}
        aoFinalizar={persistirFinalizacao}
      />
      <OverlayConfirmarCancelar
        aberto={confirmarCancelarAberto}
        aoContinuar={() => setConfirmarCancelarAberto(false)}
        aoDescartar={aoVoltar}
      />
      <OverlayHistoricoSerie
        aberto={serieHistoricoAlvo !== null}
        exercicioId={sessao.exercicioAtual.exercicioId}
        historico={historicoDaFicha}
        aoFechar={() => setSerieHistoricoAlvo(null)}
        aoSelecionar={(serie) => {
          if (serieHistoricoAlvo !== null) sessao.preencherDoHistorico(serieHistoricoAlvo, serie);
          setSerieHistoricoAlvo(null);
        }}
      />
      <OverlayGraficoProgressao
        aberto={graficoAberto}
        aoFechar={() => setGraficoAberto(false)}
        exercicioId={sessao.exercicioAtual.exercicioId}
        exercicios={catalogo}
        historico={historicoDaFicha}
      />
      <OverlayFinalizado aberto={finalizadoAberto} aoConcluir={aoVoltar} />
      <ToastDesfazer
        mensagem={desfazerAlvo?.texto ?? null}
        aoDesfazer={() => {
          if (desfazerAlvo) {
            sessao.marcarConcluida(sessao.indiceAtual, desfazerAlvo.indiceSerie);
            setTimerAberto(false);
          }
        }}
        aoFechar={() => setDesfazerAlvo(null)}
      />
    </div>
  );
}
