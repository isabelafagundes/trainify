import { useEffect, useRef } from "react";
import { desenharFundo } from "./fundo-resultado.renderer";
import type { IdPresetFundo } from "./presets-fundo";

export function FundoResultado({ preset, seed, animado = true }: { preset: IdPresetFundo; seed: string; animado?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current; if(!canvas) return; const ctx=canvas.getContext("2d"); if(!ctx) return; let frame=0; let ativo=true;
    const reduzir=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const render=(tempo=0)=>{ const r=canvas.getBoundingClientRect(); const dpr=Math.min(devicePixelRatio||1,2); const w=Math.max(1,Math.round(r.width*dpr)); const h=Math.max(1,Math.round(r.height*dpr)); if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;} desenharFundo(ctx,w,h,preset,seed,tempo); if(animado&&!reduzir&&ativo&&!document.hidden) frame=requestAnimationFrame(render); };
    const vis=()=>{cancelAnimationFrame(frame); if(!document.hidden&&ativo) render(performance.now());}; document.addEventListener("visibilitychange",vis); render(); return()=>{ativo=false;cancelAnimationFrame(frame);document.removeEventListener("visibilitychange",vis);};
  },[preset,seed,animado]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
