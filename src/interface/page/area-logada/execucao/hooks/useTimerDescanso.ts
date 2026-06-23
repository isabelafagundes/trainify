import { useCallback, useEffect, useMemo, useState } from "react";

export function useTimerDescanso(segundosIniciais: number) {
  const [estado, setEstado] = useState({
    base: segundosIniciais,
    segundosRestantes: segundosIniciais,
    rodando: false,
  });

  const sincronizado = estado.base === segundosIniciais;
  const segundosRestantes = sincronizado ? estado.segundosRestantes : segundosIniciais;
  const rodando = sincronizado ? estado.rodando : false;

  useEffect(() => {
    if (!rodando || segundosRestantes <= 0) {
      return;
    }

    const id = window.setInterval(() => {
      setEstado((atual) => {
        if (atual.base !== segundosIniciais) return atual;
        const proximo = Math.max(0, atual.segundosRestantes - 1);
        return {
          ...atual,
          segundosRestantes: proximo,
          rodando: proximo > 0,
        };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [rodando, segundosIniciais, segundosRestantes]);

  const iniciar = useCallback(
    () =>
      setEstado({
        base: segundosIniciais,
        segundosRestantes,
        rodando: true,
      }),
    [segundosIniciais, segundosRestantes]
  );
  const pausar = useCallback(
    () =>
      setEstado({
        base: segundosIniciais,
        segundosRestantes,
        rodando: false,
      }),
    [segundosIniciais, segundosRestantes]
  );
  const alternar = useCallback(
    () =>
      setEstado(() => {
        const vaiIniciar = !rodando;
        // Ao dar play com o tempo zerado, reinicia o descanso do começo.
        const restantes =
          vaiIniciar && segundosRestantes <= 0 ? segundosIniciais : segundosRestantes;
        return {
          base: segundosIniciais,
          segundosRestantes: restantes,
          rodando: vaiIniciar,
        };
      }),
    [rodando, segundosIniciais, segundosRestantes]
  );
  const resetar = useCallback(() => {
    setEstado({
      base: segundosIniciais,
      segundosRestantes: segundosIniciais,
      rodando: false,
    });
  }, [segundosIniciais]);
  const reiniciar = useCallback(() => {
    setEstado({
      base: segundosIniciais,
      segundosRestantes: segundosIniciais,
      rodando: true,
    });
  }, [segundosIniciais]);

  const tempoFormatado = useMemo(() => {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    return `${minutos}:${String(segundos).padStart(2, "0")}`;
  }, [segundosRestantes]);

  return {
    segundosRestantes,
    tempoFormatado,
    rodando,
    iniciar,
    pausar,
    alternar,
    resetar,
    reiniciar,
  };
}
