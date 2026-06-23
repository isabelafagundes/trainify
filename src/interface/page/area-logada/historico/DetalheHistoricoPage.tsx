import type { Exercicio, Ficha, RegistroCardio, RegistroExercicio, RegistroSerie, RegistroTreino } from "@/domain/tipos";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";

interface DetalheHistoricoPageProps {
  registroId: string;
  fichas: Ficha[];
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
  aoVoltar: () => void;
}

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarHorario(dataISO: string) {
  return new Date(dataISO).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcularDuracaoMinutos(inicio: string, fim: string) {
  return Math.max(0, Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000));
}

function formatarCarga(carga: number) {
  return Number.isInteger(carga) ? String(carga) : carga.toFixed(1);
}

export function DetalheHistoricoPage({
  registroId,
  fichas,
  historico,
  exercicios,
  aoNavegar,
  aoVoltar,
}: DetalheHistoricoPageProps) {
  const registro = historico.find((item) => item.id === registroId);

  if (!registro) {
    return (
      <div className="px-5 py-6">
        <EstadoVazio
          icone="listaVerificacao"
          titulo="Registro não encontrado"
          descricao="Este treino pode ter sido removido do histórico."
          acao={
            <button
              type="button"
              onClick={aoVoltar}
              className="rounded-[10px] bg-acento px-4 py-2.5 text-sm font-medium text-texto-invertido"
            >
              Voltar
            </button>
          }
        />
      </div>
    );
  }

  const ficha = fichas.find((item) => item.id === registro.fichaId);
  const duracaoMinutos = calcularDuracaoMinutos(registro.iniciadoEm, registro.finalizadoEm);
  const exerciciosComSeries = registro.exercicios.filter((item) => item.series.length > 0);

  return (
    <div className="px-5 py-4">
      <header className="mb-5 rounded-[12px] border border-borda bg-superficie p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-acento-suave text-texto-secundario">
            {ficha ? (
              <IconeFicha nome={ficha.icone} emoji={ficha.emoji} tamanho={22} />
            ) : (
              <Icone nome="listaVerificacao" tamanho={22} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold leading-tight text-texto-primario">
              {ficha?.nome ?? "Ficha removida"}
            </h1>
            <p className="mt-1 text-sm capitalize text-texto-secundario">{formatarData(registro.data)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ResumoMeta rotulo="Início" valor={formatarHorario(registro.iniciadoEm)} />
          <ResumoMeta rotulo="Fim" valor={formatarHorario(registro.finalizadoEm)} />
          <ResumoMeta rotulo="Duração" valor={`${duracaoMinutos} min`} />
        </div>
      </header>

      {exerciciosComSeries.length > 0 ? (
        <div className="space-y-3">
          {exerciciosComSeries.map((registroExercicio, indice) => {
            const exercicio = exercicios.find((item) => item.id === registroExercicio.exercicioId);
            return (
              <BlocoExercicioHistorico
                key={`${registroExercicio.exercicioId}-${indice}`}
                registro={registroExercicio}
                nome={exercicio?.nome ?? "Exercício removido"}
                grupoMuscular={exercicio?.grupoMuscular}
                aoVerGrafico={() =>
                  aoNavegar("graficoProgressao", {
                    exercicioId: registroExercicio.exercicioId,
                  })
                }
              />
            );
          })}
        </div>
      ) : (
        <EstadoVazio
          icone="listaVerificacao"
          titulo="Sem séries registradas"
          descricao="Este treino foi finalizado sem séries de musculação registradas."
        />
      )}

      {registro.cardio.length > 0 ? (
        <div className="mt-4 space-y-3">
          {registro.cardio.map((cardio) => (
            <BlocoCardioHistorico key={cardio.cardioId} cardio={cardio} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ResumoMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-[8px] bg-fundo px-3 py-2">
      <p className="text-[11px] text-texto-sutil">{rotulo}</p>
      <p className="mt-1 text-sm font-semibold text-texto-primario tabular-nums">{valor}</p>
    </div>
  );
}

function BlocoExercicioHistorico({
  registro,
  nome,
  grupoMuscular,
  aoVerGrafico,
}: {
  registro: RegistroExercicio;
  nome: string;
  grupoMuscular?: string;
  aoVerGrafico: () => void;
}) {
  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-texto-primario">{nome}</h2>
          {grupoMuscular ? <p className="mt-1 text-xs text-texto-sutil">{grupoMuscular}</p> : null}
        </div>
        <button
          type="button"
          onClick={aoVerGrafico}
          className="inline-flex min-h-[36px] flex-shrink-0 items-center gap-1.5 rounded-[8px] px-2.5 text-sm text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario"
        >
          <Icone nome="tendencia" tamanho={15} />
          Ver gráfico
        </button>
      </div>

      <TabelaSeries series={registro.series} />

      {registro.nota.trim() ? (
        <p className="mt-3 rounded-[8px] bg-fundo px-3 py-2 text-sm text-texto-secundario">
          {registro.nota}
        </p>
      ) : null}
    </section>
  );
}

function TabelaSeries({ series }: { series: RegistroSerie[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-[8px] border border-borda-suave">
      <table className="w-full text-sm">
        <thead className="bg-fundo text-xs text-texto-sutil">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Série</th>
            <th className="px-3 py-2 text-right font-medium">Reps</th>
            <th className="px-3 py-2 text-right font-medium">Carga</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borda-suave">
          {series.map((serie) => (
            <tr key={serie.serie}>
              <td className="px-3 py-2 text-texto-secundario tabular-nums">{serie.serie}</td>
              <td className="px-3 py-2 text-right text-texto-primario tabular-nums">{serie.repeticoes}</td>
              <td className="px-3 py-2 text-right text-texto-primario tabular-nums">
                {serie.carga > 0 ? `${formatarCarga(serie.carga)} kg` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlocoCardioHistorico({ cardio }: { cardio: RegistroCardio }) {
  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-acento-suave text-texto-secundario">
          <Icone nome="coracao" tamanho={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold text-texto-primario">Cardio</h2>
          <p className="mt-1 text-sm text-texto-secundario">
            {cardio.tipo} · {cardio.duracaoMinutos} min
          </p>
          {cardio.nota.trim() ? (
            <p className="mt-3 rounded-[8px] bg-fundo px-3 py-2 text-sm text-texto-secundario">
              {cardio.nota}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
