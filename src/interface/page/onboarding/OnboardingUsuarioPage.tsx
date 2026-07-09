/* ═══════════════════════════════════════════
   Onboarding — Primeiro acesso ao Trainify
   ═══════════════════════════════════════════ */

import { FormularioPerfil } from "@/interface/widget/formulario/FormularioPerfil";
import { usuarioManager } from "@/application/state/usuario.state";

interface OnboardingUsuarioPageProps {
  aoConcluir: () => void;
}

export function OnboardingUsuarioPage({ aoConcluir }: OnboardingUsuarioPageProps) {
  function handleSalvar(dados: { nome: string; avatarEmoji: string }) {
    usuarioManager.definirUsuario(dados);
    aoConcluir();
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-fundo">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-6 pb-[max(var(--safe-bottom),24px)] pt-[max(var(--safe-top),40px)]">
        <header className="animate-slide-up">
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-texto-sutil">
            Pezzo
          </span>
        </header>

        <div className="mt-12 animate-slide-up [animation-delay:80ms]">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-texto-primario">
            Bora montar
            <br />
            seu perfil.
          </h1>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-texto-secundario">
            Antes do primeiro treino, conta quem é você. Dá pra mudar quando quiser.
          </p>
        </div>

        <div className="mt-10 flex-1 animate-slide-up [animation-delay:160ms]">
          <FormularioPerfil
            textoBotao="Começar a treinar"
            aoSalvar={handleSalvar}
          />
        </div>
      </div>
    </div>
  );
}
