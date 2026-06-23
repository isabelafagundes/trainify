import type { RegistroTreino } from "@/domain/tipos";

const marcos = [3, 7, 14, 21, 30, 60, 100];
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function mensagemSequencia(streak: number): string {
  return streak === 0
    ? "Comece sua sequência hoje"
    : streak < 3
      ? "Sequência começando..."
      : streak < 7
        ? "Mandando bem!"
        : streak < 14
          ? "Semana completa!"
          : streak < 30
            ? "Imparável!"
            : "Lendário!";
}

function toISODateLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function obterProximoMarcoSequencia(streak: number): {
  marcoAnterior: number;
  proximoMarco: number;
  diasRestantes: number;
  progresso: number;
} {
  const valor = Math.max(0, Math.floor(streak));
  const proximoMarco = marcos.find((marco) => marco > valor)
    ?? (Math.floor(valor / 50) + 1) * 50;
  const marcoAnterior = [...marcos].reverse().find((marco) => marco <= valor)
    ?? (valor > 100 ? Math.floor(valor / 50) * 50 : 0);
  const intervalo = proximoMarco - marcoAnterior;
  return {
    marcoAnterior,
    proximoMarco,
    diasRestantes: proximoMarco - valor,
    progresso: intervalo > 0 ? (valor - marcoAnterior) / intervalo : 0,
  };
}

export function construirDiasSequencia(
  historico: RegistroTreino[],
  diasJanela: number,
  hoje: Date = new Date(),
): Array<{ iso: string; diaSemana: string; diaMes: number; treinou: boolean; ehHoje: boolean }> {
  const diasComTreino = new Set(historico.map((registro) => toISODateLocal(new Date(registro.iniciadoEm))));
  const totalDias = Math.max(0, Math.floor(diasJanela));
  return Array.from({ length: totalDias }, (_, indice) => {
    const data = new Date(hoje);
    data.setHours(0, 0, 0, 0);
    data.setDate(data.getDate() - (totalDias - 1 - indice));
    const iso = toISODateLocal(data);
    return {
      iso,
      diaSemana: diasSemana[data.getDay()],
      diaMes: data.getDate(),
      treinou: diasComTreino.has(iso),
      ehHoje: indice === totalDias - 1,
    };
  });
}
