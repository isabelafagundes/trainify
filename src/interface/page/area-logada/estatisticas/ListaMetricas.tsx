/* ═══════════════════════════════════════════
   Totalizadores — métricas como "propriedades" (Notion-like)

   Duas formas da mesma lista de `ItemMetrica`, compartilhadas entre
   Estatísticas e Histórico:
   - `ListaMetricas`: pilha vertical `ícone · rótulo …… valor` (mobile).
   - `FaixaPropriedades`: faixa horizontal com divisores (telas largas).
     Segue o mesmo visual do `widget/programa/FaixaMetricas` (resumo do
     programa), mas genérico a partir de `ItemMetrica[]`.

   O ícone (SVG do sistema) substitui o emoji: mesmo peso de traço do resto
   do app.
   ═══════════════════════════════════════════ */

import { Fragment } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

export interface ItemMetrica {
  /** Nome do ícone do sistema (ver `Icone`). */
  icone: string;
  rotulo: string;
  valor: string | number;
  /** Texto auxiliar à direita do valor (ex.: "recorde: 1"). */
  extra?: string;
}

interface PropriedadesListaMetricas {
  itens: ItemMetrica[];
}

export function ListaMetricas({ itens }: PropriedadesListaMetricas) {
  return (
    <div className="overflow-hidden rounded-2xl border border-borda bg-superficie">
      {itens.map((item, indice) => (
        <div
          key={item.rotulo}
          className={`flex items-center gap-2.5 px-3.5 py-3 ${
            indice < itens.length - 1 ? "border-b border-borda-suave" : ""
          }`}
        >
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-acento-suave text-texto-secundario"
            aria-hidden="true"
          >
            <Icone nome={item.icone} tamanho={15} />
          </span>
          <span className="flex-1 text-[13px] text-texto-sutil">{item.rotulo}</span>
          <span className="font-display text-[15px] font-bold tabular-nums text-texto-primario">
            {item.valor}
          </span>
          {item.extra && (
            <span className="ml-0.5 text-[11px] text-texto-sutil">{item.extra}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function FaixaPropriedades({ itens }: PropriedadesListaMetricas) {
  return (
    <div className="flex items-center rounded-2xl border border-borda bg-superficie px-2 py-3.5">
      {itens.map((item, indice) => (
        <Fragment key={item.rotulo}>
          {indice > 0 && (
            <div className="my-0.5 w-px self-stretch bg-borda-suave" aria-hidden="true" />
          )}
          <div className="flex-1 px-1.5 text-center">
            <div className="flex items-center justify-center gap-2">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-acento-suave text-texto-secundario"
                aria-hidden="true"
              >
                <Icone nome={item.icone} tamanho={15} />
              </span>
              <span className="font-display text-lg font-bold leading-none tabular-nums text-texto-primario">
                {item.valor}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-texto-sutil">{item.rotulo}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
