import type { ReactNode } from "react";

interface PropriedadesDicaDiscreta {
  children: ReactNode;
  aoClicar?: () => void;
}

/**
 * Dica discreta e não pressionante
 * Uma lembrete sutil de que algo existe, sem CTA agressivo
 * Estilo Notion-like: mínimo, respeitoso, fácil de ignorar
 */
export function DicaDiscreta({ children, aoClicar }: PropriedadesDicaDiscreta) {
  return (
    <div
      className={`
        flex items-center gap-2
        py-2 px-3 -mx-3
        rounded-lg
        transition-colors duration-200 ease-out
        ${aoClicar
          ? "cursor-pointer hover:bg-superficie-suave active:bg-superficie-hover"
          : ""
        }
      `}
      onClick={aoClicar}
    >
      {/* Bullet point discreto */}
      <span className="flex-shrink-0 w-1 h-1 rounded-full bg-texto-sutil/40" />

      {/* Texto da dica */}
      <span className="text-xs text-texto-sutil leading-relaxed">
        {children}
      </span>

      {/* Link indicador (se clicável) */}
      {aoClicar && (
        <span className="text-xs text-texto-sutil/60 hover:text-texto-sutil transition-colors">
          →
        </span>
      )}
    </div>
  );
}
