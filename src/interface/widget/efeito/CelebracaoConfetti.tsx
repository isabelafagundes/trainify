import { useEffect, useState } from "react";

interface Particula {
  id: number;
  x: number;
  y: number;
  rotacao: number;
  cor: string;
  velocidadeX: number;
  velocidadeY: number;
  rotacaoVel: number;
}

interface PropriedadesCelebracaoConfetti {
  ativo: boolean;
  duracao?: number;
  quantidade?: number;
  aoCompletar?: () => void;
}

const cores = [
  "oklch(0.65 0.18 45)",   // Laranja vibrante
  "oklch(0.55 0.20 35)",   // Amarelo quente
  "oklch(0.50 0.18 25)",   // Dourado
  "oklch(0.60 0.15 55)",   // Âmbar
  "oklch(0.70 0.12 65)",   // Creme escuro
];

export function CelebracaoConfetti({
  ativo,
  duracao = 2000,
  quantidade = 50,
  aoCompletar,
}: PropriedadesCelebracaoConfetti) {
  const [particulas, setParticulas] = useState<Particula[]>([]);

  useEffect(() => {
    if (ativo) {
      const timerInicio = setTimeout(() => {
        const novasParticulas: Particula[] = Array.from({ length: quantidade }, (_, i) => ({
          id: i,
          x: 50,
          y: 50,
          rotacao: Math.random() * 360,
          cor: cores[Math.floor(Math.random() * cores.length)],
          velocidadeX: (Math.random() - 0.5) * 40,
          velocidadeY: -Math.random() * 30 - 20,
          rotacaoVel: (Math.random() - 0.5) * 720,
        }));

        setParticulas(novasParticulas);
      }, 0);

      // Limpar após duração
      const timer = setTimeout(() => {
        setParticulas([]);
        aoCompletar?.();
      }, duracao);

      return () => {
        clearTimeout(timerInicio);
        clearTimeout(timer);
      };
    } else {
      const timerLimpeza = setTimeout(() => setParticulas([]), 0);
      return () => clearTimeout(timerLimpeza);
    }
  }, [ativo, quantidade, duracao, aoCompletar]);

  if (!ativo || particulas.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {particulas.map((p) => (
          <g key={p.id}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from={`${p.x} ${p.y}`}
              to={`${p.x + p.velocidadeX} ${p.y + p.velocidadeY + 80}`}
              dur={`${duracao}ms`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.25 0.1 0.25 1"
            />
            <rect
              x="-2"
              y="-0.5"
              width="4"
              height="1"
              fill={p.cor}
              opacity="0.9"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to={p.rotacaoVel.toString()}
                dur={`${duracao}ms`}
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="0.9"
                to="0"
                dur={`${duracao}ms`}
                fill="freeze"
              />
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
}
