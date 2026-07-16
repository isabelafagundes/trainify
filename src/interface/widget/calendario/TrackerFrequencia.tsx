import type { DadosFrequencia, RegistroAtividadeDiaria } from "@/domain/tipos";
import { useState, useMemo } from "react";
import { StreakCounter } from "@/interface/widget/streak/StreakCounter";

interface PropriedadesTrackerFrequencia {
  dados: DadosFrequencia;
}

type NivelAtividade = 0 | 1 | 2 | 3 | 4;

function calcularNivelAtividade(registro: RegistroAtividadeDiaria): NivelAtividade {
  if (!registro.completou) return 0;
  const numFichas = registro.fichasCompletas?.length ?? 1;

  if (numFichas === 1) return 1;
  if (numFichas === 2) return 2;
  if (numFichas === 3) return 3;
  return 4;
}

const coresPorNivel: Record<NivelAtividade, string> = {
  0: "bg-borda-suave",
  1: "bg-acento-suave/40",
  2: "bg-acento-suave/60",
  3: "bg-acento-suave/80",
  4: "bg-acento/30",
};

const coresPorNivelHover: Record<NivelAtividade, string> = {
  0: "hover:bg-borda",
  1: "hover:bg-acento-suave/50",
  2: "hover:bg-acento-suave/70",
  3: "hover:bg-acento-suave/90",
  4: "hover:bg-acento/40",
};

function formatarMes(data: Date): string {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return meses[data.getMonth()];
}

function TooltipDia({ registro, posicao }: { registro: RegistroAtividadeDiaria; posicao: { x: number; y: number } }) {
  const data = new Date(registro.data + "T00:00:00");
  const dataFormatada = data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div
      className="fixed z-50 px-2 py-1.5 bg-texto-primario text-texto-invertido text-[10px] rounded-md shadow-lg pointer-events-none whitespace-nowrap"
      style={{ left: posicao.x, top: posicao.y, transform: "translate(-50%) translateY(-100%) translateY(-8px)" }}
    >
      <div className="font-medium">{dataFormatada}</div>
      {registro.completou ? (
        <div className="text-texto-invertido/80">
          {registro.fichasCompletas?.length ?? 1} {((registro.fichasCompletas?.length ?? 1) === 1) ? "ficha" : "fichas"} completada{((registro.fichasCompletas?.length ?? 1) > 1) ? "s" : ""}
        </div>
      ) : (
        <div className="text-texto-invertido/60">Sem treino</div>
      )}
    </div>
  );
}

