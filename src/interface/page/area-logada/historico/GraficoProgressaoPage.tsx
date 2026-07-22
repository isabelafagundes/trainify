import { useMemo, useState } from "react";
import { calcularProgressaoCompartilhavel } from "@/application/compartilhamento/calcular-progressao-exercicio";
import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { Botao } from "@/interface/widget/botao/Botao";
import { GraficoProgressao } from "@/interface/widget/grafico/GraficoProgressao";
import { Icone } from "@/interface/widget/svg/Icone";
import { OverlayCompartilharProgressao } from "./OverlayCompartilharProgressao";

interface GraficoProgressaoPageProps {
  exercicioId: string;
  exercicios: Exercicio[];
  historico: RegistroTreino[];
}

export function GraficoProgressaoPage({
  exercicioId,
  exercicios,
  historico,
}: GraficoProgressaoPageProps) {
  const [compartilhando, setCompartilhando] = useState(false);
  const progressao = useMemo(
    () => calcularProgressaoCompartilhavel(exercicioId, exercicios, historico),
    [exercicioId, exercicios, historico],
  );
  const podeCompartilhar = (progressao?.pontos.length ?? 0) >= 2;

  return (
    <div className="px-5 py-4">
      <GraficoProgressao exercicioId={exercicioId} exercicios={exercicios} historico={historico} />
      {podeCompartilhar ? (
        <Botao
          ocuparLarguraTotal
          className="mt-4"
          icone={<Icone nome="compartilhar" tamanho={17} />}
          onClick={() => setCompartilhando(true)}
        >
          Compartilhar minha evolução
        </Botao>
      ) : null}

      {progressao ? (
        <OverlayCompartilharProgressao
          aberto={compartilhando}
          progressao={progressao}
          aoFechar={() => setCompartilhando(false)}
        />
      ) : null}
    </div>
  );
}
