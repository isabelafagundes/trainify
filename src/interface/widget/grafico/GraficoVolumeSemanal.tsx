import { useMemo } from "react";
import type { RegistroTreino } from "@/domain/tipos";
import { calcularVolumeSemanal } from "@/interface/page/area-logada/estatisticas/utils";
import { formatarNumeroBR } from "@/interface/util/numero";
import { DicaInfo } from "@/interface/widget/dica/DicaInfo";
import { Icone } from "@/interface/widget/svg/Icone";
import { BadgeTendencia, GraficoBarras, type PontoBarra } from "./GraficoBarras";

interface PropriedadesGraficoVolumeSemanal {
  historico: RegistroTreino[];
  /** nº de semanas na janela (default 8) */
  semanas?: number;
  /** altura da área de barras */
  altura?: number;
}

/** Volume em kg, sem separador de milhar (convenção do app): "10800 kg". */
function formatarVolume(kg: number): string {
  return `${formatarNumeroBR(Math.round(kg))} kg`;
}

function rotuloSemana(inicioISO: string): string {
  const [ano, mes, dia] = inicioISO.split("-");
  void ano;
  return `${dia}/${mes}`;
}

/**
 * Gráfico fixo de volume semanal (Σ repetições × carga por semana), com a
 * variação sobre a semana anterior. Usado na home (desktop) e nas Estatísticas.
 */
export function GraficoVolumeSemanal({
  historico,
  semanas = 8,
  altura,
}: PropriedadesGraficoVolumeSemanal) {
  const resumo = useMemo(
    () => calcularVolumeSemanal(historico, semanas),
    [historico, semanas],
  );

  const temDado = resumo.semanas.some((s) => s.volume > 0);
  const pontos: PontoBarra[] = resumo.semanas.map((s) => ({
    rotulo: rotuloSemana(s.inicioISO),
    valor: s.volume,
    titulo: formatarVolume(s.volume),
  }));

  const delta = resumo.deltaPct;
  const badge =
    delta === null
      ? null
      : {
          texto: `${delta >= 0 ? "+" : "−"}${formatarNumeroBR(Math.abs(delta), 0)}%`,
          positivo: delta >= 0,
        };

  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-display text-sm font-semibold text-texto-primario">
              Volume semanal
            </h2>
            <DicaInfo rotulo="Como o volume é calculado">
              O volume é a <b className="font-semibold text-texto-primario">carga total movimentada</b> na
              semana: a soma de <b className="font-semibold text-texto-primario">repetições × peso</b> de
              todas as séries de todos os treinos.
              <span className="mt-2 block text-texto-sutil">
                Ex.: agachamento 80 kg × 8 reps × 3 séries = 1920 kg.
              </span>
            </DicaInfo>
          </div>
          <p className="mt-1 flex items-baseline gap-1.5 text-texto-secundario">
            <span className="font-display text-xl font-bold tabular-nums text-texto-primario">
              {formatarVolume(resumo.volumeAtual)}
            </span>
            <span className="text-xs">esta semana</span>
          </p>
        </div>
        {badge && <BadgeTendencia texto={badge.texto} positivo={badge.positivo} />}
      </div>

      {temDado ? (
        <div className="mt-4">
          <GraficoBarras pontos={pontos} altura={altura} />
        </div>
      ) : (
        <EstadoVazioGrafico
          titulo="Sem volume ainda"
          descricao="Registre treinos com carga para acompanhar seu volume semanal aqui."
        />
      )}
    </section>
  );
}

function EstadoVazioGrafico({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
        <Icone nome="grafico" tamanho={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-texto-primario">{titulo}</p>
        <p className="mt-1 text-sm text-texto-sutil">{descricao}</p>
      </div>
    </div>
  );
}
