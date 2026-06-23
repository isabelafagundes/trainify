import { useMemo } from "react";
import type { DadosFrequencia } from "@/domain/tipos";
import { mensagemSequencia } from "@/interface/page/area-logada/sequencia/utils";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesStripSemanal {
  dados: DadosFrequencia;
  aoAbrirDetalhe?: () => void;
}

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toISODateLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function StripSemanal({ dados, aoAbrirDetalhe }: PropriedadesStripSemanal) {
  const registrosPorData = useMemo(() => {
    const mapa = new Map<string, boolean>();
    for (const registro of dados.registros) mapa.set(registro.data, registro.completou);
    return mapa;
  }, [dados.registros]);

  const ultimosDias = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (6 - indice));
      const iso = toISODateLocal(data);
      return {
        iso,
        diaSemana: diasSemana[data.getDay()],
        dia: data.getDate(),
        treinou: registrosPorData.get(iso) ?? false,
        ehHoje: indice === 6,
      };
    });
  }, [registrosPorData]);

  const streak = useMemo(() => {
    let total = 0;
    const hoje = new Date();
    for (let indice = 0; indice < 365; indice++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - indice);
      if (registrosPorData.get(toISODateLocal(data))) total++;
      else if (indice > 0) break;
    }
    return total;
  }, [registrosPorData]);

  const treinosSemana = ultimosDias.filter((dia) => dia.treinou).length;
  const conteudo = (
    <>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${streak > 0 ? "bg-[oklch(0.88_0.05_45)]" : "bg-superficie-suave/80"}`}>
          <Icone nome="fogo" tamanho={22} className={streak > 0 ? "text-[oklch(0.45_0.16_40)] animate-flame" : "text-texto-secundario"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-texto-primario font-display leading-none">{streak}</span>
            <span className="text-sm text-texto-secundario font-medium leading-none">
              {streak === 1 ? "dia de sequência" : "dias de sequência"}
            </span>
          </div>
          <p className="text-sm text-texto-secundario mt-1">
            {mensagemSequencia(streak)} · {treinosSemana}/7 esta semana
          </p>
        </div>
        {aoAbrirDetalhe && (
          <span className="flex-shrink-0 text-texto-sutil" aria-hidden="true">
            <Icone nome="setaDireita" tamanho={18} />
          </span>
        )}
      </div>
      <div className="border-t border-borda-suave" />
      <div className="flex">
        {ultimosDias.map((dia) => (
          <div key={dia.iso} className="flex-1 flex flex-col items-center gap-2 group">
            <span className={`text-sm font-semibold leading-none transition-colors duration-200 ${dia.ehHoje ? "text-texto-primario" : "text-texto-secundario group-hover:text-texto-primario"}`}>
              {dia.diaSemana}
            </span>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-all duration-200 ${dia.treinou ? "bg-acento text-texto-invertido" : dia.ehHoje ? "bg-transparent ring-2 ring-inset ring-acento/40 text-texto-primario" : "bg-superficie-suave/60 text-texto-secundario group-hover:bg-superficie-suave group-hover:text-texto-primario"}`}>
              {dia.dia}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return aoAbrirDetalhe ? (
    <button type="button" onClick={aoAbrirDetalhe} aria-label="Ver detalhes da sequência" className="w-full bg-superficie rounded-2xl px-5 py-5 space-y-4 shadow-sm text-left transition-colors duration-200 hover:bg-superficie-suave active:bg-superficie-suave/70 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acento">
      {conteudo}
    </button>
  ) : (
    <div className="bg-superficie rounded-2xl px-5 py-5 space-y-4 shadow-sm">{conteudo}</div>
  );
}
