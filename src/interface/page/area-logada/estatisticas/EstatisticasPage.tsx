import { useMemo } from "react";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { Icone } from "@/interface/widget/svg/Icone";
import { formatarNumeroBR } from "@/interface/util/numero";
import { CardMetricaResumo } from "./CardMetricaResumo";
import { ItemProgressaoExercicio } from "./ItemProgressaoExercicio";
import {
  agregarProgressaoPorCardio,
  calcularResumoCardio,
  type ProgressaoCardio,
} from "./cardioUtils";
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
  const resumoCardio = useMemo(
    () => calcularResumoCardio(historico),
    [historico],
  );
  const progressaoCardio = useMemo(
    () => agregarProgressaoPorCardio(historico),
    [historico],
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
      <section className="grid grid-cols-2 gap-3 reveal-up md:grid-cols-4">
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
        {resumoCardio.totalSessoes > 0 ? (
          <>
            <CardMetricaResumo
              rotulo="Cardio total"
              valor={Math.round(resumoCardio.totalMinutos)}
              sufixo="min"
              icone={<Icone nome="coracao" tamanho={14} />}
              destaque={`${resumoCardio.totalSessoes} ${
                resumoCardio.totalSessoes === 1 ? "registro" : "registros"
              }`}
            />
            <CardMetricaResumo
              rotulo="Distância"
              valor={formatarNumeroBR(resumoCardio.totalKm, 1)}
              sufixo="km"
              icone={<Icone nome="corrida" tamanho={14} />}
            />
          </>
        ) : null}
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
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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

      {progressaoCardio.length > 0 ? (
        <section>
          <div
            className="mb-2.5 flex items-baseline justify-between px-1 reveal-up"
            style={{ animationDelay: "120ms" }}
          >
            <h2 className="font-display text-sm font-semibold text-texto-primario">
              Progressão de cardio
            </h2>
            <span className="text-xs text-texto-sutil tabular-nums">
              {progressaoCardio.length} {progressaoCardio.length === 1 ? "métrica" : "métricas"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {progressaoCardio.map((item, i) => (
              <button
                key={item.idGrafico}
                type="button"
                onClick={() => aoNavegar("graficoProgressao", { exercicioId: item.idGrafico })}
                className="flex min-h-[72px] items-center gap-3 rounded-[12px] border border-borda bg-superficie px-4 py-3 text-left transition-colors hover:bg-superficie-hover reveal-up"
                style={{ animationDelay: `${170 + i * 55}ms` }}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-acento-suave text-lg">
                  {item.emoji || <Icone nome="coracao" tamanho={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-texto-primario">
                    {item.nome}
                  </span>
                  <span className="mt-1 block truncate text-xs text-texto-sutil">
                    {item.rotuloMetrica} · {item.totalSessoes}{" "}
                    {item.totalSessoes === 1 ? "sessão" : "sessões"}
                  </span>
                </span>
                <span className="text-right text-xs text-texto-sutil">
                  <span className="block font-semibold text-texto-secundario">
                    {formatarValorCardio(item)}
                  </span>
                  <span className="block">último</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function formatarRitmo(segundos: number) {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const restoSegundos = String(total % 60).padStart(2, "0");
  return `${minutos}:${restoSegundos}`;
}

function formatarValorCardio(item: ProgressaoCardio) {
  if (item.metrica === "ritmo500m") return `${formatarRitmo(item.ultimoValor)}/500m`;
  if (item.metrica === "distanciaKm") return `${formatarNumeroBR(item.ultimoValor, 2)} km`;
  return formatarNumeroBR(item.ultimoValor);
}
