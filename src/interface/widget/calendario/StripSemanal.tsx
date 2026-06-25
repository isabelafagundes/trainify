import { useMemo } from "react";
import type { DadosFrequencia } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesStripSemanal {
  dados: DadosFrequencia;
  aoAbrirDetalhe?: () => void;
}

function toISODateLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Resumo sutil da sequência na home — uma única linha.
 * O calendário completo (7 dias, mês) vive na tela de detalhe,
 * aberta pelo tap; aqui mostramos só a essência: streak e semana.
 */
export function StripSemanal({ dados, aoAbrirDetalhe }: PropriedadesStripSemanal) {
  const registrosPorData = useMemo(() => {
    const mapa = new Map<string, boolean>();
    for (const registro of dados.registros) mapa.set(registro.data, registro.completou);
    return mapa;
  }, [dados.registros]);

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

  const treinosSemana = useMemo(() => {
    let total = 0;
    const hoje = new Date();
    for (let indice = 0; indice < 7; indice++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - indice);
      if (registrosPorData.get(toISODateLocal(data))) total++;
    }
    return total;
  }, [registrosPorData]);

  const temStreak = streak > 0;

  const conteudo = (
    <>
      <span
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
          temStreak ? "bg-[oklch(0.88_0.05_45)]" : "bg-superficie-suave/80"
        }`}
      >
        <Icone
          nome="fogo"
          tamanho={16}
          className={temStreak ? "text-[oklch(0.45_0.16_40)] animate-flame" : "text-texto-sutil"}
        />
      </span>

      <p className="flex-1 min-w-0 truncate text-sm text-texto-secundario">
        {temStreak ? (
          <>
            <span className="font-bold tabular-nums text-texto-primario">{streak}</span>{" "}
            {streak === 1 ? "dia" : "dias"} de sequência
          </>
        ) : (
          "Comece sua sequência hoje"
        )}
        <span className="text-texto-sutil"> · {treinosSemana}/7 esta semana</span>
      </p>

      {aoAbrirDetalhe && (
        <span className="flex-shrink-0 text-texto-sutil" aria-hidden="true">
          <Icone nome="setaDireita" tamanho={18} />
        </span>
      )}
    </>
  );

  const classeBase =
    "w-full bg-superficie rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3";

  return aoAbrirDetalhe ? (
    <button
      type="button"
      onClick={aoAbrirDetalhe}
      aria-label="Ver detalhes da sequência"
      className={`${classeBase} text-left transition-colors duration-200 hover:bg-superficie-suave active:bg-superficie-suave/70 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acento`}
    >
      {conteudo}
    </button>
  ) : (
    <div className={classeBase}>{conteudo}</div>
  );
}
