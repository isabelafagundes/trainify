import { useEffect, useState } from "react";

/** Receita canônica de campo numérico "caixa preenchida" — usada pelo
    CampoNumerico (variante "caixa") e por inputs numéricos crus que não
    podem usar o componente (valores opcionais, formatos especiais). */
export const CLASSES_CAMPO_CAIXA = `
  h-10 w-full rounded-[10px] border border-borda bg-superficie-suave px-2
  text-center text-base font-semibold tabular-nums text-texto-primario
  focus:border-acento focus:outline-none
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
  const [texto, setTexto] = useState(String(valor));

  useEffect(() => {
    setTexto(String(valor));
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
    const proximoTexto = evento.target.value.replace(",", ".");
    setTexto(proximoTexto);

    if (proximoTexto === "" || proximoTexto === "-") return;

    const proximoValor = decimal ? Number(proximoTexto) : parseInt(proximoTexto, 10);
    if (Number.isFinite(proximoValor)) {
      aoAlterar(proximoValor);
    }
  }

  function aoSairDoCampo() {
    const valorDigitado = decimal ? Number(texto) : parseInt(texto, 10);

    if (!Number.isFinite(valorDigitado)) {
      setTexto(String(valor));
      return;
    }

    const valorNormalizado = normalizar(valorDigitado);
    setTexto(String(valorNormalizado));
    aoAlterar(valorNormalizado);
  }

  return (
    <input
      type="number"
      value={texto}
      min={minimo}
      max={maximo}
      step={passo}
      inputMode={decimal ? "decimal" : "numeric"}
      aria-label={ariaLabel}
      onChange={aoMudar}
      onBlur={aoSairDoCampo}
      className={`${variante === "caixa" ? CLASSES_CAMPO_CAIXA : ""} ${className ?? ""}`}
    />
  );
}
