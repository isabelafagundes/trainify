import type { RegistroCardio } from "@/domain/tipos";
import { CampoNumerico } from "@/interface/widget/formulario/CampoNumerico";
import { Icone } from "@/interface/widget/svg/Icone";

interface PainelCardioProps {
  cardio: RegistroCardio[];
  cardioConcluido: Set<string>;
  aoAtualizarCardio: (
    id: string,
    atualizacao: Partial<Pick<RegistroCardio, "duracaoMinutos" | "nota">>
  ) => void;
  aoConcluirCardio: (id: string) => void;
  aoVoltarMusculacao: () => void;
  aoFinalizar: () => void;
}

export function PainelCardio({
  cardio,
  cardioConcluido,
  aoAtualizarCardio,
  aoConcluirCardio,
  aoVoltarMusculacao,
  aoFinalizar,
}: PainelCardioProps) {
  return (
    <main className="min-h-[calc(100dvh-65px)] px-4 pb-6 pt-8">
      <div className="mb-8">
        <h1 className="font-display text-[clamp(32px,9vw,40px)] font-semibold leading-none text-texto-primario">
          Cardio
        </h1>
      </div>

      <div className="space-y-3">
        {cardio.map((item) => {
          const concluido = cardioConcluido.has(item.cardioId);
          return (
          <section key={item.cardioId} className="rounded-[8px] border border-borda-suave bg-superficie px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-texto-primario">{item.tipo}</h2>
              <button
                type="button"
                aria-label={concluido ? "Desmarcar cardio" : "Concluir cardio"}
                onClick={() => aoConcluirCardio(item.cardioId)}
                className={`grid h-9 w-9 place-items-center rounded-[8px] transition-all duration-200 ${
                  concluido
                    ? "bg-texto-primario text-texto-invertido animate-check-bounce"
                    : "bg-fundo border border-borda text-texto-secundario hover:border-texto-primario/40 hover:text-texto-primario"
                }`}
              >
                <Icone nome="check" tamanho={18} />
              </button>
            </div>
            <label className="mt-4 grid grid-cols-[1fr_88px_32px] items-center gap-2 text-sm text-texto-secundario">
              <span>Duração</span>
              <CampoNumerico
                valor={item.duracaoMinutos}
                minimo={0}
                aoAlterar={(duracaoMinutos) =>
                  aoAtualizarCardio(item.cardioId, { duracaoMinutos })
                }
                ariaLabel="Duracao em minutos"
                className="rounded-[8px] border border-borda-suave bg-fundo px-3 py-2 text-right text-lg font-medium tabular-nums text-texto-primario"
              />
              <span>min</span>
            </label>
            <label className="mt-3 block text-sm text-texto-secundario">
              <span className="mb-1 block">Nota</span>
              <input
                value={item.nota}
                onChange={(evento) => aoAtualizarCardio(item.cardioId, { nota: evento.target.value })}
                className="w-full rounded-[8px] border border-borda-suave bg-fundo px-3 py-2 text-texto-primario"
              />
            </label>
          </section>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 grid gap-2 border-t border-borda-suave bg-fundo/95 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={aoVoltarMusculacao}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-borda-suave bg-superficie text-sm font-medium text-texto-primario"
        >
          <Icone nome="halter" tamanho={16} />
          Voltar à musculação
        </button>
        <button
          type="button"
          onClick={aoFinalizar}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-acento text-sm font-medium text-texto-invertido"
        >
          <Icone nome="listaVerificacao" tamanho={16} />
          Finalizar treino
        </button>
      </div>
    </main>
  );
}
