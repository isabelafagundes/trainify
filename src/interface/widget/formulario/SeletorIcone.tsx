/* ═══════════════════════════════════════════
   Seletor de Ícone/Emoji — Fichas
   ═══════════════════════════════════════════ */

import { emojisPopulares } from "@/interface/util/emoji-treino";

interface SeletorIconeProps {
  valor: string | null;
  aoAlterar: (valor: string) => void;
}

export function SeletorIcone({ valor, aoAlterar }: SeletorIconeProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-texto-primario">
        Ícone da ficha
      </label>

      {/* Grid de emojis */}
      <div className="grid grid-cols-8 gap-2 pt-2">
        {emojisPopulares.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => aoAlterar(emoji)}
            aria-label={`Selecionar emoji ${emoji}`}
            className={`
              relative w-full aspect-square
              bg-superficie border border-borda
              rounded-lg
              flex items-center justify-center
              text-2xl
              transition-all duration-200 ease-out
              hover:scale-105 hover:bg-superficie-suave
              focus:outline-none focus:ring-2 focus:ring-acento focus:ring-offset-2
              ${valor === emoji
                ? "ring-2 ring-offset-2 ring-acento bg-acento-suave"
                : ""
              }
            `}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Preview */}
      {valor && (
        <div className="flex items-center gap-2 px-3 py-2 bg-superficie-suave rounded-lg">
          <span className="text-2xl">{valor}</span>
          <span className="text-sm text-texto-secundario">
            Emoji selecionado
          </span>
        </div>
      )}
    </div>
  );
}
