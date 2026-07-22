import { obterPreset, type IdPresetFundo } from "./presets-fundo";

function hash(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; }
function rgba(c: [number, number, number, number]) { return `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`; }

export function desenharFundo(ctx: CanvasRenderingContext2D, largura: number, altura: number, presetId: IdPresetFundo, seed: string, tempo = 0) {
  const p = obterPreset(presetId); const s = hash(seed); ctx.clearRect(0, 0, largura, altura);
  const base = ctx.createLinearGradient(0, 0, largura, altura); base.addColorStop(0, rgba(p.cores[0])); base.addColorStop(.55, rgba(p.cores[1])); base.addColorStop(1, rgba(p.cores[2])); ctx.fillStyle = base; ctx.fillRect(0, 0, largura, altura);
  const x = largura * (.25 + .45 * s + Math.sin(tempo * .0002 * p.velocidade) * .08); const y = altura * (.2 + .5 * (1-s)); const glow = ctx.createRadialGradient(x,y,0,x,y,Math.max(largura,altura)*.7); glow.addColorStop(0, rgba(p.cores[3])); glow.addColorStop(1,"rgba(0,0,0,0)"); ctx.globalAlpha=.55; ctx.fillStyle=glow; ctx.fillRect(0,0,largura,altura); ctx.globalAlpha=1;
  const step = Math.max(4, Math.round(Math.min(largura,altura)/270)); for(let yy=0;yy<altura;yy+=step) for(let xx=0;xx<largura;xx+=step) { const n=((xx*17+yy*31+Math.floor(s*997))%29)/29; ctx.fillStyle=`rgba(255,255,255,${n*p.grao})`; ctx.fillRect(xx,yy,1,1); }
}
