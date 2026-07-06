import { useMemo } from "react";
import type { RegistroTreino } from "@/domain/tipos";
import {
  calcularRecordeStreak,
  calcularStreakAtual,
  calcularTreinosNoMes,
} from "@/interface/page/area-logada/estatisticas/utils";
import { Icone } from "@/interface/widget/svg/Icone";
import { construirDiasSequencia, mensagemSequencia, obterProximoMarcoSequencia } from "./utils";

interface PropriedadesDetalheSequenciaPage {
  historico: RegistroTreino[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

function rotuloData(iso: string, ehHoje: boolean, indice: number): string {
  if (ehHoje) return "Hoje";
  if (indice === 12) return "Ontem";
  const [, mes, dia] = iso.split("-").map(Number);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${dia} ${meses[mes - 1]}`;
}

export function DetalheSequenciaPage({ historico, aoNavegar }: PropriedadesDetalheSequenciaPage) {
  const hoje = useMemo(() => new Date(), []);
  const dados = useMemo(() => {
    const dias = construirDiasSequencia(historico, 14, hoje);
    const ultimosSete = dias.slice(-7);
    const streak = calcularStreakAtual(historico, hoje);
    return {
      dias,
      ultimosSete,
      streak,
      marco: obterProximoMarcoSequencia(streak),
      recorde: calcularRecordeStreak(historico),
      treinosMes: calcularTreinosNoMes(historico, hoje),
      treinosSemana: ultimosSete.filter((dia) => dia.treinou).length,
    };
  }, [historico, hoje]);

  const treinouHoje = dados.ultimosSete.at(-1)?.treinou ?? false;
  const treinouOntem = dados.ultimosSete.at(-2)?.treinou ?? false;
  const status = treinouHoje
    ? "Sequência protegida hoje."
    : dados.streak > 0 && treinouOntem
      ? "Treine hoje para manter a sequência."
      : dados.streak === 0 && historico.length > 0
        ? "Hoje é um bom dia para recomeçar."
        : mensagemSequencia(dados.streak);

  const metricas = [
    ["Atual", dados.streak],
    ["Recorde", dados.recorde],
    ["No mês", dados.treinosMes],
    ["Na semana", dados.treinosSemana],
  ] as const;

  return (
    <div className="px-4 py-4 space-y-5">
      <section className="rounded-2xl bg-superficie border border-borda px-5 py-6 text-center reveal-up">
        <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${dados.streak > 0 ? "bg-[oklch(0.88_0.05_45)] text-[oklch(0.45_0.16_40)]" : "bg-superficie-suave text-texto-secundario"}`}>
          <Icone nome="fogo" tamanho={25} />
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <strong className="font-display text-5xl leading-none tabular-nums text-texto-primario">{dados.streak}</strong>
          <span className="text-base font-medium text-texto-secundario">{dados.streak === 1 ? "dia" : "dias"}</span>
        </div>
        <p className="mt-3 text-sm text-texto-secundario">{status}</p>
        {historico.length === 0 && (
          <button type="button" onClick={() => aoNavegar("treinos")} className="mt-5 min-h-[44px] rounded-[10px] bg-acento px-5 py-2.5 text-sm font-semibold text-texto-invertido transition-all hover:bg-acento-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento">
            Iniciar treino
          </button>
        )}
      </section>

      <section className="rounded-2xl bg-superficie border border-borda px-5 py-5 reveal-up" style={{ animationDelay: "60ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-texto-primario">Próximo marco</h2>
          <span className="text-xs font-medium text-texto-secundario">{dados.marco.proximoMarco} dias</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-superficie-suave">
          <div className="h-full rounded-full bg-acento transition-[width] duration-500" style={{ width: `${dados.marco.progresso * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-texto-sutil">
          {dados.marco.diasRestantes === 1 ? "Falta 1 dia" : `Faltam ${dados.marco.diasRestantes} dias`} para alcançar o próximo marco.
        </p>
      </section>

      <section className="reveal-up" style={{ animationDelay: "120ms" }}>
        <h2 className="mb-2.5 px-1 font-display text-sm font-semibold text-texto-primario">Últimos 7 dias</h2>
        <div className="flex rounded-2xl bg-superficie border border-borda px-3 py-5">
          {dados.ultimosSete.map((dia) => (
            <div key={dia.iso} className="flex flex-1 flex-col items-center gap-2">
              <span className={`text-xs font-semibold ${dia.ehHoje ? "text-texto-primario" : "text-texto-secundario"}`}>{dia.diaSemana}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums ${dia.treinou ? "bg-acento text-texto-invertido" : dia.ehHoje ? "ring-2 ring-inset ring-acento/40 text-texto-primario" : "bg-superficie-suave/60 text-texto-secundario"}`}>{dia.diaMes}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${dia.treinou ? "bg-acento" : "bg-borda-suave"}`} aria-label={dia.treinou ? "Treinou" : "Sem treino"} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 reveal-up" style={{ animationDelay: "180ms" }}>
        {metricas.map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-2xl bg-superficie border border-borda px-4 py-4">
            <strong className="font-display text-2xl tabular-nums text-texto-primario">{valor}</strong>
            <p className="mt-1 text-xs text-texto-secundario">{rotulo}</p>
          </div>
        ))}
      </section>

      <section className="reveal-up" style={{ animationDelay: "240ms" }}>
        <h2 className="mb-2.5 px-1 font-display text-sm font-semibold text-texto-primario">Histórico recente</h2>
        <div className="overflow-hidden rounded-2xl bg-superficie border border-borda divide-y divide-borda-suave">
          {[...dados.dias].reverse().map((dia, indice) => (
            <div key={dia.iso} className="flex min-h-[48px] items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-medium text-texto-primario">{rotuloData(dia.iso, dia.ehHoje, 13 - indice)}</span>
              <span className={`text-xs font-semibold ${dia.treinou ? "text-acento" : "text-texto-sutil"}`}>{dia.treinou ? "Treinou" : "Sem treino"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
