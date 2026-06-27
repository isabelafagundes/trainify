import { useMemo } from "react";
import {
  META_METRICA_CARDIO,
  resolverTipoCardio,
  type ChaveMetricaCardio,
  type Exercicio,
  type RegistroCardio,
  type RegistroTreino,
} from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";
import { decodificarIdGraficoCardio } from "./cardioGraficoId";

interface GraficoProgressaoProps {
  exercicioId: string;
  exercicios: Exercicio[];
  historico: RegistroTreino[];
}

interface OverlayGraficoProgressaoProps extends GraficoProgressaoProps {
  aberto: boolean;
  aoFechar: () => void;
}

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarCarga(valor: number) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

function formatarNumero(valor: number, casasDecimais = 1) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(casasDecimais);
}

function formatarRitmo(segundos: number) {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const restoSegundos = String(total % 60).padStart(2, "0");
  return `${minutos}:${restoSegundos}`;
}

function obterValorCardio(cardio: RegistroCardio, metrica: ChaveMetricaCardio): number | null {
  const valor = cardio[metrica];
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

function formatarValorCardio(metrica: ChaveMetricaCardio, valor: number) {
  const meta = META_METRICA_CARDIO[metrica];
  if (metrica === "ritmo500m") return `${formatarRitmo(valor)}${meta.unidade}`;
  if (metrica === "distanciaKm") return `${formatarNumero(valor, 2)} ${meta.unidade}`;
  if (meta.unidade) return `${formatarNumero(valor)} ${meta.unidade}`;
  return formatarNumero(valor);
}

function formatarVariacaoCardio(metrica: ChaveMetricaCardio, valor: number) {
  const sinal = valor > 0 ? "+" : valor < 0 ? "-" : "";
  return `${sinal}${formatarValorCardio(metrica, Math.abs(valor))}`;
}

export function GraficoProgressao({
  exercicioId,
  exercicios,
  historico,
}: GraficoProgressaoProps) {
  const graficoCardio = decodificarIdGraficoCardio(exercicioId);

  if (graficoCardio) {
    return (
      <GraficoProgressaoCardio
        tipo={graficoCardio.tipo}
        metrica={graficoCardio.metrica}
        historico={historico}
      />
    );
  }

  return <GraficoProgressaoExercicio exercicioId={exercicioId} exercicios={exercicios} historico={historico} />;
}

function GraficoProgressaoExercicio({
  exercicioId,
  exercicios,
  historico,
}: GraficoProgressaoProps) {
  const exercicio = exercicios.find((item) => item.id === exercicioId);
  const pontos = useMemo(
    () =>
      historico
        .map((registro) => {
          const registroExercicio = registro.exercicios.find((item) => item.exercicioId === exercicioId);
          if (!registroExercicio || registroExercicio.series.length === 0) return null;

          const maiorCarga = Math.max(...registroExercicio.series.map((serie) => serie.carga || 0));
          const volume = registroExercicio.series.reduce(
            (total, serie) => total + serie.repeticoes * (serie.carga || 0),
            0
          );

          return {
            id: registro.id,
            data: registro.iniciadoEm,
            maiorCarga,
            volume,
            series: registroExercicio.series.length,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(-8),
    [exercicioId, historico]
  );

  const maiorCargaGeral = Math.max(1, ...pontos.map((ponto) => ponto.maiorCarga));
  const ultimo = pontos[pontos.length - 1];
  const anterior = pontos[pontos.length - 2];
  const variacao = ultimo && anterior ? ultimo.maiorCarga - anterior.maiorCarga : 0;

  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-texto-primario">
            {exercicio?.nome ?? "Exercício removido"}
          </h2>
          <p className="mt-1 text-sm text-texto-secundario">
            {exercicio?.grupoMuscular ?? "Histórico"} · maior carga por treino
          </p>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-acento-suave text-texto-secundario">
          <Icone nome="tendencia" tamanho={18} />
        </div>
      </div>

      {pontos.length >= 2 ? (
        <>
          <div className="mt-5 flex h-44 items-end justify-center gap-3 rounded-[10px] bg-fundo px-3 pb-3 pt-4">
            {pontos.map((ponto, indice) => {
              const altura = Math.max(12, (ponto.maiorCarga / maiorCargaGeral) * 100);
              const ehUltimo = indice === pontos.length - 1;
              return (
                <div key={ponto.id} className="flex h-full w-10 flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end justify-center">
                    <div
                      className={`w-full rounded-t-[6px] bg-gradient-to-t transition-all ${
                        ehUltimo
                          ? "from-grafico-forte to-grafico shadow-sm"
                          : "from-grafico/70 to-grafico/45"
                      }`}
                      style={{ height: `${altura}%` }}
                      title={`${formatarCarga(ponto.maiorCarga)} kg`}
                    />
                  </div>
                  <span
                    className={`truncate text-center text-[11px] tabular-nums ${
                      ehUltimo ? "font-semibold text-texto-secundario" : "text-texto-sutil"
                    }`}
                  >
                    {formatarData(ponto.data)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ResumoGrafico rotulo="Última carga" valor={`${formatarCarga(ultimo.maiorCarga)} kg`} />
            <ResumoGrafico
              rotulo="Variação"
              valor={`${variacao > 0 ? "+" : ""}${formatarCarga(variacao)} kg`}
            />
            <ResumoGrafico rotulo="Volume" valor={`${Math.round(ultimo.volume)} kg`} />
          </div>
        </>
      ) : pontos.length === 1 ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
            <Icone nome="tendencia" tamanho={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-texto-primario">
              Só falta treinar mais uma vez
            </p>
            <p className="mt-1 text-sm text-texto-sutil">
              Registre este exercício em pelo menos 2 treinos para ver a evolução da carga aqui.
            </p>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-texto-sutil">
            <span className="rounded-full bg-superficie px-3 py-1 tabular-nums">
              1ª sessão · {formatarData(ultimo.data)}
            </span>
            <span className="rounded-full bg-superficie px-3 py-1 tabular-nums">
              {formatarCarga(ultimo.maiorCarga)} kg
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
            <Icone nome="grafico" tamanho={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-texto-primario">
              Nenhum treino registrado ainda
            </p>
            <p className="mt-1 text-sm text-texto-sutil">
              Conclua este exercício em um treino para começar a acompanhar sua progressão.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function GraficoProgressaoCardio({
  tipo,
  metrica,
  historico,
}: {
  tipo: string;
  metrica: ChaveMetricaCardio;
  historico: RegistroTreino[];
}) {
  const tipoCardio = resolverTipoCardio(tipo);
  const meta = META_METRICA_CARDIO[metrica];
  const pontos = useMemo(
    () =>
      historico
        .map((registro) => {
          const valores = registro.cardio
            .filter((cardio) => cardio.tipo === tipo)
            .map((cardio) => obterValorCardio(cardio, metrica))
            .filter((valor): valor is number => valor !== null);

          if (valores.length === 0) return null;

          return {
            id: registro.id,
            data: registro.iniciadoEm,
            valor: valores.reduce((total, valor) => total + valor, 0),
            entradas: valores.length,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(-8),
    [historico, metrica, tipo]
  );

  const maiorValorGeral = Math.max(1, ...pontos.map((ponto) => ponto.valor));
  const ultimo = pontos[pontos.length - 1];
  const anterior = pontos[pontos.length - 2];
  const variacao = ultimo && anterior ? ultimo.valor - anterior.valor : 0;

  return (
    <section className="rounded-[12px] border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-texto-primario">
            {tipoCardio.emoji ? `${tipoCardio.emoji} ` : ""}
            {tipoCardio.nome}
          </h2>
          <p className="mt-1 text-sm text-texto-secundario">{meta.rotulo} por treino</p>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-acento-suave text-texto-secundario">
          <Icone nome="tendencia" tamanho={18} />
        </div>
      </div>

      {pontos.length >= 2 ? (
        <>
          <div className="mt-5 flex h-44 items-end justify-center gap-3 rounded-[10px] bg-fundo px-3 pb-3 pt-4">
            {pontos.map((ponto, indice) => {
              const altura = Math.max(12, (ponto.valor / maiorValorGeral) * 100);
              const ehUltimo = indice === pontos.length - 1;
              return (
                <div key={ponto.id} className="flex h-full w-10 flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end justify-center">
                    <div
                      className={`w-full rounded-t-[6px] bg-gradient-to-t transition-all ${
                        ehUltimo
                          ? "from-grafico-forte to-grafico shadow-sm"
                          : "from-grafico/70 to-grafico/45"
                      }`}
                      style={{ height: `${altura}%` }}
                      title={formatarValorCardio(metrica, ponto.valor)}
                    />
                  </div>
                  <span
                    className={`truncate text-center text-[11px] tabular-nums ${
                      ehUltimo ? "font-semibold text-texto-secundario" : "text-texto-sutil"
                    }`}
                  >
                    {formatarData(ponto.data)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ResumoGrafico
              rotulo={`Última ${meta.rotulo.toLowerCase()}`}
              valor={formatarValorCardio(metrica, ultimo.valor)}
            />
            <ResumoGrafico
              rotulo="Variação"
              valor={formatarVariacaoCardio(metrica, variacao)}
            />
            <ResumoGrafico rotulo="Registros" valor={`${ultimo.entradas}`} />
          </div>
        </>
      ) : pontos.length === 1 ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
            <Icone nome="tendencia" tamanho={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-texto-primario">
              Só falta registrar mais uma vez
            </p>
            <p className="mt-1 text-sm text-texto-sutil">
              Registre este cardio em pelo menos 2 treinos para ver a evolução aqui.
            </p>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-texto-sutil">
            <span className="rounded-full bg-superficie px-3 py-1 tabular-nums">
              1ª sessão · {formatarData(ultimo.data)}
            </span>
            <span className="rounded-full bg-superficie px-3 py-1 tabular-nums">
              {formatarValorCardio(metrica, ultimo.valor)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-[10px] bg-fundo px-4 py-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-texto-secundario">
            <Icone nome="grafico" tamanho={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-texto-primario">
              Nenhum cardio registrado ainda
            </p>
            <p className="mt-1 text-sm text-texto-sutil">
              Conclua este cardio em um treino para começar a acompanhar sua progressão.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ResumoGrafico({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-[8px] bg-fundo px-3 py-2">
      <p className="text-[11px] text-texto-sutil">{rotulo}</p>
      <p className="mt-1 text-sm font-semibold text-texto-primario tabular-nums">{valor}</p>
    </div>
  );
}

export function OverlayGraficoProgressao({
  aberto,
  aoFechar,
  exercicioId,
  exercicios,
  historico,
}: OverlayGraficoProgressaoProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 md:items-center" onClick={aoFechar}>
      <div
        className="w-full max-w-[480px] rounded-t-[16px] border border-borda bg-superficie px-4 pb-[calc(var(--safe-bottom)+20px)] pt-4 shadow-xl md:rounded-2xl md:pb-5"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-borda md:hidden" />
        <GraficoProgressao exercicioId={exercicioId} exercicios={exercicios} historico={historico} />
      </div>
    </div>
  );
}
