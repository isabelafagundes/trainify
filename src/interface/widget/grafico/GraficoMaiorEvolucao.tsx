import { useMemo } from "react";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { calcularMaiorEvolucaoCarga } from "@/interface/page/area-logada/estatisticas/utils";
import { formatarNumeroBR } from "@/interface/util/numero";
import { Icone } from "@/interface/widget/svg/Icone";
import { BadgeTendencia, GraficoBarras, type PontoBarra } from "./GraficoBarras";

interface PropriedadesGraficoMaiorEvolucao {
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  /** abre o gráfico completo do exercício em destaque */
  aoVerExercicio?: (exercicioId: string) => void;
  altura?: number;
}

function formatarDataCurta(dataISO: string): string {
  return new Date(dataISO).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/**
 * Gráfico fixo "maior evolução de carga": destaca o exercício que mais ganhou
 * carga nas últimas sessões, com a série de maior carga por treino. Usado na
 * home (desktop) e nas Estatísticas.
 */
export function GraficoMaiorEvolucao({
  historico,
  exercicios,
  aoVerExercicio,
  altura,
}: PropriedadesGraficoMaiorEvolucao) {
  const evolucao = useMemo(
    () => calcularMaiorEvolucaoCarga(historico, exercicios),
    [historico, exercicios],
  );

  if (!evolucao) {
    return (
      <section className="rounded-[12px] border border-borda bg-superficie p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-texto-primario">
            Maior evolução de carga
          </h2>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
            <Icone nome="tendencia" tamanho={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-texto-primario">Sua evolução aparece aqui</p>
            <p className="mt-1 text-sm text-texto-sutil">
              Treine um exercício com carga em pelo menos 2 sessões para ver seu maior ganho.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const pontos: PontoBarra[] = evolucao.pontos.map((p) => ({
    rotulo: formatarDataCurta(p.data),
    valor: p.maiorCarga,
    titulo: `${formatarNumeroBR(p.maiorCarga, 1)} kg`,
  }));

  const clicavel = !!aoVerExercicio;
  const Componente = clicavel ? "button" : "div";

  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <Componente
        type={clicavel ? "button" : undefined}
        onClick={clicavel ? () => aoVerExercicio!(evolucao.exercicioId) : undefined}
        className={`flex w-full items-start justify-between gap-3 text-left ${
          clicavel
            ? "cursor-pointer rounded-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
            : ""
        }`}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-texto-sutil">
            Maior evolução de carga
          </p>
          <h2 className="mt-1 truncate font-display text-base font-semibold text-texto-primario">
            {evolucao.nome}
          </h2>
          <p className="mt-0.5 text-xs text-texto-sutil">
            {evolucao.grupoMuscular} · maior carga por treino
          </p>
        </div>
        <BadgeTendencia
          texto={`+${formatarNumeroBR(evolucao.delta, 1)} kg`}
          positivo
        />
      </Componente>

      <div className="mt-4">
        <GraficoBarras pontos={pontos} altura={altura} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-texto-sutil">
        <span className="tabular-nums">
          {formatarNumeroBR(evolucao.cargaInicial, 1)} kg → {" "}
          <span className="font-semibold text-texto-secundario">
            {formatarNumeroBR(evolucao.cargaAtual, 1)} kg
          </span>
        </span>
        <span className="tabular-nums">{evolucao.pontos.length} sessões</span>
      </div>
    </section>
  );
}
