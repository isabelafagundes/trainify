import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesEstadoVazio {
  icone?: string;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  contexto?: "programa" | "ficha" | "historico" | "treino";
}

const mensagensPorContexto: Record<string, { titulos: string[]; descricoes: string[] }> = {
  programa: {
    titulos: [
      "Sua jornada começa aqui 💪",
      "Primeiro passo: hoje 🌱",
      "Tudo pronto pra começar!",
      "Vamos criar seu programa?",
      "Seu melhor você espera!",
    ],
    descricoes: [
      "Crie um programa com suas fichas de treino e comece a registrar seus treinos.",
      "Organize seus treinos e acompanhe sua evolução dia a dia.",
      "Monte seu plano de treinos e vamos juntos atingir seus objetivos!",
      "Programas ajudam a manter o foco. Vamos criar o seu?",
      "Estrutura é a chave do progresso. Comece agora!",
    ],
  },
  ficha: {
    titulos: [
      "Hora de treinar! 🏋️",
      "Qual treino hoje?",
      "Bora suar a camisa!",
      "Seu corpo agradece!",
      "Foco na disciplina!",
    ],
    descricoes: [
      "Escolha sua ficha e mãos à obra!",
      "Cada treino te aproxima do seu objetivo.",
      "Consistência > Intensidade. Comece agora!",
      "O único treino ruim é o que não acontece.",
      "Seu futuro eu agradece o treino de hoje!",
    ],
  },
  historico: {
    titulos: [
      "Ainda sem histórico 📊",
      "Seus primeiros registros!",
      "Comece a acompanhar seu progresso",
    ],
    descricoes: [
      "Registre seus treinos para ver sua evolução ao longo do tempo.",
      "Cada treino registrado é um passo a mais na sua jornada.",
      "Histórico ajuda a identificar padrões e melhorar resultados.",
    ],
  },
  treino: {
    titulos: [
      "Nenhum treino iniciado hoje",
      "Primeiro treino do dia?",
      "Vamos começar!",
    ],
    descricoes: [
      "Inicie seu primeiro treino do dia.",
      "Clique em iniciar e mãos à obra!",
      "Seu corpo está pronto. E você?",
    ],
  },
};

function pegarMensagemVariavel(contexto: string = "programa"): { titulo: string; descricao: string } {
  const mensagens = mensagensPorContexto[contexto] ?? mensagensPorContexto.programa;

  // Selecionar mensagem baseada no dia do mês para variar mas manter consistência no dia
  const diaDoMes = new Date().getDate();
  const indice = diaDoMes % mensagens.titulos.length;

  return {
    titulo: mensagens.titulos[indice],
    descricao: mensagens.descricoes[indice],
  };
}

/**
 * Estado vazio com mensagens motivacionais variáveis e animações sutis
 * Mais encorajador e menos "vazio" que o EstadoVazio padrão
 */
export function EstadoVazioDelight({
  icone,
  titulo,
  descricao,
  acao,
  contexto = "programa",
}: PropriedadesEstadoVazio) {
  const [mensagem] = useState(() => pegarMensagemVariavel(contexto));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const tituloFinal = titulo || mensagem.titulo;
  const descricaoFinal = descricao || mensagem.descricao;

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Ícone */}
      {icone && (
        <div className="mb-4 text-texto-sutil">
          <Icone nome={icone} tamanho={48} />
        </div>
      )}

      {/* Título */}
      <h3 className="text-base font-semibold text-texto-primario mb-1">
        {tituloFinal}
      </h3>

      {/* Descrição com spacing otimizado */}
      <p className="text-sm text-texto-secundario mb-5 max-w-[260px] leading-relaxed">
        {descricaoFinal}
      </p>

      {/* Ação */}
      {acao && <div>{acao}</div>}

      {/* Mensagem extra motivacional (só aparece em alguns contextos) */}
      {(contexto === "programa" || contexto === "ficha") && (
        <p className="text-xs text-texto-sutil mt-4 italic">
          {contexto === "programa"
            ? "🌟 Cada jornada começa com um único passo"
            : "🔥 A consistência é a chave do progresso"}
        </p>
      )}
    </div>
  );
}
