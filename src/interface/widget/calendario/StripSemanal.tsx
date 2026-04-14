import { useMemo } from "react";
import type { DadosFrequencia } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesStripSemanal {
  dados: DadosFrequencia;
}

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function StripSemanal({ dados }: PropriedadesStripSemanal) {
  const registrosPorData = useMemo(() => {
    const mapa = new Map<string, boolean>();
    for (const r of dados.registros) {
      mapa.set(r.data, r.completou);
    }
    return mapa;
  }, [dados.registros]);

  // Últimos 7 dias
  const ultimosDias = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().split("T")[0];
      return {
        iso,
        diaSemana: diasSemana[d.getDay()],
        dia: d.getDate(),
        treinou: registrosPorData.get(iso) ?? false,
        ehHoje: i === 6,
      };
    });
  }, [registrosPorData]);

  // Streak atual
  const streak = useMemo(() => {
    let count = 0;
    const hoje = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      if (registrosPorData.get(iso)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [registrosPorData]);

  // Treinos completados na semana
  const treinosSemana = ultimosDias.filter((d) => d.treinou).length;

  // Mensagem baseada na sequência
  const mensagemSequencia = streak === 0
    ? "Comece sua sequência hoje"
    : streak < 3
      ? "Sequência começando..."
      : streak < 7
        ? "Mandando bem!"
        : streak < 14
          ? "Semana completa!"
          : streak < 30
            ? "Imparável!"
            : "Lendário!";

  return (
    <div className="bg-superficie rounded-2xl px-5 py-5 space-y-4 fade-in shadow-sm">
      {/* Sequência */}
      <div className="flex items-center gap-3">
        <div className={`
          flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
          ${streak > 0 ? "bg-[oklch(0.88_0.05_45)]" : "bg-superficie-suave/80"}
        `}>
          <Icone
            nome="fogo"
            tamanho={22}
            className={`${streak > 0 ? "text-[oklch(0.45_0.16_40)] animate-flame" : "text-texto-secundario"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-texto-primario font-display leading-none transition-all duration-300">
              {streak}
            </span>
            <span className="text-sm text-texto-secundario font-medium leading-none">
              {streak === 1 ? "dia de sequência" : "dias de sequência"}
            </span>
          </div>
          <p className="text-sm text-texto-secundario mt-1">
            {mensagemSequencia} · {treinosSemana}/7 esta semana
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-borda-suave" />

      {/* Strip de dias */}
      <div className="flex">
        {ultimosDias.map((d) => (
          <div
            key={d.iso}
            className="flex-1 flex flex-col items-center gap-2 group"
          >
            <span className={`text-sm font-semibold leading-none transition-colors duration-200 ${d.ehHoje ? "text-texto-primario" : "text-texto-secundario group-hover:text-texto-primario"}`}>
              {d.diaSemana}
            </span>
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center
                text-sm font-bold tabular-nums transition-all duration-200
                ${d.treinou
                  ? "bg-acento text-texto-invertido"
                  : d.ehHoje
                    ? "bg-transparent ring-2 ring-inset ring-acento/40 text-texto-primario"
                    : "bg-superficie-suave/60 text-texto-secundario group-hover:bg-superficie-suave group-hover:text-texto-primario"
                }
              `}
            >
              {d.dia}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
