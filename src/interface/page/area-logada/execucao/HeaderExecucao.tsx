import type { NomeIcone } from "@/domain/tipos";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { Botao } from "@/interface/widget/botao/Botao";
import { MenuAcoes } from "@/interface/widget/menu/MenuAcoes";
import type { ProgressoSessao } from "./hooks/useSessaoTreino";
import { useTempoDecorrido } from "./hooks/useTempoDecorrido";

interface HeaderExecucaoProps {
  nomeFicha: string;
  iconeFicha: NomeIcone;
  emojiFicha?: string;
  iniciadoEm: string;
  progresso: ProgressoSessao;
  aoFinalizar: () => void;
  aoAbandonar: () => void;
}

/** Header da execução: identidade da ficha + tempo decorrido + contadores +
    Finalizar sempre à mão + barra fina de progresso. "Abandonar treino" mora
    no kebab (⋮) ao lado do Finalizar — fora da zona do dedão no mobile e com
    lugar consistente nos 3 breakpoints. O X de fechar imediato morreu. */
export function HeaderExecucao({
  nomeFicha,
  iconeFicha,
  emojiFicha,
  iniciadoEm,
  progresso,
  aoFinalizar,
  aoAbandonar,
}: HeaderExecucaoProps) {
  const tempo = useTempoDecorrido(iniciadoEm);

  const partesMeta = [
    tempo,
    `${progresso.itensConcluidos}/${progresso.itensTotal} itens`,
    ...(progresso.seriesTotal > 0
      ? [`${progresso.seriesConcluidas}/${progresso.seriesTotal} séries`]
      : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-borda-suave bg-fundo/95 pt-[var(--safe-top)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1140px] px-4 pb-2.5 pt-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[8px] bg-acento-suave text-texto-primario">
            <IconeFicha nome={iconeFicha} emoji={emojiFicha} tamanho={19} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-texto-primario">{nomeFicha}</p>
            <p className="flex items-center gap-1.5 text-xs tabular-nums text-texto-secundario">
              <Icone nome="relogio" tamanho={12} />
              {partesMeta.join(" · ")}
            </p>
          </div>

          <Botao variante="primario" tamanho="compacto" onClick={aoFinalizar} className="shrink-0">
            Finalizar
          </Botao>

          <MenuAcoes
            rotulo="Mais opções do treino"
            itens={[
              { label: "Abandonar treino", icone: "sair", perigo: true, onClick: aoAbandonar },
            ]}
          />
        </div>

        <div
          className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-borda-suave"
          role="progressbar"
          aria-valuenow={Math.round(progresso.fracao * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do treino"
        >
          <div
            className="h-full rounded-full bg-texto-primario transition-[width] duration-300"
            style={{ width: `${progresso.fracao * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}
