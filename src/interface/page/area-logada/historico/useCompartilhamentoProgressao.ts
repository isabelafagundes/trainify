import { useState } from "react";
import type { ProgressaoCompartilhavel } from "@/application/compartilhamento/calcular-progressao-exercicio";
import { compartilharResultado } from "@/infrastructure/service/compartilhar-resultado.service";
import type { SelecaoFundo } from "@/interface/widget/fundo-resultado/presets-fundo";
import { desenharCardProgressao } from "./desenhar-card-progressao";

function nomeArquivoSeguro(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useCompartilhamentoProgressao(
  progressao: ProgressaoCompartilhavel,
  fundo: SelecaoFundo,
) {
  const [compartilhando, setCompartilhando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  return {
    compartilhando,
    erro,
    compartilhar: async () => {
      if (compartilhando) return;
      setCompartilhando(true);
      setErro(null);

      try {
        const blob = await desenharCardProgressao(progressao, fundo);
        await compartilharResultado(
          blob,
          `kynori-progressao-${nomeArquivoSeguro(progressao.nome)}.jpg`,
          {
            titulo: `Minha progressão em ${progressao.nome}`,
            texto: `Minha evolução em ${progressao.nome} no Kynori 💪`,
            tituloDialogo: "Compartilhar progressão",
          },
        );
      } catch (causa) {
        setErro(
          causa instanceof Error
            ? causa.message
            : "Não foi possível compartilhar. Tente novamente.",
        );
      } finally {
        setCompartilhando(false);
      }
    },
  };
}
