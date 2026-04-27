/* ═══════════════════════════════════════════
   Seletor de Fichas — Programas
   ═══════════════════════════════════════════ */

import type { Ficha } from "@/domain/tipos";
import { Chip } from "@/interface/widget/chip/Chip";
import { emojisPorGrupoMuscular } from "@/interface/util/emoji-treino";

interface SeletorFichasProps {
  fichas: Ficha[];
  fichaIdsSelecionadas: string[];
  aoAlterarSelecao: (fichaId: string) => void;
  gruposPorFicha?: Record<string, string[]>;
  semTitulo?: boolean;
}

function obterEmojiDaFicha(ficha: Ficha): string {
  if (ficha.emoji) return ficha.emoji;
  return emojisPorGrupoMuscular.fullbody;
}

export function SeletorFichas({
  fichas,
  fichaIdsSelecionadas,
  aoAlterarSelecao,
  gruposPorFicha,
  semTitulo = false,
}: SeletorFichasProps) {
  const fichasOrdenadas = [...fichas].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  if (fichas.length === 0) {
    return (
      <div className="px-4 py-6 bg-superficie rounded-xl border border-borda text-center">
        <p className="text-sm text-texto-secundario">
          Nenhuma ficha criada ainda.
        </p>
        <p className="text-xs text-texto-sutil mt-1">
          Crie fichas primeiro para adicioná-las ao programa.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!semTitulo && (
        <label className="text-sm font-medium text-texto-primario">
          Fichas do programa
        </label>
      )}

      <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
        {fichasOrdenadas.map((ficha, index) => {
          const selecionada = fichaIdsSelecionadas.includes(ficha.id);
          const grupos = gruposPorFicha?.[ficha.id] || [];

          return (
            <label
              key={ficha.id}
              className={`
                flex items-center gap-3 px-4 py-3
                cursor-pointer
                transition-colors duration-150
                ${selecionada ? "bg-acento-suave/50" : "hover:bg-superficie-suave"}
                ${index < fichasOrdenadas.length - 1 ? "border-b border-borda-suave" : ""}
              `}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selecionada}
                onChange={() => aoAlterarSelecao(ficha.id)}
                className="sr-only"
              />

              {/* Indicador visual de seleção */}
              <div
                className={`
                  w-5 h-5 rounded-md border flex items-center justify-center
                  transition-all duration-150
                  ${selecionada
                    ? "bg-acento border-acento"
                    : "border-borda hover:border-acento"
                  }
                `}
              >
                {selecionada && (
                  <svg
                    className="w-3 h-3 text-texto-invertido"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Ícone/Emoji */}
              <div className="w-10 h-10 rounded-lg bg-acento-suave flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{obterEmojiDaFicha(ficha)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-texto-primario truncate">
                  {ficha.nome}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-texto-secundario">
                    {ficha.exercicios.length} exercício(s)
                  </p>
                  {grupos.length > 0 && (
                    <>
                      <span className="text-texto-sutil">•</span>
                      <div className="flex gap-1 flex-wrap">
                        {grupos.slice(0, 2).map((grupo) => (
                          <Chip key={grupo} rotulo={grupo} tamanho="pequeno" />
                        ))}
                        {grupos.length > 2 && (
                          <span className="text-xs text-texto-sutil">
                            +{grupos.length - 2}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {fichaIdsSelecionadas.length > 0 && (
        <p className="text-xs text-texto-secundario">
          {fichaIdsSelecionadas.length} ficha(s) selecionada(s)
        </p>
      )}
    </div>
  );
}
