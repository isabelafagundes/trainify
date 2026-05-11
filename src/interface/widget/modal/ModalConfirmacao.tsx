/* ═══════════════════════════════════════════
   Modal de Confirmação — Trainify
   Componente customizado para confirmações de ações destrutivas
   ═══════════════════════════════════════════ */

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

  const coresBotao =
    variant === "perigo"
      ? "bg-error text-white hover:bg-error/90"
      : "bg-texto-primario text-white hover:bg-texto-primario/90";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={aoCancelar}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[350px] bg-superficie rounded-3xl shadow-xl border border-borda animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Conteúdo */}
        <div className="p-6">
          <h3 className="text-lg font-semibold font-display text-texto-primario mb-2">
            {titulo}
          </h3>
          <p className="text-sm text-texto-secundario leading-relaxed">
            {descricao}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            type="button"
            onClick={aoCancelar}
            className="flex-1 px-4 py-3 text-sm font-medium text-texto-primario bg-superficie-suave hover:bg-superficie-suave/80 rounded-xl transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${coresBotao}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
