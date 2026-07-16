/* ═══════════════════════════════════════════
   Componente Input — campo canônico de formulário

   Fonte de verdade de todo campo de texto do app.
   Todas as variantes herdam CAMPO_BASE (contraste,
   borda, raio, foco) de campo.tokens.ts — o estilo
   muda em um lugar só.

   Variantes (`tipo`):
   - "text" / "number" → linha única, alinhada à esquerda
   - "textarea"        → multilinha
   - "busca"           → linha com lupa à esquerda + botão limpar
   - "select"          → dropdown com chevron
   Campo numérico compacto ("caixa") vive em CampoNumerico.
   ═══════════════════════════════════════════ */

import { CAMPO_BASE, CAMPO_BASE_ERRO } from "./campo.tokens";
import { Icone } from "@/interface/widget/svg/Icone";

interface BaseInputProps {
  label?: string;
  erro?: string;
  ajuda?: string;
  placeholder?: string;
  className?: string;
}

interface InputProps extends BaseInputProps {
  tipo?: "text" | "number";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseInputProps {
  tipo: "textarea";
  linhas?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface BuscaProps extends BaseInputProps {
  tipo: "busca";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Habilita o botão de limpar (aparece quando há texto). */
  aoLimpar?: () => void;
  ariaLabel?: string;
}

interface SelectProps extends BaseInputProps {
  tipo: "select";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

type Props = InputProps | TextareaProps | BuscaProps | SelectProps;

function Campo({ label, ajuda, erro, children }: {
  label?: string;
  ajuda?: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-texto-primario">{label}</label>
      )}
      {children}
      {ajuda && !erro && <p className="text-xs text-texto-secundario">{ajuda}</p>}
      {erro && <p className="text-xs text-perigo">{erro}</p>}
    </div>
  );
}

export function Input(props: Props) {
  const { label, erro, ajuda, placeholder, className } = props;
  const base = (erro ? CAMPO_BASE_ERRO : CAMPO_BASE).trim();

  if (props.tipo === "textarea") {
    const { linhas, value, onChange } = props;
    return (
      <Campo label={label} ajuda={ajuda} erro={erro}>
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${base} w-full resize-none px-4 py-3 text-base ${className || ""}`}
          rows={linhas || 3}
        />
      </Campo>
    );
  }

  if (props.tipo === "busca") {
    const { value, onChange, aoLimpar, ariaLabel } = props;
    return (
      <Campo label={label} ajuda={ajuda} erro={erro}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-label={ariaLabel || placeholder}
            className={`${base} w-full py-3 pl-10 ${aoLimpar ? "pr-10" : "pr-4"} text-sm ${className || ""}`}
          />
          <Icone
            nome="busca"
            tamanho={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-sutil"
          />
          {aoLimpar && value && (
            <button
              type="button"
              onClick={aoLimpar}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-texto-sutil transition-colors hover:bg-superficie-hover hover:text-texto-primario"
            >
              <Icone nome="fechar" tamanho={16} />
            </button>
          )}
        </div>
      </Campo>
    );
  }

  if (props.tipo === "select") {
    const { value, onChange, children } = props;
    return (
      <Campo label={label} ajuda={ajuda} erro={erro}>
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className={`${base} w-full cursor-pointer appearance-none px-4 py-3 pr-10 text-sm ${className || ""}`}
          >
            {children}
          </select>
          <Icone
            nome="setaBaixo"
            tamanho={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-sutil"
          />
        </div>
      </Campo>
    );
  }

  const { tipo, value, onChange } = props;
  return (
    <Campo label={label} ajuda={ajuda} erro={erro}>
      <input
        type={tipo || "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${base} w-full px-4 py-3 text-base ${className || ""}`}
      />
    </Campo>
  );
}
