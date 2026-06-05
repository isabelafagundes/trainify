import type { RegistroSerie } from "@/domain/tipos";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { Icone } from "@/interface/widget/svg/Icone";

interface LinhaSerieProps {
  serie: RegistroSerie;
  indice: number;
  ativa: boolean;
  concluida: boolean;
  usaCarga: boolean;
  podeRemover: boolean;
  aoAtualizar: (atualizacao: Partial<Pick<RegistroSerie, "repeticoes" | "carga">>) => void;
  aoConcluir: () => void;
  aoRemover: () => void;
  aoAbrirHistorico: () => void;
}

export function LinhaSerie({
  serie,
  indice,
  ativa,
  concluida,
  usaCarga,
  podeRemover,
  aoAtualizar,
  aoConcluir,
  aoRemover,
  aoAbrirHistorico,
}: LinhaSerieProps) {
  const inputClasses = `w-full min-w-0 bg-transparent text-xl tabular-nums font-semibold text-texto-primario outline-none border-b ${
    ativa ? "border-texto-primario/40 focus:border-texto-primario" : concluida ? "border-transparent" : "border-borda"
  }`;

  return (
    <div
      className={`relative grid items-center gap-2 rounded-[8px] px-3 py-2.5 transition-all duration-200 ${
        usaCarga
          ? "grid-cols-[24px_1fr_1fr_34px_36px_28px]"
          : "grid-cols-[24px_1fr_34px_36px_28px]"
      } ${ativa ? "bg-acento-suave shadow-sm" : concluida ? "bg-superficie" : "bg-transparent"}`}
    >
      {ativa ? (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-texto-primario"
        />
      ) : null}

      <span className={`text-sm tabular-nums ${ativa ? "font-semibold text-texto-primario" : "text-texto-secundario"}`}>
        {indice + 1}
      </span>

      <label className="min-w-0">
        <span className="sr-only">Repetições</span>
        <CampoNumerico
          valor={serie.repeticoes}
          minimo={0}
          aoAlterar={(repeticoes) => aoAtualizar({ repeticoes })}
          ariaLabel="Repeticoes"
          className={inputClasses}
        />
        <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-texto-sutil">reps</span>
      </label>

      {usaCarga ? (
        <label className="min-w-0">
          <span className="sr-only">Carga</span>
          <CampoNumerico
            valor={serie.carga}
            minimo={0}
            decimal
            aoAlterar={(carga) => aoAtualizar({ carga })}
            ariaLabel="Carga"
            className={inputClasses}
          />
          <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-texto-sutil">kg</span>
        </label>
      ) : null}

      <button
        type="button"
        aria-label="Usar série anterior"
        onClick={aoAbrirHistorico}
        className="grid h-8 w-8 place-items-center rounded-[8px] text-texto-sutil hover:bg-superficie-hover hover:text-texto-primario"
      >
        <Icone nome="clipboard" tamanho={15} />
      </button>

      <button
        type="button"
        aria-label={concluida ? "Desmarcar série" : "Concluir série"}
        onClick={aoConcluir}
        className={`grid h-9 w-9 place-items-center rounded-[8px] transition-all duration-200 ${
          concluida
            ? "bg-texto-primario text-texto-invertido animate-check-bounce"
            : "bg-superficie border border-borda text-texto-secundario hover:border-texto-primario/40 hover:text-texto-primario"
        }`}
      >
        <Icone nome="check" tamanho={18} />
      </button>

      <button
        type="button"
        aria-label="Remover série"
        disabled={!podeRemover}
        onClick={aoRemover}
        className="grid h-8 w-8 place-items-center rounded-[8px] text-texto-sutil hover:bg-superficie-hover hover:text-texto-primario disabled:opacity-20"
      >
        <Icone nome="lixeira" tamanho={15} />
      </button>
    </div>
  );
}
