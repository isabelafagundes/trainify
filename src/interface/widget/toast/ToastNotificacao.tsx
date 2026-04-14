import { useEffect, useState } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesToast {
  mensagem: string;
  tipo?: "sucesso" | "info" | "celebracao";
  duracao?: number;
  aoFechar?: () => void;
}

const estilosTipo = {
  sucesso: {
    fundo: "bg-superficie-suave border-borda-suave",
    icone: "text-texto-primario",
    nomeIcone: "check" as const,
  },
  info: {
    fundo: "bg-superficie border-borda",
    icone: "text-texto-secundario",
    nomeIcone: "info" as const,
  },
  celebracao: {
    fundo: "bg-superficie-suave border-borda-suave",
    icone: "text-texto-primario",
    nomeIcone: "estrela" as const,
  },
};

export function ToastNotificacao({
  mensagem,
  tipo = "info",
  duracao = 3000,
  aoFechar,
}: PropriedadesToast) {
  const [visivel, setVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const estilo = estilosTipo[tipo];

  useEffect(() => {
    // Animação de entrada
    setVisivel(true);

    // Iniciar saída após duração
    const timerSaida = setTimeout(() => {
      setSaindo(true);
    }, duracao);

    // Remover após animação de saída
    const timerRemocao = setTimeout(() => {
      setVisivel(false);
      aoFechar?.();
    }, duracao + 300);

    return () => {
      clearTimeout(timerSaida);
      clearTimeout(timerRemocao);
    };
  }, [duracao, aoFechar]);

  if (!visivel) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl
        border shadow-lg
        transition-all duration-300 ease-out
        ${estilo.fundo}
        ${saindo ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}
      `}
    >
      {/* Ícone com animação */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full
          flex items-center justify-center
          ${estilo.icone}
          ${tipo === "celebracao" ? "animate-pulse" : ""}
          ${tipo === "sucesso" ? "animate-[checkBounce_0.5s_ease-out]" : ""}
        `}
      >
        <Icone nome={estilo.nomeIcone} tamanho={18} />
      </div>

      {/* Mensagem */}
      <p className="text-sm font-medium text-texto-primario max-w-[280px]">
        {mensagem}
      </p>

      {/* Indicador de progresso */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20"
        style={{
          animation: `shrink ${duracao}ms linear`,
        }}
      />
    </div>
  );
}

// Hook para usar o toast facilmente
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; mensagem: string; tipo: "sucesso" | "info" | "celebracao" }>>([]);

  const mostrar = (mensagem: string, tipo: "sucesso" | "info" | "celebracao" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
  };

  const remover = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const Container = () => (
    <>
      {toasts.map((toast) => (
        <ToastNotificacao
          key={toast.id}
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          aoFechar={() => remover(toast.id)}
        />
      ))}
    </>
  );

  return { mostrar, Container };
}
