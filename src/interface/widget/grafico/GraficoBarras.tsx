import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesBadgeTendencia {
  texto: string;
  /** true → destaque âmbar (evolução positiva); false → neutro */
  positivo?: boolean;
}

/** Pílula de variação usada nos cards de insight. Âmbar é reservado ao ganho. */
export function BadgeTendencia({ texto, positivo = false }: PropriedadesBadgeTendencia) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold leading-none ${
        positivo ? "bg-grafico/15 text-grafico" : "bg-superficie-suave text-texto-sutil"
      }`}
    >
      <Icone nome="tendencia" tamanho={12} />
      {texto}
    </span>
  );
}

export interface PontoBarra {
  rotulo: string; /** legenda curta no eixo X (ex.: "20/05") */
  valor: number;
  titulo?: string; /** tooltip nativo ao passar o mouse */
}

interface PropriedadesGraficoBarras {
  pontos: PontoBarra[];
  /** altura da área de barras em px (a legenda fica abaixo) */
  altura?: number;
}

/**
 * Barras verticais — primitivo compartilhado pelos gráficos de insight
 * (volume semanal, maior evolução). A última barra é destacada com gradiente,
 * espelhando a linguagem do GraficoProgressao. Barras com valor 0 aparecem
 * como um traço tênue, para manter a janela contígua sem sugerir dado.
 */
export function GraficoBarras({ pontos, altura = 168 }: PropriedadesGraficoBarras) {
  const maximo = Math.max(1, ...pontos.map((p) => p.valor));

  return (
    <div
      className="flex items-end justify-between gap-2 rounded-[10px] bg-fundo px-3 pb-3 pt-4"
      style={{ height: altura }}
    >
      {pontos.map((ponto, indice) => {
        const ehUltimo = indice === pontos.length - 1;
        const vazio = ponto.valor <= 0;
        const alturaPct = vazio ? 4 : Math.max(8, (ponto.valor / maximo) * 100);
        return (
          <div
            key={`${ponto.rotulo}-${indice}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
          >
            <div className="flex flex-1 items-end justify-center">
              <div
                className={`w-full max-w-[40px] rounded-t-[6px] transition-all ${
                  vazio
                    ? "bg-borda/60"
                    : ehUltimo
                      ? "bg-gradient-to-t from-grafico-forte to-grafico shadow-sm"
                      : "bg-grafico"
                }`}
                style={{ height: `${alturaPct}%` }}
                title={ponto.titulo}
              />
            </div>
            <span
              className={`truncate text-center text-[11px] tabular-nums ${
                ehUltimo ? "font-semibold text-texto-secundario" : "text-texto-sutil"
              }`}
            >
              {ponto.rotulo}
            </span>
          </div>
        );
      })}
    </div>
  );
}
