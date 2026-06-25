import { useEffect } from "react";

interface ToastDesfazerProps {
  mensagem: string | null;
  aoDesfazer: () => void;
  aoFechar: () => void;
}

export function ToastDesfazer({ mensagem, aoDesfazer, aoFechar }: ToastDesfazerProps) {
  useEffect(() => {
    if (!mensagem) return;
    const id = window.setTimeout(aoFechar, 3000);
    return () => window.clearTimeout(id);
  }, [mensagem, aoFechar]);

  if (!mensagem) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-[max(calc(var(--safe-top)+16px),16px)] left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4"
    >
      <div className="pointer-events-auto mx-auto flex w-fit items-center gap-3 rounded-full border border-borda-suave bg-texto-primario px-4 py-2 text-sm text-texto-invertido shadow-md animate-fade-in">
        <span>{mensagem}</span>
        <button
          type="button"
          onClick={() => {
            aoDesfazer();
            aoFechar();
          }}
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          desfazer
        </button>
      </div>
    </div>
  );
}
