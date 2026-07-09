import { Icone } from "@/interface/widget/svg/Icone";

interface CampoCheckProps {
  marcado: boolean;
  aoAlterar: (marcado: boolean) => void;
  ariaLabel: string;
  /** 20px (padrão) ou 18px para linhas mais densas. */
  tamanho?: 18 | 20;
  className?: string;
}

/** Caixa de seleção do design system (preto/creme) — substitui a checkbox
    nativa (que renderiza azul do sistema). Selecionada = preenchida com
    acento + check invertido; vazia = borda que reage ao hover. */
export function CampoCheck({
  marcado,
  aoAlterar,
  ariaLabel,
  tamanho = 20,
  className = "",
}: CampoCheckProps) {
  const lado = tamanho === 18 ? "h-[18px] w-[18px]" : "h-5 w-5";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcado}
      aria-label={ariaLabel}
      onClick={() => aoAlterar(!marcado)}
      className={`grid ${lado} shrink-0 cursor-pointer place-items-center rounded-md border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${
        marcado
          ? "border-acento bg-acento text-texto-invertido"
          : "border-borda bg-superficie text-transparent hover:border-acento"
      } ${className}`}
    >
      <Icone nome="check" tamanho={tamanho === 18 ? 11 : 12} />
    </button>
  );
}
