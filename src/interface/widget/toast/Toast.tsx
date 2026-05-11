import { useEffect } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: { name: "listaVerificacao", color: "text-[#4ade80]" },
  error: { name: "fechar", color: "text-[#f87171]" },
  info: { name: "engrenagem", color: "text-[#fbbf24]" },
};

const bgMap = {
  success: "bg-[#1a472a] border-[#2d5a3d]",
  error: "bg-[#5c1a1a] border-[#7a2d2d]",
  info: "bg-[#1a1a1a] border-[#333]",
};

export function Toast({ id, message, type = "info", duration = 4000, onClose }: ToastProps) {
  const icon = iconMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-lg border shadow-lg
        min-w-[300px] max-w-[400px]
        ${bgMap[type]}
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <div className={icon.color}>
        <Icone nome={icon.name} tamanho={20} />
      </div>
      <p className="flex-1 text-sm text-[#f5f5f0]">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="p-1 text-[#888] hover:text-[#f5f5f0] hover:bg-white/10 rounded transition-colors"
        aria-label="Fechar"
      >
        <Icone nome="fechar" tamanho={16} />
      </button>
    </div>
  );
}
