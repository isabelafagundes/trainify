import { useEffect, useMemo, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import type {
  AbaFundo,
  ControleFundo,
} from "@/interface/page/area-logada/execucao/SeletorFundoResultado";
import {
  PRESETS_FUNDO,
  type IdPresetFundo,
} from "./presets-fundo";

const CHAVE_PRESET = "resultado-treino.preset";

export function useControleFundoResultado(aberto: boolean): ControleFundo {
  const [preset, setPreset] = useState<IdPresetFundo>("oceanic");
  const [foto, setFoto] = useState<{ dataUrl: string; escurecer: number } | null>(null);
  const [aba, setAba] = useState<AbaFundo>("gradientes");

  useEffect(() => {
    if (!aberto) return;
    void Preferences.get({ key: CHAVE_PRESET }).then(({ value }) => {
      if (PRESETS_FUNDO.some((item) => item.id === value)) {
        setPreset(value as IdPresetFundo);
      }
    });
  }, [aberto]);

  return useMemo<ControleFundo>(() => ({
    selecao: aba === "foto" && foto
      ? { tipo: "foto", dataUrl: foto.dataUrl, escurecer: foto.escurecer }
      : { tipo: "preset", preset },
    preset,
    foto,
    aba,
    escolherPreset: (id) => {
      setPreset(id);
      void Preferences.set({ key: CHAVE_PRESET, value: id });
    },
    trocarAba: setAba,
    escolherFoto: (dataUrl) => {
      setFoto((atual) => ({ dataUrl, escurecer: atual?.escurecer ?? 60 }));
      setAba("foto");
    },
    removerFoto: () => {
      setFoto(null);
      setAba("gradientes");
    },
    escurecer: (valor) => {
      setFoto((atual) => (atual ? { ...atual, escurecer: valor } : atual));
    },
  }), [aba, foto, preset]);
}

