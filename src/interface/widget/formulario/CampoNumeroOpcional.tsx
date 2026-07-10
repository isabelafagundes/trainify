import { useEffect, useState } from "react";
import { parseNumeroBR, textoDecimalBR } from "@/interface/util/numero";
import { CLASSES_CAMPO_CAIXA } from "./CampoNumerico";

interface CampoNumeroOpcionalProps {
  /** `undefined` = campo vazio (métrica não preenchida). */
  valor: number | undefined;
  aoAlterar: (valor: number | undefined) => void;
  decimal?: boolean;
  passo?: number;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

/** Input numérico opcional no padrão BR (vírgula decimal). Igual ao
 *  CampoNumerico, mas representa "vazio" como `undefined` em vez de `0` —
 *  usado nas métricas de cardio, que podem ficar em branco. Mantém um buffer
 *  de texto local pra preservar estados intermediários como "12," enquanto o
 *  usuário digita a parte decimal. */
export function CampoNumeroOpcional({
  valor,
  aoAlterar,
  decimal = false,
  passo,
  placeholder,
  className,
  ariaLabel,
}: CampoNumeroOpcionalProps) {
  const [texto, setTexto] = useState(valor === undefined ? "" : textoDecimalBR(valor));

  useEffect(() => {
    setTexto(valor === undefined ? "" : textoDecimalBR(valor));
  }, [valor]);

  function aoMudar(evento: React.ChangeEvent<HTMLInputElement>) {
    const proximoTexto = evento.target.value;
    setTexto(proximoTexto);

    if (proximoTexto === "") {
      aoAlterar(undefined);
      return;
    }

    const proximo = decimal
      ? parseNumeroBR(proximoTexto)
      : parseInt(proximoTexto.replace(",", "."), 10);
    if (Number.isFinite(proximo)) {
      aoAlterar(proximo);
    }
  }

  return (
    <input
      type="text"
      value={texto}
      step={passo}
      inputMode={decimal ? "decimal" : "numeric"}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={aoMudar}
      className={className ?? CLASSES_CAMPO_CAIXA}
    />
  );
}
