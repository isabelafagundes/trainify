import type { Exercicio, Ficha } from "@/domain/tipos";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { Botao } from "@/interface/widget/botao/Botao";
import { extrairGruposMusculares } from "@/interface/page/area-logada/programa/utils";

interface PropriedadesFichaExpansivel {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  expandida: boolean;
  aoAlternar: () => void;
  aoIniciarTreino: (fichaId: string) => void;
  /** Opcional: quando presente, revela "Editar ficha" no preview expandido e
      navega para a edição individual. Ausente (ex.: home) = sem ação de editar. */
  aoEditar?: (fichaId: string) => void;
}

/**
 * Linha de ficha que revela inline o preview dos exercícios (séries × reps)
 * e cardio ao ser tocada. A área de informação alterna a expansão; o botão
 * "Iniciar" permanece independente para começar o treino.
 */
export function FichaExpansivel({
  ficha,
  exerciciosCatalogo,
  expandida,
  aoAlternar,
  aoIniciarTreino,
  aoEditar,
}: PropriedadesFichaExpansivel) {
  const gruposMusculares = extrairGruposMusculares(ficha.exercicios, exerciciosCatalogo);
  const semConteudo = ficha.exercicios.length === 0 && ficha.cardio.length === 0;

  function nomeExercicio(exercicioId: string): string {
    return exerciciosCatalogo.find((e) => e.id === exercicioId)?.nome ?? "Exercício";
  }

  return (
    <div className={expandida ? "bg-superficie-suave/60" : ""}>
      {/* Cabeçalho: área de info alterna expansão + botão iniciar separado */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={aoAlternar}
          aria-expanded={expandida}
          className="flex flex-1 min-w-0 items-center gap-3 text-left rounded-lg -m-1 p-1 transition-colors duration-200 hover:bg-superficie-hover/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          <span className="flex-shrink-0 w-11 h-11 rounded-[10px] bg-acento-suave flex items-center justify-center text-texto-primario shadow-sm">
            <IconeFicha nome={ficha.icone} tamanho={24} emoji={ficha.emoji} />
          </span>

          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-texto-primario leading-tight font-display truncate">
                {ficha.nome}
              </span>
              <span className="flex-shrink-0 text-xs text-texto-secundario tabular-nums">
                {ficha.exercicios.length} exerc.
              </span>
            </span>
            {gruposMusculares.length > 0 && (
              <span className="block mt-1 truncate text-xs text-texto-sutil">
                {gruposMusculares.join(" · ")}
              </span>
            )}
          </span>

          <span
            className={`flex-shrink-0 text-texto-sutil transition-transform duration-300 ease-out ${expandida ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <Icone nome="setaBaixo" tamanho={16} />
          </span>
        </button>

        <Botao
          variante="fantasma"
          tamanho="compacto"
          icone={<Icone nome="reproduzir" tamanho={13} />}
          onClick={() => aoIniciarTreino(ficha.id)}
          className="flex-shrink-0 transition-transform duration-200 active:scale-95"
        >
          Iniciar
        </Botao>
      </div>

      {/* Preview animado (grid-template-rows 0fr → 1fr) */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expandida ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 pl-[68px]">
            {semConteudo ? (
              <p className="py-2 text-xs text-texto-sutil">
                Nenhum exercício adicionado a esta ficha ainda.
              </p>
            ) : (
              <ul className="space-y-1.5 pt-1">
                {ficha.exercicios.map((ef, i) => (
                  <li
                    key={`${ef.exercicioId}-${i}`}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="min-w-0 truncate text-sm text-texto-secundario">
                      {nomeExercicio(ef.exercicioId)}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-xs font-medium tabular-nums text-texto-primario">
                        {ef.series} × {ef.repeticoes}
                      </span>
                      {ef.usaCarga && (
                        <span className="rounded-full bg-acento-suave px-2 py-0.5 text-[10px] font-medium text-texto-secundario">
                          carga
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {ficha.cardio.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="min-w-0 truncate text-sm text-texto-secundario">
                      {c.tipo}
                    </span>
                    <span className="flex-shrink-0 text-xs font-medium tabular-nums text-texto-primario">
                      {c.duracaoMinutos} min
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {expandida && aoEditar && (
              <div className="mt-3 flex justify-end">
                <Botao
                  variante="fantasma"
                  tamanho="compacto"
                  icone={<Icone nome="editar" tamanho={13} />}
                  onClick={() => aoEditar(ficha.id)}
                  className="transition-transform duration-200 active:scale-95"
                >
                  Editar ficha
                </Botao>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
