import { useState } from "react";
import type {
  ChaveMetricaCardio,
  RegistroCardio,
  TipoCardioBuiltin,
  TipoCardioDef,
} from "@/domain/tipos";
import { CAMPOS_CARDIO, META_METRICA_CARDIO, resolverTipoCardio } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";

type AtualizacaoCardio = Partial<Pick<RegistroCardio, ChaveMetricaCardio | "nota">>;

interface PainelCardioProps {
  cardio: RegistroCardio[];
  tiposCardio: TipoCardioDef[];
  cardioConcluido: Set<string>;
  aoAtualizarCardio: (id: string, atualizacao: AtualizacaoCardio) => void;
  aoConcluirCardio: (id: string) => void;
  exibirVoltarMusculacao: boolean;
  aoVoltarMusculacao: () => void;
  aoFinalizar: () => void;
}

function formatarRitmo(segundos: number | undefined): string {
  if (!segundos) return "";
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

function parseRitmo(texto: string): number | undefined {
  const normalizado = texto.trim();
  if (!normalizado) return undefined;
  const [minutos, segundos = "0"] = normalizado.split(":");
  const total = Number(minutos) * 60 + Number(segundos);
  return Number.isFinite(total) ? total : undefined;
}

function CampoMetricaCardio({
  metrica,
  tipoNome,
  valor,
  aoAlterar,
}: {
  metrica: ChaveMetricaCardio;
  tipoNome: string;
  valor: number | undefined;
  aoAlterar: (valor: number | undefined) => void;
}) {
  const meta = META_METRICA_CARDIO[metrica];
  const ehRemoDistancia = metrica === "distanciaKm" && tipoNome === "Remo";
  const unidade = ehRemoDistancia ? "m" : meta.unidade;
  const valorExibido = ehRemoDistancia && valor !== undefined ? valor * 1000 : valor;

  if (metrica === "ritmo500m") {
    return (
      <label className="grid grid-cols-[1fr_96px_54px] items-center gap-2 text-sm text-texto-secundario md:grid-cols-[1fr_112px_64px]">
        <span>{meta.rotulo}</span>
        <input
          value={formatarRitmo(valor)}
          placeholder="2:10"
          onChange={(evento) => aoAlterar(parseRitmo(evento.target.value))}
          className="rounded-[8px] border border-borda-suave bg-fundo px-3 py-2 text-right text-lg font-medium tabular-nums text-texto-primario"
        />
        <span>{meta.unidade}</span>
      </label>
    );
  }

  return (
    <label className="grid grid-cols-[1fr_96px_54px] items-center gap-2 text-sm text-texto-secundario md:grid-cols-[1fr_112px_64px]">
      <span>{meta.rotulo}</span>
      <input
        type="number"
        value={valorExibido ?? ""}
        min={0}
        step={ehRemoDistancia ? 50 : meta.passo}
        inputMode={meta.passo < 1 ? "decimal" : "numeric"}
        onChange={(evento) => {
          const texto = evento.target.value.replace(",", ".");
          const proximo = texto === "" ? undefined : Number(texto);
          if (proximo === undefined || Number.isFinite(proximo)) {
            aoAlterar(ehRemoDistancia && proximo !== undefined ? proximo / 1000 : proximo);
          }
        }}
        className="rounded-[8px] border border-borda-suave bg-fundo px-3 py-2 text-right text-lg font-medium tabular-nums text-texto-primario"
      />
      <span>{unidade}</span>
    </label>
  );
}

export function PainelCardio({
  cardio,
  tiposCardio,
  cardioConcluido,
  aoAtualizarCardio,
  aoConcluirCardio,
  exibirVoltarMusculacao,
  aoVoltarMusculacao,
  aoFinalizar,
}: PainelCardioProps) {
  const [detalhesAbertos, setDetalhesAbertos] = useState<Set<string>>(() => new Set());

  function alternarDetalhes(id: string) {
    setDetalhesAbertos((atuais) => {
      const proximos = new Set(atuais);
      if (proximos.has(id)) proximos.delete(id);
      else proximos.add(id);
      return proximos;
    });
  }

  return (
    <main className="mx-auto min-h-[calc(100dvh-65px)] w-full max-w-[768px] px-4 pb-6 pt-8">
      <div className="mb-8">
        <h1 className="font-display text-[clamp(32px,9vw,40px)] font-semibold leading-none text-texto-primario md:text-[40px]">
          Cardio
        </h1>
      </div>

      <div className="space-y-3">
        {cardio.map((item) => {
          const concluido = cardioConcluido.has(item.cardioId);
          const tipo = resolverTipoCardio(item.tipo, tiposCardio);
          const camposBuiltin = CAMPOS_CARDIO[item.tipo as TipoCardioBuiltin];
          const principais = camposBuiltin
            ? tipo.metricas.filter((metrica) => camposBuiltin.principais.includes(metrica))
            : tipo.metricas;
          const secundarios = camposBuiltin
            ? tipo.metricas.filter((metrica) => camposBuiltin.secundarios.includes(metrica))
            : [];
          const detalhesAberto = detalhesAbertos.has(item.cardioId);

          return (
            <section key={item.cardioId} className="rounded-[8px] border border-borda-suave bg-superficie px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-texto-primario">
                  {tipo.emoji ? `${tipo.emoji} ` : ""}{tipo.nome}
                </h2>
                <button
                  type="button"
                  aria-label={concluido ? "Desmarcar cardio" : "Concluir cardio"}
                  onClick={() => aoConcluirCardio(item.cardioId)}
                  className={`grid h-9 w-9 place-items-center rounded-[8px] transition-all duration-200 ${
                    concluido
                      ? "bg-texto-primario text-texto-invertido animate-check-bounce"
                      : "bg-fundo border border-borda text-texto-secundario hover:border-texto-primario/40 hover:text-texto-primario"
                  }`}
                >
                  <Icone nome="check" tamanho={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {principais.map((metrica) => (
                  <CampoMetricaCardio
                    key={metrica}
                    metrica={metrica}
                    tipoNome={tipo.nome}
                    valor={item[metrica]}
                    aoAlterar={(valor) =>
                      aoAtualizarCardio(item.cardioId, {
                        [metrica]: metrica === "duracaoMinutos" ? valor ?? 0 : valor,
                      })
                    }
                  />
                ))}
              </div>

              {secundarios.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => alternarDetalhes(item.cardioId)}
                    className="text-sm font-medium text-texto-secundario hover:text-texto-primario"
                  >
                    {detalhesAberto ? "Menos detalhes" : "+ mais detalhes"}
                  </button>
                  {detalhesAberto && (
                    <div className="mt-3 space-y-3">
                      {secundarios.map((metrica) => (
                        <CampoMetricaCardio
                          key={metrica}
                          metrica={metrica}
                          tipoNome={tipo.nome}
                          valor={item[metrica]}
                          aoAlterar={(valor) =>
                            aoAtualizarCardio(item.cardioId, {
                              [metrica]: metrica === "duracaoMinutos" ? valor ?? 0 : valor,
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <label className="mt-3 block text-sm text-texto-secundario">
                <span className="mb-1 block">Nota</span>
                <input
                  value={item.nota}
                  onChange={(evento) => aoAtualizarCardio(item.cardioId, { nota: evento.target.value })}
                  className="w-full rounded-[8px] border border-borda-suave bg-fundo px-3 py-2 text-texto-primario"
                />
              </label>
            </section>
          );
        })}
      </div>

      {/* Mobile: barra fixa embaixo (alcance do polegar). md+: botões de largura
          automática alinhados à direita, sem o "caixote" de barra. */}
      <div className="sticky bottom-0 -mx-4 mt-8 grid gap-2 border-t border-borda-suave bg-fundo/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:flex md:justify-end md:gap-3 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {exibirVoltarMusculacao && (
          <button
            type="button"
            onClick={aoVoltarMusculacao}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-borda-suave bg-superficie px-5 text-sm font-medium text-texto-primario"
          >
            <Icone nome="halter" tamanho={16} />
            Voltar à musculação
          </button>
        )}
        <button
          type="button"
          onClick={aoFinalizar}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-acento px-5 text-sm font-medium text-texto-invertido"
        >
          <Icone nome="listaVerificacao" tamanho={16} />
          Finalizar treino
        </button>
      </div>
    </main>
  );
}
