import { describe, expect, it } from "vitest";
import { formatarNumeroBR, parseNumeroBR, textoDecimalBR } from "./numero";

describe("utilitários de número em pt-BR", () => {
  it("formata decimais com vírgula e a precisão solicitada", () => {
    expect(formatarNumeroBR(2.5, 2)).toBe("2,50");
    expect(formatarNumeroBR(0.5)).toBe("0,5");
    expect(formatarNumeroBR(-1.25, 2)).toBe("-1,25");
  });

  it("não acrescenta casas decimais a inteiros", () => {
    expect(formatarNumeroBR(12, 2)).toBe("12");
  });

  it("converte valores de inputs com vírgula ou ponto", () => {
    expect(parseNumeroBR("2,5")).toBe(2.5);
    expect(parseNumeroBR("2.5")).toBe(2.5);
    expect(textoDecimalBR(2.5)).toBe("2,5");
  });
});
