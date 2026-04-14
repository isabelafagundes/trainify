import type { Exercicio, ExercicioFicha, Ficha } from "@/domain/tipos";
import { Chip } from "@/interface/widget/chip/Chip";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { Botao } from "@/interface/widget/botao/Botao";

interface PropriedadesLinhaFicha {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  ultimoTreino?: string | null;
  aoIniciarTreino: (fichaId: string) => void;
  proximoTreino?: boolean;
}

function extrairGruposMusculares(
  exerciciosFicha: ExercicioFicha[],
  catalogo: Exercicio[]
): string[] {
  const grupos = new Set<string>();
  for (const ef of exerciciosFicha) {
    const exercicio = catalogo.find((e) => e.id === ef.exercicioId);
    if (exercicio) grupos.add(exercicio.grupoMuscular);
  }
  return Array.from(grupos);
}

function formatarDataRelativa(dataISO: string): string {
  const agora = new Date();
  const data = new Date(dataISO);
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  if (diffDias < 7) return `${diffDias}d atrás`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function LinhaFicha({
  ficha,
  exerciciosCatalogo,
  ultimoTreino,
  aoIniciarTreino,
  proximoTreino = false,
}: PropriedadesLinhaFicha) {
  const gruposMusculares = extrairGruposMusculares(ficha.exercicios, exerciciosCatalogo);

  return (
    <div className={`flex items-center gap-4 py-3 px-4 transition-all duration-200 group ${proximoTreino ? "bg-acento-suave/50 animate-highlight-pulse" : "hover:bg-superficie-suave"}`}>
      {/* Ícone */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-[10px] bg-acento-suave flex items-center justify-center text-texto-primario transition-all duration-200 group-hover:scale-105 shadow-sm">
          <IconeFicha nome={ficha.icone} tamanho={26} emoji={ficha.emoji} />
        </div>
        {proximoTreino && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-acento rounded-full ring-2 ring-superficie/90 animate-pulse-subtle" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-texto-primario leading-tight font-display truncate transition-colors duration-200 group-hover:text-texto-secundario">
            {ficha.nome}
          </h3>
          <span className="flex-shrink-0 text-xs text-texto-secundario tabular-nums">
            {ficha.exercicios.length} exerc.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {gruposMusculares.map((grupo) => (
            <Chip key={grupo} rotulo={grupo} />
          ))}
          {ultimoTreino && (
            <span className="text-xs text-texto-secundario ml-1">
              · {formatarDataRelativa(ultimoTreino)}
            </span>
          )}
        </div>
      </div>

      {/* Botão iniciar */}
      {proximoTreino ? (
        <button className="relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-[8px] px-3 py-2 bg-acento text-texto-invertido text-xs font-medium gap-2 transition-all duration-200 hover:bg-acento-hover hover:-translate-y-px hover:shadow-md active:scale-95 group active:translate-y-0">
          {/* Efeito shimmer */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer-btn">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </div>
          {/* Conteúdo do botão */}
          <Icone nome="reproduzir" tamanho={13} />
          <span className="relative">Iniciar</span>
        </button>
      ) : (
        <Botao
          variante="fantasma"
          tamanho="compacto"
          icone={<Icone nome="reproduzir" tamanho={13} />}
          onClick={() => aoIniciarTreino(ficha.id)}
          className="flex-shrink-0 transition-transform duration-200 active:scale-95"
        >
          Iniciar
        </Botao>
      )}
    </div>
  );
}
