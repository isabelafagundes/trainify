import { useMemo } from "react";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { Icone } from "@/interface/widget/svg/Icone";
import { CardMetricaResumo } from "./CardMetricaResumo";
import { ItemProgressaoExercicio } from "./ItemProgressaoExercicio";
import {
  agregarProgressaoPorExercicio,
  calcularRecordeStreak,
  calcularStreakAtual,
  calcularTreinosNoMes,
} from "./utils";

interface PropriedadesEstatisticasPage {
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function EstatisticasPage({
  historico,
  exercicios,
  aoNavegar,
}: PropriedadesEstatisticasPage) {
  const hoje = useMemo(() => new Date(), []);

  const treinosNoMes = useMemo(
    () => calcularTreinosNoMes(historico, hoje),
    [historico, hoje],
  );
  const streakAtual = useMemo(
    () => calcularStreakAtual(historico, hoje),
    [historico, hoje],
  );
  const recordeStreak = useMemo(
    () => calcularRecordeStreak(historico),
    [historico],
  );
  const progressao = useMemo(
    () => agregarProgressaoPorExercicio(historico, exercicios),
    [historico, exercicios],
  );

  const totalTreinos = historico.length;

  if (totalTreinos === 0) {
    return (
      <div className="px-5 py-4 reveal-up">
        <EstadoVazio
          icone="grafico"
          titulo="Sem dados ainda"
          descricao="Conclua seu primeiro treino para começar a acompanhar sua progressão."
          acao={
            <button
              onClick={() => aoNavegar("treinos")}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-acento text-texto-invertido text-sm font-medium hover:bg-acento-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento transition-all duration-150"
            >
              <Icone nome="reproduzir" tamanho={16} />
              Começar a Treinar
            </button>
          }
        />
      </div>
    );
  }

  const nomeMesAtual = nomesMeses[hoje.getMonth()];

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Cards de resumo */}
      <section className="flex gap-3 reveal-up">
        <CardMetricaResumo
          rotulo={`Treinos em ${nomeMesAtual}`}
          valor={treinosNoMes}
          sufixo={treinosNoMes === 1 ? "treino" : "treinos"}
          icone={<Icone nome="halter" tamanho={14} />}
        />
        <CardMetricaResumo
          rotulo="Streak atual"
          valor={streakAtual}
          sufixo={streakAtual === 1 ? "dia" : "dias"}
          icone={<Icone nome="fogo" tamanho={14} />}
          destaque={
            recordeStreak > 0
              ? `recorde: ${recordeStreak} ${recordeStreak === 1 ? "dia" : "dias"}`
              : undefined
          }
        />
      </section>

      {/* Progressão por exercício */}
      <section>
        <div
          className="flex items-baseline justify-between mb-2.5 px-1 reveal-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-sm font-semibold text-texto-primario font-display">
            Progressão por exercício
          </h2>
          <span className="text-xs text-texto-sutil tabular-nums">
            {progressao.length} {progressao.length === 1 ? "exercício" : "exercícios"}
          </span>
        </div>

        {progressao.length > 0 ? (
          <div className="space-y-2">
            {progressao.map((item, i) => (
              <div
                key={item.exercicioId}
                className="reveal-up"
                style={{ animationDelay: `${130 + i * 55}ms` }}
              >
                <ItemProgressaoExercicio
                  progressao={item}
                  aoClicar={(exercicioId) =>
                    aoNavegar("graficoProgressao", { exercicioId })
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-texto-sutil text-center py-6">
            Nenhum exercício registrado ainda.
          </p>
        )}
      </section>
    </div>
  );
}
