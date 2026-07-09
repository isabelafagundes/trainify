import type { Exercicio, TipoCardioDef } from "@/domain/tipos";
import { Icone } from "@/interface/widget/svg/Icone";
import type { StatusItem } from "./hooks/useSessaoTreino";
import { nomeDoItem } from "./nomeItem";

interface PropriedadesRailItens {
  itens: StatusItem[];
  catalogo: Exercicio[];
  tiposCardio: TipoCardioDef[];
  aoIrPara: (indice: number) => void;
  aoAbandonar: () => void;
}

/** Lista lateral de itens (tablet/desktop): substitui os chips do mobile.
    Mostra a sequência inteira com status e progresso por item; no pé fica o
    "Abandonar treino" (no mobile ele mora no footer). */
export function RailItens({
  itens,
  catalogo,
  tiposCardio,
  aoIrPara,
  aoAbandonar,
}: PropriedadesRailItens) {
  return (
    <aside className="hidden w-[252px] shrink-0 flex-col border-r border-borda-suave md:flex lg:w-[288px]">
      <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-texto-sutil">
        itens da ficha
      </div>

      <nav aria-label="Itens da ficha" className="min-h-0 flex-1 overflow-y-auto px-3">
        {itens.map((item) => {
          const { nome, emoji } = nomeDoItem(item, catalogo, tiposCardio);
          const ativo = item.estado === "ativo";
          const concluido = item.estado === "concluido";

          return (
            <button
              key={item.indice}
              type="button"
              onClick={() => aoIrPara(item.indice)}
              aria-current={ativo ? "step" : undefined}
              className={`mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${
                ativo ? "bg-acento-suave" : "hover:bg-superficie-suave"
              }`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${
                  concluido || ativo
                    ? "border-acento bg-acento text-texto-invertido"
                    : "border-borda-suave bg-superficie text-texto-sutil"
                }`}
              >
                {concluido ? <Icone nome="check" tamanho={12} /> : item.indice + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[13px] ${
                    ativo
                      ? "font-semibold text-texto-primario"
                      : concluido
                        ? "font-medium text-texto-sutil"
                        : "font-medium text-texto-primario"
                  }`}
                >
                  {emoji ? `${emoji} ${nome}` : nome}
                </span>
                <span className="block text-[11px] tabular-nums text-texto-sutil">
                  {item.rotuloProgresso}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={aoAbandonar}
        className="mx-3 mb-4 mt-2 inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg text-xs font-medium text-texto-sutil transition-colors duration-150 hover:text-perigo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        <Icone nome="sair" tamanho={13} /> Abandonar treino
      </button>
    </aside>
  );
}
