import { useEffect, useState } from "react";

interface CampoNumericoProps {
  valor: number;
  aoAlterar: (valor: number) => void;
  minimo?: number;
  maximo?: number;
  passo?: number;
  decimal?: boolean;
  className?: string;
  ariaLabel?: string;
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
      className={className}
    />
  );
}
