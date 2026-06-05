import { Icone } from "@/interface/widget/svg/Icone";

interface NavegacaoExerciciosProps {
  indiceAtual: number;
  total: number;
  ultimoExercicio: boolean;
  aoAnterior: () => void;
  aoProximo: () => void;
  aoFinalizar: () => void;
}

export function NavegacaoExercicios({
  indiceAtual,
  total,
  ultimoExercicio,
  aoAnterior,
  aoProximo,
  aoFinalizar,
}: NavegacaoExerciciosProps) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 bg-fundo/95 px-4 pb-4 pt-3 backdrop-blur border-t border-borda-suave">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={aoAnterior}
          disabled={indiceAtual === 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-borda-suave bg-superficie px-3 py-2 text-sm font-medium text-texto-primario disabled:opacity-35"
        >
          <Icone nome="setaEsquerda" tamanho={16} />
          Anterior
        </button>
        {ultimoExercicio ? (
          <button
            type="button"
            onClick={aoFinalizar}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-acento px-3 py-2 text-sm font-medium text-texto-invertido"
          >
            <Icone nome="listaVerificacao" tamanho={16} />
            Finalizar
          </button>
        ) : (
          <button
            type="button"
            onClick={aoProximo}
            disabled={indiceAtual >= total - 1}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-acento px-3 py-2 text-sm font-medium text-texto-invertido disabled:opacity-35"
          >
            Próximo
            <Icone nome="setaDireita" tamanho={16} />
          </button>
        )}
      </div>
      {!ultimoExercicio ? (
        <button
          type="button"
          onClick={aoFinalizar}
          className="mt-2 inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-[8px] text-sm font-medium text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario"
        >
          <Icone nome="listaVerificacao" tamanho={15} />
          Finalizar treino
        </button>
      ) : null}
    </footer>
  );
}
