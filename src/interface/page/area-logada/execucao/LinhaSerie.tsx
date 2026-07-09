import type { RegistroSerie } from "@/domain/tipos";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { Icone } from "@/interface/widget/svg/Icone";

interface LinhaSerieProps {
  serie: RegistroSerie;
  indice: number;
  ativa: boolean;
  concluida: boolean;
  usaCarga: boolean;
  /** Série correspondente da última sessão — rótulo do chip "anterior". */
  serieAnterior?: RegistroSerie;
  aoAtualizar: (atualizacao: Partial<Pick<RegistroSerie, "repeticoes" | "carga">>) => void;
  aoConcluir: () => void;
  aoAbrirHistorico: () => void;
}

/** Linha da tabela de séries: # | anterior | kg | reps | feito.
    O chip "anterior" mostra o que foi feito na última sessão e abre o
    histórico pra preencher; os inputs vivem em caixas preenchidas. */
export function LinhaSerie({
  serie,
  indice,
  ativa,
  concluida,
  usaCarga,
  serieAnterior,
  aoAtualizar,
  aoConcluir,
  aoAbrirHistorico,
}: LinhaSerieProps) {
  return (
    <div
      className={`grid items-center gap-2 rounded-[8px] px-1 py-2 transition-all duration-200 ${
        usaCarga
          ? "grid-cols-[24px_minmax(0,1fr)_64px_64px_36px]"
          : "grid-cols-[24px_minmax(0,1fr)_64px_36px]"
      } ${ativa ? "bg-acento-suave" : ""} ${concluida ? "opacity-70" : ""}`}
    >
      <span
        className={`text-center text-sm tabular-nums ${
          ativa ? "font-bold text-texto-primario" : "text-texto-secundario"
        }`}
      >
        {indice + 1}
      </span>

      <button
        type="button"
        onClick={aoAbrirHistorico}
        aria-label="Usar série anterior"
        className="inline-flex w-fit max-w-full cursor-pointer items-center gap-1.5 truncate rounded-full border border-borda-suave bg-superficie px-2.5 py-1 text-xs tabular-nums text-texto-secundario transition-colors duration-150 hover:border-borda-forte hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        <Icone nome="clipboard" tamanho={11} className="shrink-0" />
        {serieAnterior
          ? usaCarga
            ? `${serieAnterior.repeticoes}x${serieAnterior.carga || 0}`
            : `${serieAnterior.repeticoes}`
          : "—"}
      </button>

      {usaCarga ? (
        <CampoNumerico
          variante="caixa"
          valor={serie.carga}
          minimo={0}
          decimal
          aoAlterar={(carga) => aoAtualizar({ carga })}
          ariaLabel="Carga"
        />
      ) : null}

      <CampoNumerico
        variante="caixa"
        valor={serie.repeticoes}
        minimo={0}
        aoAlterar={(repeticoes) => aoAtualizar({ repeticoes })}
        ariaLabel="Repeticoes"
      />

      <button
        type="button"
        aria-label={concluida ? "Desmarcar série" : "Concluir série"}
        onClick={aoConcluir}
        className={`mx-auto grid h-9 w-9 cursor-pointer place-items-center rounded-[8px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${
          concluida
            ? "bg-acento text-texto-invertido animate-check-bounce"
            : "border border-borda-forte bg-superficie text-texto-secundario hover:border-texto-primario/40 hover:text-texto-primario"
        }`}
      >
        <Icone nome="check" tamanho={16} />
      </button>
    </div>
  );
}
