import { describe, expect, it } from "vitest";
import { obterProximoMarcoSequencia } from "./utils";

describe("sequencia utils", () => {
  it.each([
    [0, 0, 3, 3, 0],
    [1, 0, 3, 2, 1 / 3],
    [6, 3, 7, 1, 3 / 4],
    [7, 7, 14, 7, 0],
    [100, 100, 150, 50, 0],
    [126, 100, 150, 24, 26 / 50],
  ])("calcula o próximo marco para streak %i", (streak, marcoAnterior, proximoMarco, diasRestantes, progresso) => {
    expect(obterProximoMarcoSequencia(streak)).toEqual({ marcoAnterior, proximoMarco, diasRestantes, progresso });
  });
});
