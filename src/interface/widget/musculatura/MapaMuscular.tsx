import { NOMES_MUSCULOS, type AtivacaoMuscular, type MusculoId } from "@/domain/ativacao-muscular";

interface Props {
  ativacoes: AtivacaoMuscular[];
  compacto?: boolean;
  amplo?: boolean;
  className?: string;
}
type Classe = (musculo: MusculoId) => string;

const CORES = { 1: "fill-grafico/30 stroke-grafico/50", 2: "fill-grafico/60 stroke-grafico", 3: "fill-grafico-forte stroke-grafico-forte" } as const;
const CORPO = "M45 38Q29 43 25 61L15 110Q13 118 19 120Q25 121 28 113L38 75L42 128L35 188L40 241Q41 248 48 248Q54 247 54 240L55 191L60 144L65 191L66 240Q66 247 72 248Q79 248 80 241L85 188L78 128L82 75L92 113Q95 121 101 120Q107 118 105 110L95 61Q91 43 75 38Q60 44 45 38Z";
const corpoClasse = "fill-superficie-suave stroke-borda stroke-[1.2]";

export function MapaMuscular({ ativacoes, compacto = false, amplo = false, className = "" }: Props) {
  const niveis = new Map(ativacoes.map((ativacao) => [ativacao.musculo, ativacao.nivel]));
  const classe: Classe = (musculo) => `${niveis.has(musculo) ? CORES[niveis.get(musculo)!] : "fill-transparent stroke-transparent"} stroke-[.8] transition-colors`;
  return (
    <section className={`rounded-2xl border border-borda bg-superficie p-3 ${className}`} aria-label="Mapa de ativação muscular">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-semibold text-texto-primario">Ativação muscular</p>{!compacto && <p className="text-[11px] text-texto-sutil">Frente e costas</p>}</div>
        <div className="flex gap-1.5" aria-label="Intensidade"><i className="h-2.5 w-2.5 rounded-full bg-grafico/30"/><i className="h-2.5 w-2.5 rounded-full bg-grafico/60"/><i className="h-2.5 w-2.5 rounded-full bg-grafico-forte"/></div>
      </div>
      <div className={`mt-2 flex justify-center gap-2 ${compacto ? "h-32" : amplo ? "h-64" : "h-48"}`}><Frente classe={classe}/><Costas classe={classe}/></div>
      {!compacto && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-borda-suave pt-3">{[...ativacoes].sort((a,b) => b.nivel-a.nivel).map((a) => <span key={a.musculo} className="rounded-full bg-superficie-suave px-2 py-1 text-[11px] text-texto-secundario">{NOMES_MUSCULOS[a.musculo]} · {a.nivel}</span>)}</div>}
    </section>
  );
}

function Base({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 250" className="h-full w-auto" role="img">
      <ellipse className={corpoClasse} cx="60" cy="19" rx="14" ry="17"/>
      <path className={corpoClasse} d={CORPO}/>
      {children}
    </svg>
  );
}

function Frente({ classe }: { classe: Classe }) {
  return <Base>
    <path className={classe("peitoral")} d="M45 49Q52 42 59 47V68Q49 71 41 61ZM75 49Q68 42 61 47V68Q71 71 79 61Z"/>
    <path className={classe("deltoide")} d="M44 44Q34 46 30 56L40 61L49 46ZM76 44Q86 46 90 56L80 61L71 46Z"/>
    <path className={classe("biceps")} d="M38 61L31 86L38 88L42 64ZM82 61L89 86L82 88L78 64Z"/>
    <path className={classe("antebraco")} d="M29 89L20 112L27 114L36 92ZM91 89L100 112L93 114L84 92Z"/>
    <path className={classe("abdomen")} d="M49 72Q60 77 71 72L69 119Q60 125 51 119Z"/>
    <path className={classe("obliquos")} d="M43 70L49 74L51 119L43 125ZM77 70L71 74L69 119L77 125Z"/>
    <path className={classe("quadriceps")} d="M43 142Q37 163 38 187L54 188L58 148ZM77 142Q83 163 82 187L66 188L62 148Z"/>
    <path className={classe("adutores")} d="M54 143L59 147L55 184L50 164ZM66 143L61 147L65 184L70 164Z"/>
    <path className={classe("panturrilhas")} d="M38 190Q35 214 40 235L52 234L52 192ZM82 190Q85 214 80 235L68 234L68 192Z"/>
  </Base>;
}

function Costas({ classe }: { classe: Classe }) {
  return <Base>
    <path className={classe("deltoide")} d="M44 44Q34 46 30 56L40 61L49 46ZM76 44Q86 46 90 56L80 61L71 46Z"/>
    <path className={classe("trapezio")} d="M48 39L60 48L72 39L76 66L60 76L44 66Z"/>
    <path className={classe("costas")} d="M43 63L59 77L56 116L43 128L39 78ZM77 63L61 77L64 116L77 128L81 78Z"/>
    <path className={classe("triceps")} d="M38 61L31 86L38 88L42 64ZM82 61L89 86L82 88L78 64Z"/>
    <path className={classe("antebraco")} d="M29 89L20 112L27 114L36 92ZM91 89L100 112L93 114L84 92Z"/>
    <path className={classe("lombar")} d="M49 112L60 119L71 112L73 133L60 140L47 133Z"/>
    <path className={classe("gluteos")} d="M42 129Q60 122 60 143Q55 158 41 151ZM78 129Q60 122 60 143Q65 158 79 151Z"/>
    <path className={classe("posteriores")} d="M42 154Q36 174 38 188L54 188L58 155ZM78 154Q84 174 82 188L66 188L62 155Z"/>
    <path className={classe("panturrilhas")} d="M38 190Q35 214 40 235L52 234L52 192ZM82 190Q85 214 80 235L68 234L68 192Z"/>
  </Base>;
}
