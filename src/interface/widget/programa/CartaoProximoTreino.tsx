import type { Exercicio, Ficha } from "@/domain/tipos";
import { exerciciosDaFicha } from "@/domain/ficha";
import { Icone, IconeFicha } from "@/interface/widget/svg/Icone";
import { extrairGruposMusculares } from "@/interface/page/area-logada/programa/utils";

interface PropriedadesCartaoProximoTreino {
  ficha: Ficha;
  exerciciosCatalogo: Exercicio[];
  aoIniciar: (fichaId: string) => void;
  aoEditar: (fichaId: string) => void;
}

/** Nº de itens exibidos no preview antes de resumir o restante. */
const MAX_PREVIEW = 6;

/**
 * Herói da tela: a próxima ficha a treinar, com preview dos exercícios e a
 * ação primária ("Iniciar <ficha>") nomeada — o usuário sabe exatamente o que
 * vai começar, sem o botão genérico "Iniciar treino" da versão anterior.
 */
export function CartaoProximoTreino({
  ficha,
  exerciciosCatalogo,
  aoIniciar,
  aoEditar,
}: PropriedadesCartaoProximoTreino) {
  const exerciciosFicha = exerciciosDaFicha(ficha);
  const grupos = extrairGruposMusculares(exerciciosFicha, exerciciosCatalogo);
  const itensPreview = ficha.itens.slice(0, MAX_PREVIEW);
  const restantes = ficha.itens.length - itensPreview.length;

  function nomeExercicio(exercicioId: string): string {
    return exerciciosCatalogo.find((e) => e.id === exercicioId)?.nome ?? "Exercício";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-borda bg-superficie shadow-sm shadow-black/[0.04]">
      <div className="p-4">
        {/* Cabeçalho do card: emoji + rótulo + nome + grupos */}
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-acento-suave text-texto-primario shadow-sm">
            <IconeFicha nome={ficha.icone} tamanho={30} emoji={ficha.emoji} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-grafico-forte">
              Próximo treino
            </p>
            <h3 className="mt-0.5 truncate font-display text-xl font-bold leading-tight text-texto-primario">
              {ficha.nome}
            </h3>
            <p className="mt-1 truncate text-[13px] text-texto-sutil">
              {exerciciosFicha.length} exerc.
              {grupos.length > 0 ? ` · ${grupos.join(" · ")}` : ""}
            </p>
          </div>
        </div>

        {/* Preview dos itens + acesso à edição da ficha */}
        <div className="mt-3.5 rounded-[10px] bg-superficie-suave px-3.5 py-2.5">
          {ficha.itens.length === 0 ? (
            <p className="py-1.5 text-[13px] text-texto-sutil">
              Nenhum exercício nesta ficha ainda.
            </p>
          ) : (
            itensPreview.map((item, i) => (
              <div
                key={item.tipo === "exercicio" ? `${item.exercicio.exercicioId}-${i}` : item.cardio.id}
                className={`flex items-baseline justify-between gap-3 py-1.5 ${
                  i > 0 ? "border-t border-borda" : ""
                }`}
              >
                {item.tipo === "exercicio" ? (
                  <>
                    <span className="min-w-0 truncate text-[13px] text-texto-secundario">
                      {nomeExercicio(item.exercicio.exercicioId)}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-texto-primario">
                        {item.exercicio.series} × {item.exercicio.repeticoes}
                      </span>
                      {item.exercicio.usaCarga && (
                        <span className="rounded-full bg-acento-suave px-2 py-0.5 text-[10px] font-medium text-texto-secundario">
                          carga
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 truncate text-[13px] text-texto-secundario">
                      {item.cardio.tipo}
                    </span>
                    <span className="flex-shrink-0 text-xs font-semibold tabular-nums text-texto-primario">
                      {item.cardio.duracaoMinutos} min
                    </span>
                  </>
                )}
              </div>
            ))
          )}

          <div className="mt-1 flex items-center justify-between border-t border-borda pt-2">
            <span className="text-[11px] text-texto-sutil">
              {restantes > 0 ? `+${restantes} ${restantes === 1 ? "item" : "itens"}` : ""}
            </span>
            <button
              type="button"
              onClick={() => aoEditar(ficha.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-texto-secundario transition-colors hover:text-texto-primario"
            >
              <Icone nome="editar" tamanho={13} /> Editar ficha
            </button>
          </div>
        </div>
      </div>

      {/* Ação primária: nomeada e rente à base do card */}
      <button
        type="button"
        onClick={() => aoIniciar(ficha.id)}
        className="flex w-full items-center justify-center gap-2 bg-acento py-4 font-semibold text-texto-invertido transition-all duration-200 hover:bg-acento-hover active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acento"
      >
        <Icone nome="reproduzir" tamanho={15} />
        Iniciar {ficha.nome}
      </button>
    </div>
  );
}
