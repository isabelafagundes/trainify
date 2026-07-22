import { useEffect, useRef, useState } from "react";

interface PropriedadesTextoLetreiro {
  texto: string;
  className?: string;
}

/**
 * Mantém o texto parado quando há espaço e ativa um letreiro contínuo somente
 * quando o conteúdo ultrapassa a largura disponível.
 */
export function TextoLetreiro({ texto, className = "" }: PropriedadesTextoLetreiro) {
  const recipienteRef = useRef<HTMLSpanElement>(null);
  const textoRef = useRef<HTMLSpanElement>(null);
  const [temOverflow, setTemOverflow] = useState(false);

  useEffect(() => {
    const recipiente = recipienteRef.current;
    const elementoTexto = textoRef.current;
    if (!recipiente || !elementoTexto) return;

    const atualizarOverflow = () => {
      setTemOverflow(elementoTexto.scrollWidth > recipiente.clientWidth + 1);
    };

    const frame = requestAnimationFrame(atualizarOverflow);
    const observador = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(atualizarOverflow);

    if (observador) {
      observador.observe(recipiente);
      observador.observe(elementoTexto);
    } else {
      window.addEventListener("resize", atualizarOverflow);
    }

    return () => {
      cancelAnimationFrame(frame);
      observador?.disconnect();
      window.removeEventListener("resize", atualizarOverflow);
    };
  }, [texto]);

  return (
    <span
      ref={recipienteRef}
      className={`block min-w-0 overflow-hidden whitespace-nowrap ${temOverflow ? "texto-letreiro-com-fade" : ""} ${className}`}
      title={temOverflow ? texto : undefined}
    >
      <span className={temOverflow ? "flex w-max items-center animate-texto-letreiro" : "block"}>
        <span ref={textoRef} className="inline-block">{texto}</span>
        {temOverflow && (
          <>
            <span className="mx-1" aria-hidden="true">·</span>
            <span aria-hidden="true">{texto}</span>
            <span className="mx-1" aria-hidden="true">·</span>
          </>
        )}
      </span>
    </span>
  );
}
