import { useMemo } from "react";
import type {
  RegistroCardio,
  RegistroTreino,
  TipoCardioDef,
} from "@/domain/tipos";
import { resolverTipoCardio } from "@/domain/tipos";

interface HistoricoCardioProps {
  historico: RegistroTreino[];
  tiposCardio: TipoCardioDef[];
}

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarValor(valor: number): string {
  return String(Math.round(valor * 100) / 100).replace(".", ",");
}

function resumirCardio(item: RegistroCardio, nomeTipo: string): string {
  const partes: string[] = [];
  if (item.duracaoMinutos) partes.push(`${item.duracaoMinutos} min`);
  if (item.distanciaKm) {
    partes.push(
      nomeTipo === "Remo"
        ? `${formatarValor(item.distanciaKm * 1000)} m`
        : `${formatarValor(item.distanciaKm)} km`
    );
  } else if (item.niveis) {
    partes.push(`${item.niveis} andares`);
  } else if (item.pulos) {
    partes.push(`${item.pulos} pulos`);
  }
  return partes.join(" · ") || "—";
}

export function HistoricoCardio({
  historico,
  tiposCardio,
}: HistoricoCardioProps) {
  const ultimas = useMemo(
    () =>
      historico.filter((registro) => registro.cardio.length > 0).slice(0, 5),
    [historico]
  );

  return (
    <section className="rounded-[8px] border border-borda-suave bg-superficie px-3 py-3">
      <h2 className="px-1 text-sm font-medium text-texto-secundario">
        Últimas sessões
      </h2>

      {ultimas.length > 0 ? (
        <div className="mt-3 space-y-2">
          {ultimas.map((registro) => (
            <div
              key={registro.id}
              className="rounded-[8px] bg-fundo px-3 py-2 text-sm"
            >
              <span className="text-xs text-texto-sutil">
                {formatarData(registro.iniciadoEm)}
              </span>
              <div className="mt-1 space-y-1">
                {registro.cardio.map((item) => {
                  const tipo = resolverTipoCardio(item.tipo, tiposCardio);
                  return (
                    <div
                      key={item.cardioId}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="truncate text-texto-secundario">
                        {tipo.emoji ? `${tipo.emoji} ` : ""}
                        {tipo.nome}
                      </span>
                      <span className="whitespace-nowrap tabular-nums text-texto-primario">
                        {resumirCardio(item, tipo.nome)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-[8px] bg-fundo px-3 py-3 text-sm text-texto-sutil">
          Suas sessões de cardio aparecerão aqui após o primeiro treino
          finalizado.
        </p>
      )}
    </section>
  );
}
