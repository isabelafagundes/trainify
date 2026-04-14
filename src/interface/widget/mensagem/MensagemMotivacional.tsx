import { useState, useEffect } from "react";

interface PropriedadesMensagemMotivacional {
  contexto?: "inicio" | "treino" | "conclusao" | "streak" | "recorde";
  indiceStreak?: number;
}

interface MensagemMotivacional {
  texto: string;
  emoji: string;
}

const mensagens: Record<string, MensagemMotivacional[]> = {
  inicio: [
    { texto: "Bora treinar? 💪", emoji: "💪" },
    { texto: "Seu corpo agradece!", emoji: "🙌" },
    { texto: "Foco na disciplina!", emoji: "🎯" },
    { texto: "Mais um dia, mais uma conquista!", emoji: "⭐" },
    { texto: "Você é mais forte que ontem!", emoji: "🔥" },
    { texto: "Transforme esforço em orgulho!", emoji: "🏆" },
  ],
  treino: [
    { texto: "Excelente começo! 🚀", emoji: "🚀" },
    { texto: "Mantendo o ritmo! ⚡", emoji: "⚡" },
    { texto: "Você está imparável!", emoji: "🔥" },
    { texto: "Cada repetição conta!", emoji: "💯" },
    { texto: "Foco, respiração, execute!", emoji: "🎯" },
  ],
  conclusao: [
    { texto: "Treino completado! 🎉", emoji: "🎉" },
    { texto: "Missão cumprida! ✅", emoji: "✅" },
    { texto: "Orgulho desse treino! 🏅", emoji: "🏅" },
    { texto: "Mais um checked na lista!", emoji: "✨" },
    { texto: "Você é incrível! 🌟", emoji: "🌟" },
    { texto: "Descanso merecido! 😌", emoji: "😌" },
  ],
  streak: [
    { texto: "3 dias seguidos! Criando hábito!", emoji: "🔥" },
    { texto: "7 dias! Uma semana inteira!", emoji: "🏆" },
    { texto: "14 dias! Duas semanas!", emoji: "🚀" },
    { texto: "21 dias! Hábito formado!", emoji: "⭐" },
    { texto: "30 dias! Um mês! Consistência!", emoji: "👑" },
  ],
  recorde: [
    { texto: "Novo recorde pessoal! 🏆", emoji: "🏆" },
    { texto: "Você superou seus limites!", emoji: "🌟" },
    { texto: "Recorde batido! Histórico!", emoji: "🎉" },
    { texto: "Outro nível! Lendário!", emoji: "👑" },
  ],
};

const mensagensStreak: Record<number, MensagemMotivacional> = {
  3: { texto: "3 dias seguidos! Criando o hábito! 🔥", emoji: "🔥" },
  7: { texto: "Uma semana! Consistência é tudo! 🏆", emoji: "🏆" },
  14: { texto: "Duas semanas! Você é incrível! 🚀", emoji: "🚀" },
  21: { texto: "21 dias! Hábito formado! ⭐", emoji: "⭐" },
  30: { texto: "Um mês! Você é uma máquina! 👑", emoji: "👑" },
  60: { texto: "Dois meses! Nível outro! 💎", emoji: "💎" },
  100: { texto: "100 DIAS! ABSURDO! Você é imbatível! 🎊", emoji: "🎊" },
};

/**
 * Componente que mostra mensagens motivacionais variadas
 * Rotaciona entre mensagens baseadas no contexto
 */
export function MensagemMotivacional({
  contexto = "inicio",
  indiceStreak,
}: PropriedadesMensagemMotivacional) {
  const [mensagem, setMensagem] = useState<MensagemMotivacional>({ texto: "", emoji: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Selecionar mensagem baseada no contexto
    let mensagemSelecionada: MensagemMotivacional;

    if (contexto === "streak" && indiceStreak !== undefined) {
      // Verificar se há mensagem específica para o streak
      mensagemSelecionada =
        mensagensStreak[indiceStreak] ||
        mensagens.inicio[Math.floor(Math.random() * mensagens.inicio.length)];
    } else {
      // Selecionar mensagem aleatória do contexto
      const mensagensContexto = mensagens[contexto] ?? mensagens.inicio;
      mensagemSelecionada =
        mensagensContexto[Math.floor(Math.random() * mensagensContexto.length)];
    }

    setMensagem(mensagemSelecionada);

    // Animação de entrada
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [contexto, indiceStreak]);

  if (!mensagem.texto) return null;

  return (
    <div
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-full
        bg-superficie-suave
        border border-borda-suave
        text-sm font-medium text-texto-primario
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        shadow-sm
      `}
    >
      <span className="text-base">{mensagem.emoji}</span>
      <span>{mensagem.texto}</span>
    </div>
  );
}

/**
 * Hook para usar mensagens motivacionais programaticamente
 */
export function useMensagemMotivacional() {
  const [mensagem, setMensagem] = useState<MensagemMotivacional | null>(null);

  const mostrar = (contexto: keyof typeof mensagens = "inicio") => {
    const mensagensContexto = mensagens[contexto] ?? mensagens.inicio;
    const mensagemAleatoria =
      mensagensContexto[Math.floor(Math.random() * mensagensContexto.length)];
    setMensagem(mensagemAleatoria);

    // Limpar após alguns segundos
    setTimeout(() => setMensagem(null), 4000);
  };

  const limpar = () => setMensagem(null);

  return { mensagem, mostrar, limpar };
}
