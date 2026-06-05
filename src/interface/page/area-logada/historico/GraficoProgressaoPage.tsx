import type { Exercicio, RegistroTreino } from "@/domain/tipos";
import { GraficoProgressao } from "@/interface/widget/grafico/GraficoProgressao";

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
  return (
    <div className="px-5 py-4">
      <GraficoProgressao exercicioId={exercicioId} exercicios={exercicios} historico={historico} />
    </div>
  );
}
