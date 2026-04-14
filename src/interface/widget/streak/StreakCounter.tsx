import { useState, useEffect } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesStreakCounter {
  diasConsecutivos: number;
  recordePessoal?: number;
  tamanho?: "pequeno" | "medio" | "grande";
}

const mensagensMotivacionais: Record<number, string[]> = {
  0: ["Vamos começar! 🌱", "Primeiro passo: hoje 💪", "Sua jornada começa agora"],
  1: ["Começou! 1 dia ✨", "Ótimo começo! 🎯", "Você iniciou!"],
  3: ["3 dias seguidos! 🔥", "Criando o hábito! ⚡", "Imparável!"],
  7: ["Uma semana! 🏆", "7 dias consecutivos! 💪", "Consistência é tudo"],
  14: ["Duas semanas! 🚀", "14 dias de compromisso 🌟", "Você é incrível!"],
  21: ["21 dias! Hábito formado! 🎉", "Três semanas! ⭐", "Incrível consistência!"],
  30: ["Um mês inteiro! 👑", "30 dias consecutivos! 🏅", "Lendário!"],
  60: ["Dois meses! 🌈", "60 dias! Nível outro! 💎", "Você é uma máquina!"],
  100: ["100 DIAS! 🎊", "CENTENA! 🎇", "ABSURDO! Você é imbatível!"],
};

function pegarMensagemMotivacional(dias: number): string {
  const chaves = Object.keys(mensagensMotivacionais).map(Number).sort((a, b) => b - a);
  for (const chave of chaves) {
    if (dias >= chave && mensagensMotivacionais[chave]) {
      const mensagens = mensagensMotivacionais[chave];
      return mensagens[Math.floor(Math.random() * mensagens.length)];
    }
  }
  return "Continue assim! 💪";
}

const tamanhos = {
  pequeno: {
    container: "h-9 px-3 gap-2",
    numero: "text-lg",
    icone: "text-sm",
    mensagem: "text-[10px]",
  },
  medio: {
    container: "h-11 px-4 gap-2.5",
    numero: "text-xl",
    icone: "text-base",
    mensagem: "text-xs",
  },
  grande: {
    container: "h-14 px-5 gap-3",
    numero: "text-2xl",
    icone: "text-lg",
    mensagem: "text-sm",
  },
};

export function StreakCounter({
  diasConsecutivos,
  recordePessoal,
  tamanho = "medio",
}: PropriedadesStreakCounter) {
  const [mostrarMensagem, setMostrarMensagem] = useState(false);

  // Mostrar mensagem motivacional brevemente ao montar
  useEffect(() => {
    if (diasConsecutivos > 0) {
      setMostrarMensagem(true);
      const timer = setTimeout(() => setMostrarMensagem(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [diasConsecutivos]);

  const estilo = tamanhos[tamanho];
  const mensagem = pegarMensagemMotivacional(diasConsecutivos);
  const ehRecorde = recordePessoal !== undefined && diasConsecutivos >= recordePessoal && diasConsecutivos > 0;
  const quebrouRecorde = recordePessoal !== undefined && diasConsecutivos > recordePessoal;

  // Cor do ícone de fogo — escala sutil de cinza a laranja queimado
  const obterEstiloFogo = () => {
    if (diasConsecutivos === 0) {
      return "text-texto-sutil opacity-50";
    } else if (diasConsecutivos < 3) {
      return "text-texto-secundario";
    } else if (diasConsecutivos < 7) {
      return "text-[oklch(0.55_0.12_45)]";
    } else {
      return "text-[oklch(0.50_0.14_40)]";
    }
  };

  const estiloFogo = obterEstiloFogo();

  return (
    <div className="relative">
      {/* Container principal - Notion-like, sutil */}
      <div
        className={`
          inline-flex items-center justify-center gap-2
          rounded-[8px]
          bg-superficie-suave
          border border-borda-suave
          ${estilo.container}
          transition-colors duration-300 ease-out
          ${quebrouRecorde ? "ring-1 ring-acento ring-offset-1" : ""}
        `}
      >
        {/* Ícone de fogo */}
        <div className="flex-shrink-0">
          <Icone
            nome="fogo"
            tamanho={tamanho === "pequeno" ? 16 : tamanho === "medio" ? 18 : 20}
            className={`
              ${estilo.icone}
              ${estiloFogo}
              transition-colors duration-300
            `}
          />
        </div>

        {/* Contador */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className={`${estilo.numero} font-semibold tabular-nums text-texto-primario`}>
              {diasConsecutivos}
            </span>
            <span className={`text-texto-sutil ${tamanho === "grande" ? "text-sm" : "text-xs"}`}>
              {diasConsecutivos === 1 ? "dia" : "dias"}
            </span>
          </div>

          {/* Indicador de recorde - sutil */}
          {ehRecorde && recordePessoal !== undefined && recordePessoal > 0 && (
            <span className="text-[9px] text-texto-sutil">
              {quebrouRecorde ? "recorde!" : "seu recorde"}
            </span>
          )}
        </div>

        {/* Badge de novo recorde - mais discreto */}
        {quebrouRecorde && (
          <div className="absolute -top-1 -right-1 bg-acento text-texto-invertido text-[8px] font-medium px-1.5 py-0.5 rounded-full">
            novo
          </div>
        )}
      </div>

      {/* Mensagem motivacional - mais discreta */}
      {mostrarMensagem && diasConsecutivos > 0 && (
        <div
          className={`
            absolute -bottom-5 left-1/2 -translate-x-1/2
            whitespace-nowrap text-[10px] font-medium
            text-texto-secundario bg-superficie
            border border-borda-suave
            px-2 py-0.5 rounded-md
            animate-in fade-in slide-in-from-top-2 duration-300
            shadow-sm
          `}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}
