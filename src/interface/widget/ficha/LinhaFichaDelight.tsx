import type { Exercicio, ExercicioFicha, Ficha } from "@/domain/tipos";
import { useState } from "react";
import { Chip } from "@/interface/widget/chip/Chip";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { CelebracaoConfetti } from "@/interface/widget/efeito/CelebracaoConfetti";

interface PropriedadesLinhaFicha {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  ultimoTreino?: string | null;
  aoIniciarTreino: (fichaId: string) => void;
  pendente?: boolean; // Se true, mostra animação de "pulse" para chamar atenção
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

function formatarDataRelativa(dataISO: string, agoraMs: number): string {
  const data = new Date(dataISO);
  const diffMs = agoraMs - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  if (diffDias < 7) return `${diffDias}d atrás`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function LinhaFichaDelight({
  ficha,
  exerciciosCatalogo,
  ultimoTreino,
  aoIniciarTreino,
  pendente = false,
}: PropriedadesLinhaFicha) {
  const gruposMusculares = extrairGruposMusculares(ficha.exercicios, exerciciosCatalogo);
  const [mostrarConfetti, setMostrarConfetti] = useState(false);
  const [hover, setHover] = useState(false);
  const [agoraMs] = useState(() => Date.now());

  const handleIniciar = () => {
    // Mostrar celebração
    setMostrarConfetti(true);

    // Chamar callback após um pequeno delay para a animação
    setTimeout(() => {
      aoIniciarTreino(ficha.id);
    }, 100);
  };

  // Calcular dias desde o último treino para destacar se está "atrasado"
  const diasDesdeUltimo = ultimoTreino
    ? Math.floor((agoraMs - new Date(ultimoTreino).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const precisaTreinar = diasDesdeUltimo !== null && diasDesdeUltimo >= 3;

  return (
    <>
      {/* Confetti celebration */}
      <CelebracaoConfetti
        ativo={mostrarConfetti}
        quantidade={30}
        duracao={1500}
        aoCompletar={() => setMostrarConfetti(false)}
      />

      {/* Container da linha com animações */}
      <div
        className={`
          relative flex items-center gap-3 py-3 px-4
          transition-all duration-200 ease-out
          ${hover ? "bg-superficie-suave" : ""}
          ${pendente ? "animate-pulse-subtle" : ""}
        `}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Glow effect no hover */}
        {hover && (
          <div className="absolute inset-0 bg-acento-suave/30 rounded-[10px] -z-10 transition-opacity duration-200" />
        )}

        {/* Ícone com animação no hover */}
        <div
          className={`
            flex-shrink-0 w-9 h-9 rounded-[8px]
            bg-acento-suave flex items-center justify-center text-texto-primario
            transition-all duration-200 ease-out
            ${hover ? "scale-110 rotate-3" : "scale-100 rotate-0"}
            ${pendente ? "ring-2 ring-amber-400/50" : ""}
          `}
        >
          <IconeFicha nome={ficha.icone} tamanho={18} emoji={ficha.emoji} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-texto-primario leading-tight font-display truncate">
              {ficha.nome}
            </h3>
            <span className="flex-shrink-0 text-xs text-texto-sutil tabular-nums">
              {ficha.exercicios.length} exerc.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {gruposMusculares.map((grupo) => (
              <Chip key={grupo} rotulo={grupo} />
            ))}
            {ultimoTreino && (
              <span
                className={`
                  text-[11px] ml-0.5 transition-colors duration-200
                  ${precisaTreinar ? "text-amber-600 font-medium" : "text-texto-sutil"}
                `}
              >
                · {formatarDataRelativa(ultimoTreino, agoraMs)}
                {precisaTreinar && " 💪"}
              </span>
            )}
          </div>
        </div>

        {/* Botão iniciar com micro-interações */}
        <button
          onClick={handleIniciar}
          className={`
            flex-shrink-0 flex items-center gap-1.5
            h-[34px] pl-3 pr-3.5 rounded-[8px]
            transition-all duration-200 ease-out
            cursor-pointer relative overflow-hidden group
            ${pendente
              ? "bg-acento text-texto-invertido hover:bg-acento-hover shadow-md"
              : "bg-transparent border border-borda-suave text-texto-secundario hover:border-borda hover:bg-acento-suave/50 hover:text-texto-primario"
            }
            active:scale-[0.95]
          `}
        >
          {/* Ripple effect container */}
          <span className="absolute inset-0 overflow-hidden rounded-[8px]">
            <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </span>

          <Icone
            nome="reproduzir"
            tamanho={13}
            className={pendente ? "animate-pulse" : ""}
          />
          <span className="relative z-10">Iniciar</span>
        </button>
      </div>
    </>
  );
}
