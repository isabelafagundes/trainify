interface BarraProgressoExerciciosProps {
  total: number;
  indiceAtual: number;
  concluidos: boolean[];
  aoIrPara: (indice: number) => void;
}

export function BarraProgressoExercicios({
  total,
  indiceAtual,
  concluidos,
  aoIrPara,
}: BarraProgressoExerciciosProps) {
  return (
    <div className="sticky top-[calc(65px+var(--safe-top))] z-10 bg-fundo/95 px-4 pb-3 pt-1 backdrop-blur">
      <div className="flex items-center gap-1.5" aria-label="Progresso dos exercícios">
        {Array.from({ length: total }, (_, indice) => {
          const ativo = indice === indiceAtual;
          const concluido = concluidos[indice];
          return (
            <button
              key={indice}
              type="button"
              aria-label={`Ir para exercício ${indice + 1}`}
              onClick={() => aoIrPara(indice)}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                concluido
                  ? "bg-texto-primario"
                  : ativo
                    ? "bg-acento-suave ring-1 ring-texto-primario/20 animate-pulse-subtle"
                    : "bg-borda-suave"
              }`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs tabular-nums text-texto-secundario">
        {indiceAtual + 1} / {total}
      </p>
    </div>
  );
}
