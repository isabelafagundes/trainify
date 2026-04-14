interface PropriedadesChip {
  rotulo: string;
}

/** Chip compacto para grupos musculares */
export function Chip({ rotulo }: PropriedadesChip) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-texto-secundario bg-superficie-suave/80 transition-all duration-200 hover:bg-superficie-suave hover:text-texto-primario hover:scale-105 cursor-default">
      {rotulo}
    </span>
  );
}
