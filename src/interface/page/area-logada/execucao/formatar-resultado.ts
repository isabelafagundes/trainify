export function formatarDuracaoTreino(segundos: number) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return horas ? `${horas}h ${minutos}min` : `${Math.max(1, minutos)} min`;
}
