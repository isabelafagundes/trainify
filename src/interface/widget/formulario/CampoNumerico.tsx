import { useEffect, useState } from "react";
import { parseNumeroBR, textoDecimalBR } from "@/interface/util/numero";
import { CAMPO_BASE } from "./campo.tokens";

/** Variante "caixa" (número compacto) do campo canônico — usada pelo
    CampoNumerico e por inputs numéricos crus que não podem usar o componente
    (valores opcionais, formatos especiais). Herda contraste/borda/raio/foco de
    CAMPO_BASE; só adiciona o formato compacto e a remoção do stepper nativo. */
export const CLASSES_CAMPO_CAIXA = `
  ${CAMPO_BASE.trim()}
  h-10 w-full px-2 text-center text-base font-semibold tabular-nums
  [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
`;

interface CampoNumericoProps {
  valor: number;
  aoAlterar: (valor: number) => void;
  minimo?: number;
  maximo?: number;
  passo?: number;
  decimal?: boolean;
  className?: string;
  ariaLabel?: string;
  /** "caixa" aplica a receita canônica de caixa preenchida do design system. */
  variante?: "caixa";
}

export function CampoNumerico({
  valor,
  aoAlterar,
  minimo,
  maximo,
  passo,
  decimal = false,
  className,
  ariaLabel,
  variante,
}: CampoNumericoProps) {
  const [texto, setTexto] = useState(textoDecimalBR(valor));

  useEffect(() => {
    setTexto(textoDecimalBR(valor));
  }, [valor]);

  function normalizar(valorDigitado: number): number {
    let valorNormalizado = valorDigitado;

    if (minimo !== undefined && valorNormalizado < minimo) {
      valorNormalizado = minimo;
    }

    if (maximo !== undefined && valorNormalizado > maximo) {
      valorNormalizado = maximo;
    }

    return valorNormalizado;
  }

  function aoMudar(evento: React.ChangeEvent<HTMLInputElement>) {
    // Preserva o texto cru (ex.: "12," enquanto digita a parte decimal) —
    // parseNumeroBR aceita vírgula ou ponto.
    const proximoTexto = evento.target.value;
    setTexto(proximoTexto);

    if (proximoTexto === "" || proximoTexto === "-") return;

    const proximoValor = decimal
      ? parseNumeroBR(proximoTexto)
      : parseInt(proximoTexto.replace(",", "."), 10);
    if (Number.isFinite(proximoValor)) {
      aoAlterar(proximoValor);
    }
  }

  function aoSairDoCampo() {
    const valorDigitado = decimal
      ? parseNumeroBR(texto)
      : parseInt(texto.replace(",", "."), 10);

    if (!Number.isFinite(valorDigitado)) {
      setTexto(textoDecimalBR(valor));
      return;
    }

    const valorNormalizado = normalizar(valorDigitado);
    setTexto(textoDecimalBR(valorNormalizado));
    aoAlterar(valorNormalizado);
  }

  return (
    <input
      type="text"
      value={texto}
      // step é ignorado em type="text" (não há stepper nativo), mas mantém a
      // intenção declarada de passo e a compatibilidade da API do componente.
      step={passo}
      inputMode={decimal ? "decimal" : "numeric"}
      aria-label={ariaLabel}
      onChange={aoMudar}
      onBlur={aoSairDoCampo}
      className={`${variante === "caixa" ? CLASSES_CAMPO_CAIXA : ""} ${className ?? ""}`}
    />
  );
}