export function TrackerFrequencia({ dados }: PropriedadesTrackerFrequencia) {
  const [tooltip, setTooltip] = useState<{ registro: RegistroAtividadeDiaria; x: number; y: number } | null>(null);

  // Calcular streak atual (dias consecutivos com treino).
  // Os registros são uma janela diária contígua terminando em hoje (dataFim),
  // já em ISO local — iteramos de trás pra frente para evitar conversões UTC.
  const streakAtual = useMemo(() => {
    const registros = dados.registros;
    let streak = 0;

    for (let i = registros.length - 1; i >= 0; i--) {
      if (registros[i].completou) {
        streak++;
      } else if (i < registros.length - 1) {
        // Não treinou neste dia; só não quebra se for o último dia (hoje).
        break;
      }
    }

    return streak;
  }, [dados.registros]);

  // Calcular recorde pessoal (maior streak já atingido)
  const recordePessoal = useMemo(() => {
    let maxStreak = 0;
    let streakAtualCalc = 0;

    const datasOrdenadas = [...dados.registros]
      .map(r => r.data)
      .sort();

    for (let i = 0; i < datasOrdenadas.length; i++) {
      const registro = dados.registros.find(r => r.data === datasOrdenadas[i]);
      if (registro?.completou) {
        streakAtualCalc++;
        maxStreak = Math.max(maxStreak, streakAtualCalc);
      } else {
        streakAtualCalc = 0;
      }
    }

    return maxStreak;
  }, [dados.registros]);

  // Criar mapa de registros por data para lookup rápido
  const registrosPorData = new Map<string, RegistroAtividadeDiaria>();
  for (const registro of dados.registros) {
    registrosPorData.set(registro.data, registro);
  }

  // Gerar grid de dias - 1 ano completo (365 dias)
  const dataFim = new Date();
  const dataInicio = new Date();
  dataInicio.setDate(dataFim.getDate() - 364); // 365 dias incluindo hoje

  // Calcular número de semanas
  const diffMs = dataFim.getTime() - dataInicio.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const numSemanas = Math.ceil(diffDias / 7);

  // Gerar matriz de dias [semana][diaDaSemana]
  // Começa no domingo (0) e vai até sábado (6)
  const grid: (Date | null)[][] = [];

  // Encontrar o primeiro domingo antes ou na data de início
  const primeiroDomingo = new Date(dataInicio);
  const diaSemanaInicio = dataInicio.getDay();
  primeiroDomingo.setDate(dataInicio.getDate() - diaSemanaInicio);

  for (let semana = 0; semana < numSemanas + 1; semana++) {
    const diasSemana: (Date | null)[] = [];
    for (let dia = 0; dia < 7; dia++) {
      const data = new Date(primeiroDomingo);
      data.setDate(primeiroDomingo.getDate() + (semana * 7) + dia);
      // Incluir apenas datas dentro do intervalo
      if (data >= dataInicio && data <= dataFim) {
        diasSemana.push(data);
      } else {
        diasSemana.push(null);
      }
    }
    grid.push(diasSemana);
  }

  // Remover semanas vazias (todas as posições null)
  const gridFiltrado = grid.filter(semana => semana.some(dia => dia !== null));

  // Calcular estatísticas
  const diasComTreino = dados.registros.filter((r) => r.completou).length;
  const totalDias = dados.registros.length;
  const porcentagem = totalDias > 0 ? Math.round((diasComTreino / totalDias) * 100) : 0;

  // Labels dos dias da semana em português - todos os dias
  // Ordem: Dom(0), Seg(1), Ter(2), Qua(3), Qui(4), Sex(5), Sab(6)
  const labelsDiasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleMouseEnter = (registro: RegistroAtividadeDiaria, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      registro,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Calcular posição dos meses
  const meses: { nome: string; posicao: number }[] = [];
  let mesAtual = "";

  for (let col = 0; col < gridFiltrado.length; col++) {
    const primeiraDataDaSemana = gridFiltrado[col].find(d => d !== null);
    if (primeiraDataDaSemana) {
      const mes = formatarMes(primeiraDataDaSemana);
      if (mes !== mesAtual) {
        mesAtual = mes;
        meses.push({ nome: mes, posicao: col });
      }
    }
  }

  return (
    <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
      {/* Header com estatísticas e streak */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-texto-primario font-display">
              Frequência de Treino
            </h2>
            <p className="text-xs text-texto-sutil mt-0.5">
              {diasComTreino} de {totalDias} dias ({porcentagem}%)
            </p>
          </div>

          {/* Streak Counter */}
          <StreakCounter
            diasConsecutivos={streakAtual}
            recordePessoal={recordePessoal}
            tamanho="pequeno"
          />
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-1 text-[10px] text-texto-sutil">
          <span>Menos</span>
          <div className="flex gap-0.5 mx-1">
            {[0, 1, 2, 3, 4].map((nivel) => (
              <div
                key={nivel}
                className={`w-4 h-4 rounded-sm ${coresPorNivel[nivel as NivelAtividade]}`}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* Grid de contribuição com scroll horizontal */}
      <div className="px-4 pb-4">
        <div className="scrollbar-mobile-hidden overflow-x-auto scrollbar-thin scrollbar-thumb-borda-suave scrollbar-track-transparent">
          {/* Container principal com labels de dias da semana */}
          <div className="inline-flex">
            {/* Coluna de labels dos dias da semana */}
            <div className="flex flex-col gap-1 mr-2 text-[10px] text-texto-sutil font-medium">
              {labelsDiasSemana.map((label, i) => (
                <div key={i} className="h-4 w-[12px] flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid de dias - cada coluna é uma semana */}
            <div className="flex gap-1">
              {gridFiltrado.map((semana, semanaIndex) => (
                <div key={semanaIndex} className="flex flex-col gap-1">
                  {semana.map((data, diaIndex) => {
                    if (!data) {
                      return <div key={`${semanaIndex}-${diaIndex}`} className="w-4 h-4" />;
                    }

                    const dataISO = data.toISOString().split("T")[0];
                    const registro = registrosPorData.get(dataISO) ?? { data: dataISO, completou: false };
                    const nivel = calcularNivelAtividade(registro);

                    return (
                      <div
                        key={dataISO}
                        role="img"
                        className={`w-4 h-4 rounded-sm transition-colors duration-150 ease-out ${coresPorNivel[nivel]} ${coresPorNivelHover[nivel]}`}
                        onMouseEnter={(e) => handleMouseEnter(registro, e)}
                        onMouseLeave={handleMouseLeave}
                        aria-label={`${data.toLocaleDateString("pt-BR")}: ${registro.completou ? "treino completado" : "sem treino"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Labels dos meses - alinhados com as colunas de semanas */}
            <div className="relative h-5 mt-1 text-[10px] text-texto-sutil ml-0">
              {meses.map((mes, index) => (
                <div
                  key={index}
                  className="absolute whitespace-nowrap"
                  style={{ left: `${mes.posicao * 20}px` }}
                >
                  {mes.nome}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && <TooltipDia registro={tooltip.registro} posicao={{ x: tooltip.x, y: tooltip.y }} />}
    </div>
  );
}
