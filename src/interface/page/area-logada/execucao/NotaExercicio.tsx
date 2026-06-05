interface NotaExercicioProps {
  nota: string;
  aoAtualizar: (nota: string) => void;
}

export function NotaExercicio({ nota, aoAtualizar }: NotaExercicioProps) {
  return (
    <label className="block">
      <span className="sr-only">Nota deste exercício</span>
      <textarea
        value={nota}
        onChange={(evento) => aoAtualizar(evento.target.value)}
        rows={3}
        placeholder="nota deste exercício..."
        className="w-full resize-none rounded-[8px] border border-borda-suave bg-superficie px-3 py-3 text-sm text-texto-primario placeholder:text-texto-sutil"
      />
    </label>
  );
}
