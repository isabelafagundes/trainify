import { useState } from "react";
import type {
  ChaveMetricaCardio,
  RegistroCardio,
  TipoCardioBuiltin,
  TipoCardioDef,
} from "@/domain/tipos";
import {
  CAMPOS_CARDIO,
  META_METRICA_CARDIO,
  resolverTipoCardio,
} from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";
import { CLASSES_CAMPO_CAIXA } from "@/interface/widget/formulario/CampoNumerico";
import { CampoNumeroOpcional } from "@/interface/widget/formulario/CampoNumeroOpcional";

type AtualizacaoCardio = Partial<Pick<RegistroCardio, ChaveMetricaCardio | "nota">>;

interface CardRegistroCardioProps {
  registro: RegistroCardio;
  tiposCardio: TipoCardioDef[];
  concluido: boolean;
  aoAtualizar: (atualizacao: AtualizacaoCardio) => void;
  aoConcluir: () => void;
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

  // display:contents → as três células (rótulo | caixa | unidade) entram
  // direto no grid do card, alinhando com as demais métricas e a coluna do check.
  const campo =
    metrica === "ritmo500m" ? (
      <input
        value={formatarRitmo(valor)}
        placeholder="2:10"
        onChange={(evento) => aoAlterar(parseRitmo(evento.target.value))}
        className={CLASSES_CAMPO_CAIXA}
      />
    ) : (
      <CampoNumeroOpcional
        valor={valorExibido}
        decimal={meta.passo < 1 && !ehRemoDistancia}
        passo={ehRemoDistancia ? 50 : meta.passo}
        aoAlterar={(proximo) =>
          aoAlterar(ehRemoDistancia && proximo !== undefined ? proximo / 1000 : proximo)
        }
      />
    );

  return (
    <label className="contents">
      <span className="text-[13px] text-texto-secundario">{meta.rotulo}</span>
      {campo}
      <span className="text-xs text-texto-sutil">
        {metrica === "ritmo500m" ? meta.unidade : unidade}
      </span>
    </label>
  );
}

/** Card de registro de UM item de cardio — mesma anatomia do card de séries:
    cabeçalho em caps + check único, métricas principais e "+ mais detalhes". */
export function CardRegistroCardio({
  registro,
  tiposCardio,
  concluido,
  aoAtualizar,
  aoConcluir,
}: CardRegistroCardioProps) {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const tipo = resolverTipoCardio(registro.tipo, tiposCardio);
  const camposBuiltin = CAMPOS_CARDIO[registro.tipo as TipoCardioBuiltin];
  const principais = camposBuiltin
    ? tipo.metricas.filter((metrica) => camposBuiltin.principais.includes(metrica))
    : tipo.metricas;
  const secundarios = camposBuiltin
    ? tipo.metricas.filter((metrica) => camposBuiltin.secundarios.includes(metrica))
    : [];

  return (
    <section className="rounded-2xl border border-borda bg-superficie p-3">
      {/* Métricas se auto-rotulam (rótulo | valor | unidade); o check ocupa a
          coluna final — como a coluna "feito" do card de séries — centralizado
          verticalmente nas linhas de métrica. Sem header "REGISTRO" solto. */}
      <div className="grid grid-cols-[1fr_84px_48px_36px] items-center gap-x-3 gap-y-2">
        {principais.map((metrica) => (
          <CampoMetricaCardio
            key={metrica}
            metrica={metrica}
            tipoNome={tipo.nome}
            valor={registro[metrica]}
            aoAlterar={(valor) =>
              aoAtualizar({ [metrica]: metrica === "duracaoMinutos" ? valor ?? 0 : valor })
            }
          />
        ))}
        <button
          type="button"
          aria-label={concluido ? "Desmarcar cardio" : "Concluir cardio"}
          onClick={aoConcluir}
          style={{ gridColumn: 4, gridRow: `1 / ${principais.length + 1}` }}
          className={`grid h-9 w-9 cursor-pointer place-items-center self-center justify-self-center rounded-[8px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${
            concluido
              ? "bg-acento text-texto-invertido animate-check-bounce"
              : "border border-borda-forte bg-superficie text-texto-secundario hover:border-texto-primario/40 hover:text-texto-primario"
          }`}
        >
          <Icone nome="check" tamanho={16} />
        </button>
      </div>

      {secundarios.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setDetalhesAbertos((atual) => !atual)}
            className="cursor-pointer text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-texto-primario"
          >
            {detalhesAbertos ? "menos detalhes" : "+ mais detalhes"}
          </button>
          {detalhesAbertos && (
            <div className="mt-2.5 grid grid-cols-[1fr_84px_48px_36px] items-center gap-x-3 gap-y-2">
              {secundarios.map((metrica) => (
                <CampoMetricaCardio
                  key={metrica}
                  metrica={metrica}
                  tipoNome={tipo.nome}
                  valor={registro[metrica]}
                  aoAlterar={(valor) =>
                    aoAtualizar({ [metrica]: metrica === "duracaoMinutos" ? valor ?? 0 : valor })
                  }
                />
              ))}
              {/* Reserva a coluna do check (vazia aqui) pra alinhar as caixas
                  de valor com as métricas principais. */}
              <span
                aria-hidden
                style={{ gridColumn: 4, gridRow: `1 / ${secundarios.length + 1}` }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
