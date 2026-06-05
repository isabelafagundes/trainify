/* ═══════════════════════════════════════════
   Componente Input — Formulários
   ═══════════════════════════════════════════ */

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

type Props = InputProps | TextareaProps;

function isTextarea(props: Props): props is TextareaProps {
  return props.tipo === "textarea";
}

export function Input(props: Props) {
  const { label, erro, ajuda } = props;

  const classesInput = `
    w-full px-4 py-3
    bg-superficie
    border ${erro ? "border-error" : "border-borda"}
    rounded-[10px]
    text-base text-texto-primario placeholder:text-texto-sutil
    transition-all duration-200 ease-out
    focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  if (isTextarea(props)) {
    const { linhas, value, onChange, placeholder, className } = props;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-texto-primario">
            {label}
          </label>
        )}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={classesInput.trim() + " " + (className || "")}
          rows={linhas || 3}
        />
        {ajuda && !erro && <p className="text-xs text-texto-secundario">{ajuda}</p>}
        {erro && <p className="text-xs text-error">{erro}</p>}
      </div>
    );
  }

  const { tipo, value, onChange, placeholder, className: customClassName } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-texto-primario">
          {label}
        </label>
      )}
      <input
        type={tipo || "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={classesInput.trim() + " " + (customClassName || "")}
      />
      {ajuda && !erro && <p className="text-xs text-texto-secundario">{ajuda}</p>}
      {erro && <p className="text-xs text-error">{erro}</p>}
    </div>
  );
}
