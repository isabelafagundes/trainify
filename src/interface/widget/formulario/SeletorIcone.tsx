/* ═══════════════════════════════════════════
   Seletor de Ícone/Emoji — Fichas
   Na página, só o ícone selecionado ocupa espaço (tile + "Trocar ícone").
   A grade completa vive num pop-up, aberta sob demanda.
   ═══════════════════════════════════════════ */

import { useEffect } from "react";
import { emojisPopulares } from "@/interface/util/emoji-treino";
import { Icone } from "@/interface/widget/svg/Icone";

interface SeletorIconeProps {
  valor: string | null;
  aoAlterar: (valor: string) => void;
  aberto: boolean;
  aoAbrir: () => void;
  aoFechar: () => void;
}

export function SeletorIcone({ valor, aoAlterar, aberto, aoAbrir, aoFechar }: SeletorIconeProps) {
  // Fechar o pop-up ao pressionar Escape
  useEffect(() => {
    if (!aberto) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [aberto, aoFechar]);

  const emojiAtual = valor || "💪";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-sutil">
          Ícone da ficha
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={aoAbrir}
          aria-label="Trocar ícone da ficha"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] border border-borda bg-acento-suave text-3xl transition-colors hover:bg-superficie-hover"
        >
          {emojiAtual}
        </button>
        <button
          type="button"
          onClick={aoAbrir}
          className="inline-flex items-center gap-2 rounded-[10px] border border-borda bg-superficie px-3.5 py-2.5 text-sm font-medium text-texto-primario transition-colors hover:bg-superficie-suave"
        >
          <Icone nome="editar" tamanho={16} />
          Trocar ícone
        </button>
      </div>

      {/* Pop-up de seleção */}
      {aberto && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Escolher ícone"
          onClick={aoFechar}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" />

          <div
            className="relative w-full max-w-[350px] bg-superficie rounded-3xl shadow-xl border border-borda animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-borda-suave">
              <h3 className="text-lg font-semibold font-display text-texto-primario">
                Escolher ícone
              </h3>
              <button
                type="button"
                onClick={aoFechar}
                className="p-2 -mr-2 text-texto-secundario hover:text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <Icone nome="fechar" tamanho={20} />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2 p-4">
              {emojisPopulares.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    aoAlterar(emoji);
                    aoFechar();
                  }}
                  aria-label={`Selecionar emoji ${emoji}`}
                  className={`
                    aspect-square rounded-[10px] flex items-center justify-center text-2xl
                    transition-all duration-150
                    hover:scale-105 hover:bg-superficie-suave
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-acento
                    ${valor === emoji ? "bg-acento-suave ring-1.5 ring-acento" : ""}
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
