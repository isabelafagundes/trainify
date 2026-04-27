interface PropriedadesChip {
  rotulo: string;
  tamanho?: "pequeno" | "normal";
  ativo?: boolean;
  aoClicar?: () => void;
}

/** Chip compacto para grupos musculares */
export function Chip({
  rotulo,
  tamanho = "normal",
  ativo = false,
  aoClicar
}: PropriedadesChip) {
  const classes = [
    "inline-flex items-center justify-center",
    tamanho === "pequeno" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
    "rounded-md transition-all duration-200 cursor-pointer",
    ativo
      ? "bg-acento text-texto-invertido"
      : "bg-superficie-suave/80 text-texto-secundario hover:bg-superficie-suave hover:text-texto-primario hover:scale-105",
  ].join(" ");

  return (
    <span onClick={aoClicar} className={classes}>
      {rotulo}
    </span>
  );
}
