import type { Exercicio, ExercicioFicha, Ficha } from "@/domain/tipos";
import { exerciciosDaFicha } from "@/domain/ficha";
import { formatarDataRelativa } from "@/interface/page/area-logada/programa/utils";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { TextoLetreiro } from "@/interface/widget/texto/TextoLetreiro";

interface PropriedadesLinhaFicha {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  ultimoTreino?: string | null;
  aoIniciarTreino: (fichaId: string) => void;
  proximoTreino?: boolean;
}

function extrairGruposMusculares(
  exerciciosFicha: ExercicioFicha[],
  catalogo: Exercicio[],
): string[] {
  const grupos = new Set<string>();
  for (const ef of Array.isArray(exerciciosFicha) ? exerciciosFicha : []) {
    const exercicio = catalogo.find((e) => e.id === ef.exercicioId);
    if (exercicio) grupos.add(exercicio.grupoMuscular);
  }
  return Array.from(grupos);
}

export function LinhaFicha({
  ficha,
  exerciciosCatalogo,
  ultimoTreino,
  aoIniciarTreino,
  proximoTreino = false,
}: PropriedadesLinhaFicha) {
  const exerciciosFicha = exerciciosDaFicha(ficha);
  const gruposMusculares = extrairGruposMusculares(exerciciosFicha, exerciciosCatalogo);

  const textoGruposMusculares = gruposMusculares.join(" · ");

  return (
    <div className={`flex items-center gap-4 py-3 px-4 transition-all duration-200 group ${proximoTreino ? "bg-acento-suave/50 animate-highlight-pulse" : "hover:bg-superficie-suave"}`}>
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-[10px] bg-acento-suave flex items-center justify-center text-texto-primario transition-all duration-200 group-hover:scale-105 shadow-sm">
          <IconeFicha nome={ficha.icone} tamanho={26} emoji={ficha.emoji} />
        </div>
        {proximoTreino && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-acento rounded-full ring-2 ring-superficie/90 animate-pulse-subtle" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="min-w-0 truncate text-sm font-semibold text-texto-primario leading-tight font-display transition-colors duration-200 group-hover:text-texto-secundario">
            {ficha.nome}
          </h3>
          {ultimoTreino && (
            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-acento-suave px-1.5 py-0.5 text-xs font-semibold leading-none tracking-[0.01em] text-acento">
              <span className="sr-only">Última vez treinada: </span>
              {formatarDataRelativa(ultimoTreino)}
            </span>
          )}
        </div>
        <div className="mt-1 flex min-w-0 items-center text-xs text-texto-sutil">
          <span className="flex-shrink-0">
            {exerciciosFicha.length} exerc.
          </span>
          {textoGruposMusculares && (
            <>
              <span className="mx-1 flex-shrink-0"> · </span>
              <TextoLetreiro texto={textoGruposMusculares} className="flex-1" />
            </>
          )}
        </div>
      </div>

      {proximoTreino ? (
        <button
          onClick={() => aoIniciarTreino(ficha.id)}
          className="relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-[8px] px-3 py-2 bg-acento text-texto-invertido text-xs font-medium gap-2 transition-all duration-200 hover:bg-acento-hover hover:-translate-y-px hover:shadow-md active:scale-95 group active:translate-y-0"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer-btn">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </div>
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
