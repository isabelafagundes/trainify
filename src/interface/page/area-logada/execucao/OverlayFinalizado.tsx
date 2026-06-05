import { useEffect, useMemo } from "react";

interface OverlayFinalizadoProps {
  aberto: boolean;
  aoConcluir: () => void;
}

const CORES_CONFETE = [
  "oklch(0.75 0.15 70)",
  "oklch(0.65 0.18 40)",
  "oklch(0.80 0.12 90)",
  "oklch(0.45 0.10 55)",
  "oklch(0.70 0.14 25)",
];

interface PecaConfete {
  esquerda: number;
  atraso: number;
  deriva: number;
  giro: number;
  cor: string;
  largura: number;
  altura: number;
  redondo: boolean;
}

function gerarConfetes(quantidade: number): PecaConfete[] {
  return Array.from({ length: quantidade }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = (n: number) => ((seed * (n + 1)) % 1000) / 1000;
    return {
      esquerda: r(1) * 100,
      atraso: r(2) * 1.2,
      deriva: (r(3) - 0.5) * 120,
      giro: 180 + r(4) * 240,
      cor: CORES_CONFETE[i % CORES_CONFETE.length],
      largura: 5 + r(5) * 5,
      altura: 7 + r(6) * 6,
      redondo: r(7) > 0.6,
    };
  });
}

export function OverlayFinalizado({ aberto, aoConcluir }: OverlayFinalizadoProps) {
  const confetes = useMemo(() => gerarConfetes(28), []);

  useEffect(() => {
    if (!aberto) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([40, 60, 40]);
    }
    const id = window.setTimeout(aoConcluir, 2600);
    return () => window.clearTimeout(id);
  }, [aberto, aoConcluir]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-fundo animate-fade-in">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {confetes.map((peca, i) => (
          <span
            key={i}
            className="animate-confetti absolute top-0"
            style={{
              left: `${peca.esquerda}%`,
              width: `${peca.largura}px`,
              height: `${peca.altura}px`,
              backgroundColor: peca.cor,
              borderRadius: peca.redondo ? "9999px" : "2px",
              animationDelay: `${peca.atraso}s`,
              ["--confetti-drift" as string]: `${peca.deriva}px`,
              ["--confetti-spin" as string]: `${peca.giro}deg`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <span className="text-7xl animate-check-bounce" aria-hidden="true">
          💪
        </span>
        <h2 className="font-display text-2xl font-semibold text-texto-primario slide-in-from-top-2">
          Treino finalizado!
        </h2>
        <p className="text-sm text-texto-secundario slide-in-from-top-2" style={{ animationDelay: "0.1s" }}>
          Bom trabalho.
        </p>
      </div>
    </div>
  );
}
