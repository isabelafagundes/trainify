import { useRef } from "react";
import { PRESETS_FUNDO, type Cor, type IdPresetFundo, type SelecaoFundo } from "@/interface/widget/fundo-resultado/presets-fundo";
import { Icone } from "@/interface/widget/svg/Icone";

export type AbaFundo = "gradientes" | "foto";

/** Estado + ações do fundo do card, elevados no OverlayFinalizado. */
export interface ControleFundo {
  selecao: SelecaoFundo;
  preset: IdPresetFundo;
  foto: { dataUrl: string; escurecer: number } | null;
  aba: AbaFundo;
  escolherPreset: (id: IdPresetFundo) => void;
  trocarAba: (aba: AbaFundo) => void;
  escolherFoto: (dataUrl: string) => void;
  removerFoto: () => void;
  escurecer: (valor: number) => void;
}

function css(cor: Cor) { return `rgba(${cor.join(",")})`; }

export function SeletorFundoResultado({ ctrl }: { ctrl: ControleFundo }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abrirPicker = () => inputRef.current?.click();
  const aoSelecionarArquivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite reescolher o mesmo arquivo
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => ctrl.escolherFoto(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={aoSelecionarArquivo} />

      {/* Abas Gradientes | Foto */}
      <div role="tablist" aria-label="Tipo de fundo" className="mb-4 flex gap-1 rounded-[12px] bg-superficie-suave p-1">
        {(["gradientes", "foto"] as const).map((aba) => {
          const ativa = ctrl.aba === aba;
          return (
            <button
              key={aba}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => ctrl.trocarAba(aba)}
              className={`flex-1 rounded-[9px] px-3 py-2 text-sm font-medium transition-colors ${ativa ? "bg-superficie text-texto-primario shadow-sm" : "text-texto-secundario hover:text-texto-primario"}`}
            >
              {aba === "gradientes" ? "Gradientes" : "Foto"}
            </button>
          );
        })}
      </div>

      {ctrl.aba === "gradientes" ? (
        <div className="scrollbar-mobile-hidden flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible" aria-label="Escolher gradiente">
          {PRESETS_FUNDO.map((preset) => {
            const selecionado = ctrl.selecao.tipo === "preset" && ctrl.preset === preset.id;
            return (
              <button key={preset.id} type="button" onClick={() => ctrl.escolherPreset(preset.id)} aria-pressed={selecionado} className={`w-[76px] shrink-0 rounded-[10px] border bg-superficie p-1.5 text-left transition-all duration-200 md:w-full ${selecionado ? "border-acento ring-1 ring-acento" : "border-borda hover:border-texto-sutil"}`}>
                <span className="relative block h-12 overflow-hidden rounded-[7px]" style={{ background: `radial-gradient(circle at 70% 20%, ${css(preset.cores[3])}, transparent 58%), linear-gradient(135deg, ${css(preset.cores[0])}, ${css(preset.cores[2])})` }}>{selecionado && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-superficie text-[10px] font-bold text-texto-primario shadow-sm">✓</span>}</span>
                <span className={`mt-1.5 block truncate px-0.5 text-[11px] ${selecionado ? "font-semibold text-texto-primario" : "text-texto-secundario"}`}>{preset.nome}</span>
              </button>
            );
          })}
        </div>
      ) : ctrl.foto ? (
        <div>
          {/* Linha compacta da foto selecionada */}
          <div className="flex items-center gap-3 rounded-[12px] border border-borda bg-superficie p-2.5">
            <img src={ctrl.foto.dataUrl} alt="" className="h-[52px] w-[52px] shrink-0 rounded-[8px] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-texto-primario">Foto selecionada</p>
              <p className="mt-0.5 text-xs text-texto-secundario">Da galeria ou arquivos</p>
            </div>
            <button type="button" onClick={abrirPicker} className="rounded-[8px] border border-borda bg-superficie px-3 py-2 text-[13px] font-medium text-texto-secundario transition-colors hover:text-texto-primario">Trocar</button>
            <button type="button" onClick={ctrl.removerFoto} aria-label="Remover foto" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-borda bg-superficie text-texto-secundario transition-colors hover:text-perigo"><Icone nome="lixeira" tamanho={16} /></button>
          </div>
          {/* Escurecer fundo (legibilidade) */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="escurecer-fundo" className="text-sm font-semibold text-texto-primario">Escurecer fundo</label>
              <span className="text-xs tabular-nums text-texto-sutil">{ctrl.foto.escurecer}%</span>
            </div>
            <input id="escurecer-fundo" type="range" min={0} max={100} value={ctrl.foto.escurecer} onChange={(evento) => ctrl.escurecer(Number(evento.target.value))} className="w-full accent-acento" />
            <p className="mt-2 text-xs text-texto-sutil">Mantém o texto do card legível sobre fotos claras.</p>
          </div>
        </div>
      ) : (
        /* Estado vazio: adicionar foto */
        <button type="button" onClick={abrirPicker} className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-borda bg-superficie p-3 text-left transition-colors hover:border-texto-sutil">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-acento-suave text-texto-secundario"><Icone nome="imagem" tamanho={20} /></span>
          <span>
            <span className="block text-sm font-semibold text-texto-primario">Adicionar foto</span>
            <span className="mt-0.5 block text-xs text-texto-secundario">Galeria ou arquivos · JPG, PNG</span>
          </span>
        </button>
      )}
    </div>
  );
}
