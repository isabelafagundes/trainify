import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTimerDescanso } from "./useTimerDescanso";

describe("useTimerDescanso", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formata o tempo inicial", () => {
    const { result } = renderHook(() => useTimerDescanso(75));

    expect(result.current.segundosRestantes).toBe(75);
    expect(result.current.tempoFormatado).toBe("1:15");
    expect(result.current.rodando).toBe(false);
  });

  it("inicia, decrementa a cada segundo e para em zero", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTimerDescanso(2));

    act(() => result.current.iniciar());
    expect(result.current.rodando).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.segundosRestantes).toBe(1);
    expect(result.current.tempoFormatado).toBe("0:01");

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.segundosRestantes).toBe(0);
    expect(result.current.rodando).toBe(false);
  });

  it("pausa e retoma preservando o tempo restante", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTimerDescanso(5));

    act(() => result.current.iniciar());
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.pausar());

    expect(result.current.segundosRestantes).toBe(3);
    expect(result.current.rodando).toBe(false);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.segundosRestantes).toBe(3);

    act(() => result.current.alternar());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.segundosRestantes).toBe(2);
  });

  it("reseta e reinicia a partir dos segundos iniciais", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTimerDescanso(10));

    act(() => result.current.iniciar());
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.resetar());

    expect(result.current.segundosRestantes).toBe(10);
    expect(result.current.rodando).toBe(false);

    act(() => result.current.reiniciar());
    expect(result.current.segundosRestantes).toBe(10);
    expect(result.current.rodando).toBe(true);
  });

  it("sincroniza quando os segundos iniciais mudam", () => {
    vi.useFakeTimers();
    const { rerender, result } = renderHook(
      ({ segundos }) => useTimerDescanso(segundos),
      { initialProps: { segundos: 30 } },
    );

    act(() => result.current.iniciar());
    act(() => vi.advanceTimersByTime(5000));
    rerender({ segundos: 45 });

    expect(result.current.segundosRestantes).toBe(45);
    expect(result.current.rodando).toBe(false);
    expect(result.current.tempoFormatado).toBe("0:45");
  });
});
