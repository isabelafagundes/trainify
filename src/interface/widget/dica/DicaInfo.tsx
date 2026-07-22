import { useEffect, useRef, useState, type ReactNode } from "react";

interface PropriedadesDicaInfo {
  /** Conteúdo explicativo exibido no popover. */
  children: ReactNode;
  /** Rótulo acessível do gatilho (ex.: "Como o volume é calculado"). */
  rotulo: string;
}

/**
 * Gatilho "?" com dica em popover. Aparece no hover (desktop) e no foco por
 * teclado via CSS; no toque (mobile) abre/fecha por tap, com estado. Fecha ao
 * pressionar Esc ou clicar fora. O popover é puramente informativo (role
 * tooltip) — não deve conter ações.
 */
export function DicaInfo({ children, rotulo }: PropriedadesDicaInfo) {
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const aoClicarFora = (evento: MouseEvent) => {
      if (!wrapperRef.current?.contains(evento.target as Node)) setAberto(false);
    };
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };

    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <span ref={wrapperRef} className="group relative inline-flex">
      <button
        type="button"
        aria-label={rotulo}
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-borda text-[10px] font-semibold leading-none text-texto-sutil transition-colors hover:border-borda-forte hover:text-texto-secundario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        ?
      </button>

      <span
        role="tooltip"
        className={`absolute left-0 top-full z-30 mt-2 w-64 rounded-[10px] border border-borda bg-superficie-elevada p-3 text-xs font-normal leading-relaxed text-texto-secundario shadow-lg shadow-black/10 ${
          aberto ? "block" : "hidden"
        } group-hover:block group-focus-within:block`}
      >
        {children}
      </span>
    </span>
  );
}
