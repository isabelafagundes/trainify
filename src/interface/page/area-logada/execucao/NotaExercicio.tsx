import { useState } from "react";
import { Icone } from "@/interface/widget/svg/Icone";
import { CAMPO_BASE } from "@/interface/widget/formulario/campo.tokens";

interface NotaExercicioProps {
  nota: string;
  aoAtualizar: (nota: string) => void;
  rotulo?: string;
  /** "colapsavel" (mobile: linha que expande) ou "aberta" (painel lg). */
  variante?: "colapsavel" | "aberta";
}

export function NotaExercicio({
  nota,
  aoAtualizar,
  rotulo = "nota deste exercício",
  variante = "colapsavel",
}: NotaExercicioProps) {
  const [aberta, setAberta] = useState(false);

  const campo = (
    <label className="block">
      <span className="sr-only">{rotulo}</span>
      <textarea
        value={nota}
        onChange={(evento) => aoAtualizar(evento.target.value)}
        rows={3}
        placeholder={`${rotulo}...`}
        className={`${CAMPO_BASE.trim()} w-full resize-none px-3 py-2.5 text-sm`}
      />
    </label>
  );

  if (variante === "aberta") {
    return (
      <section className="rounded-2xl border border-borda bg-superficie px-3.5 py-3">
        <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-texto-sutil">
          <Icone nome="nota" tamanho={13} /> {rotulo}
        </div>
        {campo}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-borda bg-superficie">
      <button
        type="button"
        onClick={() => setAberta((atual) => !atual)}
        aria-expanded={aberta}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-3 text-left text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-texto-primario"
      >
        <Icone nome="nota" tamanho={15} />
        {rotulo}
        {nota && !aberta ? (
          <span className="min-w-0 flex-1 truncate text-texto-sutil">· {nota}</span>
        ) : (
          <span className="flex-1" />
        )}
        <Icone
          nome="setaBaixo"
          tamanho={14}
          className={`shrink-0 transition-transform ${aberta ? "rotate-180" : ""}`}
        />
      </button>
      {aberta ? <div className="px-3 pb-3">{campo}</div> : null}
    </section>
  );
}
