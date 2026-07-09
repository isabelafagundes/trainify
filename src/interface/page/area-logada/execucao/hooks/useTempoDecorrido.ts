import { useEffect, useState } from "react";

function formatar(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const dois = (valor: number) => String(valor).padStart(2, "0");
  return horas > 0
    ? `${horas}:${dois(minutos)}:${dois(segundos)}`
    : `${minutos}:${dois(segundos)}`;
}

/** Tempo decorrido desde `iniciadoEm` (ISO), formatado `m:ss` / `h:mm:ss`,
    atualizado a cada segundo — alimenta a linha meta do header da execução. */
export function useTempoDecorrido(iniciadoEm: string): string {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const decorrido = Math.max(0, Math.floor((agora - new Date(iniciadoEm).getTime()) / 1000));
  return formatar(decorrido);
}
