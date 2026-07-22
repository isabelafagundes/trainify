import type { ResumoCompartilhamento } from "@/application/compartilhamento/calcular-resumo-treino";
import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { formatarNumeroBR } from "@/interface/util/numero";
import { FundoResultado } from "@/interface/widget/fundo-resultado/FundoResultado";
import { velaFoto, type SelecaoFundo } from "@/interface/widget/fundo-resultado/presets-fundo";
import { formatarDuracaoTreino } from "./formatar-resultado";

export function CardResultadoTreino({ registro, ficha, resumo, fundo, grupos }: { registro: RegistroTreino; ficha: Ficha; resumo: ResumoCompartilhamento; fundo: SelecaoFundo; grupos: string[] }) {
  const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(registro.finalizadoEm));
  // Fontes em cqw escalam com a largura do card (não do viewport).
  const metricas = [
    ...(resumo.duracaoSegundos > 0 ? [{ v: formatarDuracaoTreino(resumo.duracaoSegundos), r: "duração" }] : []),
    ...(resumo.volumeTotalKg > 0 ? [{ v: new Intl.NumberFormat("pt-BR").format(resumo.volumeTotalKg), r: "volume kg" }] : []),
    { v: String(resumo.totalExercicios), r: "exercícios" },
    { v: String(resumo.totalSeries), r: "séries" },
  ];
  const scrim = fundo.tipo === "foto"
    ? (() => { const v = velaFoto(fundo.escurecer); return `linear-gradient(to bottom, rgba(0,0,0,${v.topo}), rgba(0,0,0,${v.meio}) 40%, rgba(0,0,0,${v.base}))`; })()
    : "linear-gradient(to bottom, rgba(0,0,0,.04), rgba(0,0,0,.12) 40%, rgba(0,0,0,.5))";
  return <div style={{ containerType: "inline-size" }} className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-black/15 bg-slate-900 text-white shadow-sm" aria-label="Prévia do resultado do treino">
    {fundo.tipo === "foto"
      ? <img src={fundo.dataUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      : <FundoResultado preset={fundo.preset} seed={registro.id} animado />}
    <div className="absolute inset-0" style={{ background: scrim }} />
    <div className="relative flex h-full flex-col p-[4%]">
      {/* Zona superior: marca + emoji com respiro */}
      <div className="flex flex-1 flex-col p-[3%]">
        <div className="flex items-center justify-between">
          <div className="text-[clamp(12px,3.4cqw,20px)] font-bold uppercase tracking-[.2em]">Kynori</div>
          <span className="text-[clamp(9px,2.7cqw,14px)] font-semibold uppercase tracking-[.15em] text-white/75">Treino concluído</span>
        </div>
        <div className="flex flex-1 items-center justify-center"><div className="text-[clamp(48px,26cqw,150px)] leading-none" aria-hidden="true">{ficha.emoji || "💪"}</div></div>
      </div>
      {/* Painel glass inferior */}
      <div className="rounded-[16px] border border-white/20 bg-white/[0.13] p-[5%] backdrop-blur-md">
        <h2 className="line-clamp-2 font-display text-[clamp(18px,7cqw,40px)] font-semibold leading-[1.04]">{ficha.nome}</h2>
        <p className="mt-[1%] text-[clamp(10px,2.9cqw,16px)] text-white/75">{data}</p>
        {grupos.length > 0 && (
          <div className="mt-[3%] flex flex-wrap gap-[2%]">
            {grupos.map((grupo) => <span key={grupo} className="rounded-full border border-white/25 bg-white/10 px-[3.5%] py-[1%] text-[clamp(9px,2.6cqw,13px)] font-medium text-white/90">{grupo}</span>)}
          </div>
        )}
        <div className="mt-[4%] grid grid-cols-2 gap-x-[4%] gap-y-[3.5%] border-t border-white/20 pt-[4%]">
          {metricas.map((metrica) => <div key={metrica.r}><strong className="block font-display text-[clamp(15px,6.5cqw,30px)] font-bold leading-none tabular-nums">{metrica.v}</strong><span className="text-[clamp(9px,2.7cqw,14px)] text-white/65">{metrica.r}</span></div>)}
        </div>
        {resumo.totalCardios > 0 && (
          <div className="mt-[3.5%] flex items-baseline gap-[2%]">
            <span className="text-[clamp(8px,2.4cqw,12px)] font-semibold uppercase tracking-[.12em] text-white/60">Cardio</span>
            <span className="text-[clamp(11px,3.4cqw,17px)] font-semibold tabular-nums">{formatarNumeroBR(resumo.duracaoCardioMinutos)} min{resumo.distanciaCardioKm ? ` · ${formatarNumeroBR(resumo.distanciaCardioKm)} km` : ""}</span>
          </div>
        )}
      </div>
    </div>
  </div>;
}
