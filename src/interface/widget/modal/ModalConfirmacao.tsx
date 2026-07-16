/* ═══════════════════════════════════════════
   Modal de Confirmação — Pezzo
   Componente customizado para confirmações de ações destrutivas
   ═══════════════════════════════════════════ */

import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  textoConfirmar: string;
  textoCancelar?: string;
  variant?: "perigo" | "atencao";
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  textoConfirmar,
  textoCancelar = "Cancelar",
  variant = "perigo",
  aoConfirmar,
  aoCancelar,
}: ModalConfirmacaoProps) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={aoCancelar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
      aria-describedby="modal-confirmacao-descricao"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        style={{ width: "min(420px, calc(100vw - 32px))" }}
        className="relative shrink-0 overflow-hidden bg-superficie rounded-3xl shadow-xl border border-borda animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-borda-suave">
          <h3
            id="modal-confirmacao-titulo"
            className="text-lg font-semibold font-display text-texto-primario"
          >
            {titulo}
          </h3>
          <button
            type="button"
            onClick={aoCancelar}
            className="shrink-0 p-2 -mr-2 text-texto-secundario hover:text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <Icone nome="fechar" tamanho={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-5 py-4">
          <p
            id="modal-confirmacao-descricao"
            className="text-sm text-texto-secundario leading-relaxed"
          >
            {descricao}
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col-reverse gap-3 px-5 py-4 border-t border-borda-suave sm:flex-row">
          <Botao
            variante="secundario"
            onClick={aoCancelar}
            className="flex-1 whitespace-nowrap"
          >
            {textoCancelar}
          </Botao>
          {variant === "perigo" ? (
            <button
              type="button"
              onClick={aoConfirmar}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap rounded-[10px] bg-perigo px-4 py-3 text-sm font-medium text-texto-invertido shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-perigo-hover hover:shadow-md active:scale-[0.97]"
            >
              {textoConfirmar}
            </button>
          ) : (
            <Botao
              variante="primario"
              onClick={aoConfirmar}
              className="flex-1 whitespace-nowrap"
            >
              {textoConfirmar}
            </Botao>
          )}
        </div>
      </div>
    </div>
  );
}
